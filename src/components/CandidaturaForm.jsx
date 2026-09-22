import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import Reveal from '@/components/Reveal';
import pb from '@/lib/pocketbaseClient';

const VIAGGI = ['Bali'];

export default function CandidaturaForm({ destination = '' }) {
    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefono: '',
        viaggio: destination,
        numero_persone: '',
        contatto_preferito: '',
        motivazione: '',
        aspettative: '',
        esperienza_gruppo: '',
        info_utili: '',
        privacy_accepted: false,
        consenso_newsletter: false,
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!form.nome.trim()) next.nome = 'Inserisci il tuo nome e cognome.';
        if (!form.email.trim()) next.email = 'Inserisci la tua email.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Inserisci un indirizzo email valido.';
        if (!form.telefono.trim()) next.telefono = 'Inserisci il tuo numero di telefono.';
        if (!form.viaggio) next.viaggio = 'Seleziona il viaggio di interesse.';
        if (!form.numero_persone) next.numero_persone = 'Indica in quante persone siete interessate.';
        if (!form.contatto_preferito) next.contatto_preferito = 'Scegli quando preferisci essere contattato.';
        if (!form.motivazione.trim()) next.motivazione = 'Raccontaci perché vuoi partire.';
        if (!form.aspettative.trim()) next.aspettative = 'Raccontaci cosa ti aspetti da questo viaggio.';
        if (!form.esperienza_gruppo.trim()) next.esperienza_gruppo = 'Raccontaci la tua esperienza nei viaggi di gruppo.';
        if (!form.privacy_accepted) next.privacy_accepted = 'Devi accettare la privacy policy per inviare la candidatura.';
        return next;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const found = validate();
        if (Object.keys(found).length) {
            setErrors(found);
            return;
        }

        setStatus('submitting');
        try {
            await pb.collection('candidature').create({
                nome: form.nome.trim(),
                email: form.email.trim(),
                telefono: form.telefono.trim(),
                viaggio: form.viaggio,
                numero_persone: form.numero_persone,
                contatto_preferito: form.contatto_preferito,
                motivazione: form.motivazione.trim(),
                aspettative: form.aspettative.trim(),
                esperienza_gruppo: form.esperienza_gruppo.trim(),
                info_utili: form.info_utili.trim(),
                privacy_accepted: true,
                consenso_newsletter: form.consenso_newsletter,
            });
            setStatus('success');
            setForm({ nome: '', email: '', telefono: '', viaggio: destination, numero_persone: '', contatto_preferito: '', motivazione: '', aspettative: '', esperienza_gruppo: '', info_utili: '', privacy_accepted: false, consenso_newsletter: false });
        } catch (error) {
            setStatus('error');
            if (error?.response?.data) setErrors(error.response.data);
        }
    };

    const inputBase = 'w-full rounded-[0.9rem] border bg-[#FDEFE2]/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:bg-background';
    const inputClass = (field) => `${inputBase} ${errors[field] ? 'border-destructive' : 'border-border'}`;

    return (
        <section id="candidatura" className="scroll-mt-24 border-t border-border/60 bg-[hsl(33_50%_96%)]">
            <div className="mx-auto max-w-[48rem] px-5 py-20 md:px-8">
                <div className="rounded-[1.75rem] border border-primary/30 bg-[#FDEFE2]/70 p-6 shadow-[0_12px_40px_hsl(17_72%_47%/0.08)] md:p-10">
                    <Reveal>
                        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">Candidatura</p>
                        <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">Candidati al viaggio</h2>
                        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                            Raccontaci chi sei e rispondi alle quattro domande: ti ricontatteremo noi, Riccardo e Fátima, per conoscerci e capire se questo Wānanga è fatto per te.
                        </p>
                    </Reveal>

                    {status === 'success' ? (
                        <Reveal delay={0.05}>
                            <div className="mt-10 rounded-[1.25rem] border border-primary/25 bg-background p-8 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check size={24} strokeWidth={2} /></div>
                                <p className="font-display mt-4 text-xl font-semibold text-foreground">Candidatura ricevuta.</p>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Grazie per il tuo interesse. Ti ricontatteremo presto per parlare del viaggio.</p>
                                <button type="button" onClick={() => setStatus('idle')} className="mt-6 inline-flex items-center rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-foreground/70 transition hover:border-primary hover:text-primary">
                                    Invia un&apos;altra candidatura
                                </button>
                            </div>
                        </Reveal>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor={`${destination}-nome`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Nome e cognome <span className="text-primary">*</span></label>
                                <input id={`${destination}-nome`} type="text" value={form.nome} onChange={(event) => update('nome', event.target.value)} placeholder="Es. Maria Rossi" className={inputClass('nome')} />
                                {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-email`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Email <span className="text-primary">*</span></label>
                                <input id={`${destination}-email`} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="Es. maria.rosse@email.com" className={inputClass('email')} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-telefono`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Numero di telefono <span className="text-primary">*</span></label>
                                <input id={`${destination}-telefono`} type="tel" value={form.telefono} onChange={(event) => update('telefono', event.target.value)} placeholder="Es. +39 333 1234567" className={inputClass('telefono')} />
                                {errors.telefono && <p className="text-xs text-destructive">{errors.telefono}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-viaggio`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Viaggio di interesse <span className="text-primary">*</span></label>
                                <select id={`${destination || 'generale'}-viaggio`} value={form.viaggio} onChange={(event) => update('viaggio', event.target.value)} className={inputClass('viaggio')}>
                                    <option value="" disabled>Seleziona un viaggio</option>
                                    {VIAGGI.map((viaggio) => <option key={viaggio} value={viaggio}>{viaggio}</option>)}
                                </select>
                                {errors.viaggio && <p className="text-xs text-destructive">{errors.viaggio}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-persone`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">In quante persone siete interessate al viaggio <span className="text-primary">*</span></label>
                                <select id={`${destination}-persone`} value={form.numero_persone} onChange={(event) => update('numero_persone', event.target.value)} className={inputClass('numero_persone')}>
                                    <option value="" disabled>Seleziona…</option>
                                    <option value="1">1 persona</option>
                                    <option value="2">2 persone</option>
                                    <option value="3">3 persone</option>
                                    <option value="4">4 persone</option>
                                    <option value="5+">5 o più</option>
                                </select>
                                {errors.numero_persone && <p className="text-xs text-destructive">{errors.numero_persone}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-contatto`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Quando preferisci essere contattato <span className="text-primary">*</span></label>
                                <select id={`${destination}-contatto`} value={form.contatto_preferito} onChange={(event) => update('contatto_preferito', event.target.value)} className={inputClass('contatto_preferito')}>
                                    <option value="" disabled>Seleziona…</option>
                                    <option value="mattino">Mattino</option>
                                    <option value="pomeriggio">Pomeriggio</option>
                                    <option value="sera">Sera</option>
                                </select>
                                {errors.contatto_preferito && <p className="text-xs text-destructive">{errors.contatto_preferito}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-motivazione`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Perché vuoi partire per questo viaggio? <span className="text-primary">*</span></label>
                                <textarea id={`${destination}-motivazione`} rows={3} value={form.motivazione} onChange={(event) => update('motivazione', event.target.value)} placeholder="Raccontaci cosa ti spinge davvero: la curiosità, il bisogno di staccare, la voglia di incontrare persone…" className={`${inputClass('motivazione')} resize-none`} />
                                {errors.motivazione && <p className="text-xs text-destructive">{errors.motivazione}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-aspettative`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Cosa ti aspetti da un'esperienza in piccolo gruppo? <span className="text-primary">*</span></label>
                                <textarea id={`${destination}-aspettative`} rows={3} value={form.aspettative} onChange={(event) => update('aspettative', event.target.value)} placeholder="Wānanga si vive insieme: cene condivise, conversazioni, tempo libero ma anche presenza reciproca. Come immagini questa vicinanza?" className={`${inputClass('aspettative')} resize-none`} />
                                {errors.aspettative && <p className="text-xs text-destructive">{errors.aspettative}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-esperienza`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Qual è la tua esperienza nei viaggi di gruppo? <span className="text-primary">*</span></label>
                                <textarea id={`${destination}-esperienza`} rows={3} value={form.esperienza_gruppo} onChange={(event) => update('esperienza_gruppo', event.target.value)} placeholder="È il primo viaggio di gruppo o ne hai già fatti? Come vivi il tempo libero e il ritmo lento?" className={`${inputClass('esperienza_gruppo')} resize-none`} />
                                {errors.esperienza_gruppo && <p className="text-xs text-destructive">{errors.esperienza_gruppo}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`${destination}-info`} className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">C'è qualcosa che possiamo sapere per rendere il viaggio più adatto a te?</label>
                                <textarea id={`${destination}-info`} rows={3} value={form.info_utili} onChange={(event) => update('info_utili', event.target.value)} placeholder="Cosa speri di portare a casa, eventuali esigenze, intolleranze, paure o domande ancora aperte. Campo libero, facoltativo." className={`${inputClass('info_utili')} resize-none`} />
                            </div>

                            <label htmlFor={`${destination}-privacy`} className="flex cursor-pointer items-start gap-3 rounded-[0.9rem] border border-border bg-[#FDEFE2]/40 p-4">
                                <input id={`${destination}-privacy`} type="checkbox" checked={form.privacy_accepted} onChange={(event) => update('privacy_accepted', event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-primary" />
                                <span className="text-sm leading-relaxed text-foreground/80">Ho letto e accetto la <a href="/privacy-policy" className="font-semibold text-primary underline underline-offset-2">Privacy Policy</a> e autorizzo il trattamento dei miei dati per essere ricontattato. <span className="text-primary">*</span></span>
                            </label>
                            {errors.privacy_accepted && <p className="-mt-3 text-xs text-destructive">{errors.privacy_accepted}</p>}

                            <label htmlFor={`${destination}-newsletter`} className="flex cursor-pointer items-start gap-3 rounded-[0.9rem] border border-border bg-[#FDEFE2]/40 p-4">
                                <input id={`${destination}-newsletter`} type="checkbox" checked={form.consenso_newsletter} onChange={(event) => update('consenso_newsletter', event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-primary" />
                                <span className="text-sm leading-relaxed text-foreground/80">Voglio ricevere newsletter, aggiornamenti sui prossimi viaggi e comunicazioni promozionali da WĀNANGA. <span className="text-muted-foreground">(opzionale)</span></span>
                            </label>

                            {status === 'error' && <p className="rounded-[0.9rem] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Qualcosa è andato storto. Riprova tra qualche istante.</p>}
                            <button type="submit" disabled={status === 'submitting'} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
                                {status === 'submitting' ? <><Loader2 size={16} className="animate-spin" />Invio in corso…</> : 'Candidati al viaggio'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
