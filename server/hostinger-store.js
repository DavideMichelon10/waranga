import lockfile from 'proper-lockfile';
import { mkdir, writeFile, rename, unlink, readdir, readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { isAbsolute, join } from 'node:path';
import { ServiceError } from './reach.js';

// Keep this directory outside public_html and all deployment/build directories.
export function createHostingerStore(directory) {
  if (!directory || !isAbsolute(directory)) throw new ServiceError('invalid_private_directory');
  const consentDirectory = join(directory, 'consent');
  const rateDirectory = join(directory, 'rate');
  let lastCleanup = -1;
  const digest = value => createHash('sha256').update(value).digest('hex');
  return {
    async getJSON(key) {
      try { return JSON.parse(await readFile(join(consentDirectory, digest(key) + '.json'), 'utf8')); }
      catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    },
    async findForms(email) {
      let names;
      try { names = await readdir(consentDirectory); }
      catch (error) { if (error.code === 'ENOENT') return []; throw error; }
      const records = [];
      for (const name of names) {
        if (!/^[a-f0-9]{64}\.json$/.test(name)) continue;
        const value = JSON.parse(await readFile(join(consentDirectory, name), 'utf8'));
        if (value.email === email && value.requestId && ['contact', 'application'].includes(value.kind)) records.push(value);
      }
      return records;
    },
    async withLock(key, operation) {
      const locks = join(directory, 'locks');
      await mkdir(locks, { recursive: true, mode: 0o700 });
      const lock = join(locks, digest(key));
      let release;
      try {
        // Renew while an operation runs; recover orphaned locks after a deploy/crash.
        // Keep the old directory path so pre-existing orphaned locks also recover.
        release = await lockfile.lock(lock, { lockfilePath: lock, realpath: false, stale: 30000, update: 5000, retries: 0 });
      } catch (error) {
        if (error.code === 'ELOCKED') throw new ServiceError('request_in_progress', 409);
        throw error;
      }
      try { return await operation(); } finally { await release(); }
    },
    async setJSON(key, value) {
      await mkdir(consentDirectory, { recursive: true, mode: 0o700 });
      const target = join(consentDirectory, digest(key) + '.json');
      const temporary = target + '.' + randomUUID() + '.tmp';
      try {
        await writeFile(temporary, JSON.stringify(value), { mode: 0o600, flag: 'wx' });
        await rename(temporary, target);
      } finally {
        await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
      }
      return { modified: true };
    },
    async limit(key, maximum, now = Date.now()) {
      await mkdir(rateDirectory, { recursive: true, mode: 0o700 });
      const minute = Math.floor(now / 60000);
      // Exclusive file creation keeps the cap valid across Node processes/restarts.
      for (let slot = 0; slot < maximum; slot++) {
        try {
          await writeFile(join(rateDirectory, `${minute}-${digest(key)}-${slot}`), '', { flag: 'wx', mode: 0o600 });
          if (lastCleanup !== minute) {
            lastCleanup = minute;
            for (const name of await readdir(rateDirectory)) {
              if (/^\d+-[a-f0-9]{64}-\d+$/.test(name) && Number(name.split('-')[0]) < minute - 1) {
                await unlink(join(rateDirectory, name)).catch(error => { if (error.code !== 'ENOENT') throw error; });
              }
            }
          }
          return;
        } catch (error) { if (error.code !== 'EEXIST') throw error; }
      }
      throw new ServiceError('rate_limit', 429);
    },
  };
}
