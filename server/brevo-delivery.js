import { BrevoError, createBrevoTrialClient, submissionReference, trialEligible } from './brevo.js';

// Independent delivery receipts keep a Brevo outage from blocking Reach or the form.
export function createBrevoDelivery({ store, client = createBrevoTrialClient(), eligible = trialEligible, now = Date.now }) {
  let running, timer;
  async function deliver() {
    const db = store();
    await db.withLock('brevo-trial-delivery', async () => {
      const records = (await db.findForms()).filter(r => r.brevoTrial === true && eligible(r.email) && ['queued', 'received'].includes(r.status)).sort((a, b) => a.at.localeCompare(b.at));
      for (const record of records) {
        const key = 'brevo-trial/' + submissionReference(record);
        let receipt = await db.getJSON(key) || {};
        if (receipt.status === 'received' || receipt.nextAttemptAt > now()) continue;
        const checkpoint = async value => { await db.setJSON(key, value); receipt = value; };
        try {
          const result = await client.submit(record, receipt, checkpoint);
          await checkpoint({ ...result, status: 'received', deliveredAt: new Date(now()).toISOString(), nextAttemptAt: null, code: null });
        } catch (error) {
          const attempts = (receipt.attempts || 0) + 1;
          const code = error instanceof BrevoError ? error.code : 'brevo_delivery_error';
          await checkpoint({ ...receipt, attempts, status: 'queued', code, nextAttemptAt: now() + Math.min(300000, 5000 * 2 ** Math.min(attempts - 1, 6)) });
          console.error('Brevo trial delivery delayed:', code);
        }
      }
    });
  }
  function kick() {
    if (!running) running = deliver().catch(error => {
      if (error.code !== 'request_in_progress') console.error('Brevo trial storage unavailable');
    }).finally(() => { running = null; });
    return running;
  }
  return { kick, start() { if (!timer) { timer = setInterval(kick, 5000); timer.unref(); void kick(); } }, stop() { clearInterval(timer); timer = null; } };
}
