import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, Mail, MessageCircle, Send } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import pb from '@/lib/pocketbaseClient';

export default function ContattaciPage() {
    const [form, setForm] = useState({ nome: '', email: '', messaggio: '', privacy_accepted: false, consenso_newsletter: false });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const next = {};
        if (!form.privacy_accepted) {
            next.privacy_accepted = 'Devi accettare la Privacy Policy per inviare il messaggio.';
        }
        return next;
    };

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    const handleChange = (e) => {
        const { name, value } = e.target;
        update(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validate();
        if (Object.keys(found).length) {
            setErrors(found);
            return;
        }
        setErrors({});
        setStatus('loading');

        try {
            await pb.collection('contatti').create({
                nome: form.nome.trim(),
                email: form.email.trim(),
                messaggio: form.messaggio.trim(),
                privacy_accepted: true,
                consenso_newsletter: form.consenso_newsletter,
            });
            setStatus('success');
            setForm({ nome: '', email: '', messaggio: '', privacy_accepted: false, consenso_newsletter: false });
        } catch (err) {
            if (err?.response?.data) {
                setErrors(err.response.data);
            }
            setStatus('error');
        }
    };

    const fieldClass = (name) =>
        `w-full rounded-xl border bg-[#FCF8F2] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            errors[name] ? 'border-destructive' : 'border-border'
        }`;

    return (
        <SiteLayout>
            <Helmet>
                <title>Contattaci — Scrivici | WĀNANGA</title>
                <meta name="description" content="Hai domande o vuoi sapere di più sui viaggi Wānanga? Scrivici: ti risponderemo volentieri." />
            </Helmet>

            {/* HERO */}
            <section className="bg-background">
                <div className="mx-auto max-w-[72rem] px-5 py-16 md:px-8 md:py-24">
                    <Reveal>
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">parla con noi</p>
                        <h1 className="font-display text-4xl font-bold leading-[1.08] text-primary sm:text-5xl md:text-6xl">
                            Contattaci.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/75">
                            Hai una domanda, un&apos;idea o semplicemente voglia di dirci ciao?
                            <br />
                            Scrivici: ti risponderemo al più presto.
                        </p>
                        <span className="mt-5 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                    </Reveal>
                </div>
            </section>

            {/* FORM + INFO */}
            <section className="bg-background">
                <div className="mx-auto max-w-[80rem] px-5 pb-24 md:px-8">
                    <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
                        {/* FORM */}
                        <Reveal>
                            {status === 'success' ? (
                                <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-border/60 bg-[#FDEFE2] px-6 py-12 text-center">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Send size={26} strokeWidth={1.6} />
                                    </div>
                                    <h2 className="font-display text-2xl font-bold text-primary">Messaggio inviato.</h2>
                                    <p className="mt-3 max-w-sm leading-relaxed text-foreground/75">
                                        Grazie per averci scritto. Ti risponderemo appena possibile.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className="mt-7 inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10"
                                    >
                                        Scrivi un altro messaggio
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    noValidate
                                    className="rounded-2xl border border-border/60 bg-[#FCF8F2] p-6 shadow-[0_14px_40px_-28px_hsl(20_30%_20%/0.35)] md:p-9"
                                >
                                    <h2 className="font-display text-xl font-bold text-[hsl(100_12%_22%)]">
                                        Scrivici un messaggio
                                    </h2>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        Compila i campi qui sotto. I campi con * sono obbligatori.
                                    </p>

                                    <div className="mt-7 space-y-5">
                                        {/* Nome */}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="nome" className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">
                                                Nome *
                                            </label>
                                            <input
                                                id="nome"
                                                name="nome"
                                                type="text"
                                                value={form.nome}
                                                onChange={handleChange}
                                                placeholder="Come ti chiami?"
                                                className={fieldClass('nome')}
                                            />
                                            {errors.nome && (
                                                <p className="text-xs text-destructive">{errors.nome.message}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">
                                                Email *
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="La tua email"
                                                className={fieldClass('email')}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive">{errors.email.message}</p>
                                            )}
                                        </div>

                                        {/* Messaggio */}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="messaggio" className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">
                                                Messaggio *
                                            </label>
                                            <textarea
                                                id="messaggio"
                                                name="messaggio"
                                                value={form.messaggio}
                                                onChange={handleChange}
                                                placeholder="Raccontaci cosa hai in mente…"
                                                rows={6}
                                                className={`${fieldClass('messaggio')} resize-none`}
                                            />
                                            {errors.messaggio && (
                                                <p className="text-xs text-destructive">{errors.messaggio.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <label htmlFor="contatti-privacy" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-[#FDEFE2]/45 p-4">
                                            <input
                                                id="contatti-privacy"
                                                name="privacy_accepted"
                                                type="checkbox"
                                                checked={form.privacy_accepted}
                                                onChange={(event) => update('privacy_accepted', event.target.checked)}
                                                className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary accent-[hsl(17_72%_47%)] focus:ring-2 focus:ring-primary/30"
                                                aria-describedby="contatti-privacy-error"
                                            />
                                            <span className="text-sm leading-relaxed text-foreground/80">
                                                Ho letto e accetto la{' '}
                                                <a href="/privacy-policy" className="font-semibold text-primary underline underline-offset-2 hover:no-underline">Privacy Policy</a>{' '}
                                                e autorizzo il trattamento dei miei dati per essere ricontattato. <span className="text-primary">*</span>
                                            </span>
                                        </label>
                                        {errors.privacy_accepted && <p id="contatti-privacy-error" className="mt-2 text-xs text-destructive">{errors.privacy_accepted}</p>}
                                        <label htmlFor="contatti-newsletter" className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-[#FDEFE2]/45 p-4">
                                            <input
                                                id="contatti-newsletter"
                                                name="consenso_newsletter"
                                                type="checkbox"
                                                checked={form.consenso_newsletter}
                                                onChange={(event) => update('consenso_newsletter', event.target.checked)}
                                                className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary accent-[hsl(17_72%_47%)] focus:ring-2 focus:ring-primary/30"
                                            />
                                            <span className="text-sm leading-relaxed text-foreground/80">
                                                Voglio ricevere newsletter, aggiornamenti sui prossimi viaggi e comunicazioni promozionali da WĀNANGA. <span className="text-muted-foreground">(opzionale)</span>
                                            </span>
                                        </label>
                                    </div>

                                    {status === 'error' && (
                                        <p className="mt-5 text-sm text-destructive">
                                            Qualcosa è andato storto. Riprova tra poco.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {status === 'loading' ? 'Invio in corso…' : 'Invia il messaggio'}
                                        {status !== 'loading' && <ArrowRight size={16} strokeWidth={2.2} />}
                                    </button>
                                </form>
                            )}
                        </Reveal>

                        {/* INFO SIDEBAR */}
                        <Reveal delay={0.12}>
                            <aside className="flex h-full flex-col gap-6 rounded-2xl border border-border/60 bg-[hsl(100_12%_28%)] p-7 text-[hsl(33_55%_96%)]">
                                <div>
                                    <h3 className="font-display text-lg font-bold">Altri modi per parlarci</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[hsl(33_30%_88%/0.8)]">
                                        Siamo sempre felici di conoscere chi condivide il nostro modo di viaggiare.
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-start gap-3">
                                        <Mail size={20} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" />
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(33_30%_88%/0.7)]">Email</p>
                                            <a href="mailto:ciao@wananga.travel" className="text-sm font-semibold transition-colors hover:text-primary">
                                                ciao@wananga.travel
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MessageCircle size={20} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" />
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(33_30%_88%/0.7)]">Community</p>
                                            <p className="text-sm leading-relaxed text-[hsl(33_30%_88%/0.85)]">
                                                Unisciti alla community Wānanga per storie, consigli e ispirazioni.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-white/15 pt-5">
                                    <p className="font-display text-sm font-semibold tracking-[0.2em] text-primary/90">
                                        In viaggio, insieme.
                                    </p>
                                </div>
                            </aside>
                        </Reveal>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
