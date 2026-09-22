import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Sun, Users, Waves, Leaf, Heart, UsersRound, Backpack, CreditCard, ArrowRight, ChevronDown, Check, Loader2 } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { useCommunityModal } from '@/contexts/CommunityModalContext';
import { faqItems } from '@/data/faq';
import pb from '@/lib/pocketbaseClient';
const HERO = 'https://images.hostinger.com/62ab1db1-c084-4233-bea3-a054715d0a71.png';
const WANANGA_LOGO = 'https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/6a865aa63e271eba5bf9422e602f7258.jpg';
const MOUNTAIN = 'https://images.hostinger.com/998e3ff6-b478-47aa-a4ad-ac8e6a33be41.png';
const RICE = 'https://images.hostinger.com/3a7bef51-5d4f-405d-9303-82ce09140ece.png';
const pillars = [{
  icon: Sun,
  title: 'SCOPRI',
  text: 'Luoghi autentici e fuori dai soliti itinerari.',
  tone: 'text-primary'
}, {
  icon: Users,
  title: 'CONDIVIDI',
  text: 'Piccoli gruppi, grande connessione.',
  tone: 'text-[hsl(20_25%_30%)]'
}, {
  icon: Waves,
  title: 'VIVI',
  text: 'Esperienze che lasciano il segno.',
  tone: 'text-[hsl(190_35%_38%)]'
}, {
  icon: Leaf,
  title: 'CRESCI',
  text: 'Tempo per te, spazio per ritrovarti.',
  tone: 'text-accent'
}, {
  icon: Heart,
  title: 'CONNETTI',
  text: 'Persone vere, amicizie che restano.',
  tone: 'text-primary'
}];
const travelEssentials = [{
  id: 'solo',
  icon: UsersRound,
  title: '1. Non devi conoscere nessuno',
  description: 'La maggior parte delle persone parte da sola. È proprio da lì che comincia tutto.'
}, {
  id: 'groups',
  icon: Users,
  title: '2. Piccoli gruppi',
  description: 'Poche persone, per conoscersi davvero e vivere il viaggio senza stress.'
}, {
  id: 'organised',
  icon: Backpack,
  title: '3. Pensiamo noi al viaggio',
  description: 'Organizzazione, esperienze e spostamenti: tu devi solo preparare la valigia e partire.'
}, {
  id: 'space',
  icon: Sun,
  secondaryIcon: Waves,
  title: '4. Il tuo spazio conta',
  description: 'Momenti insieme, ma anche tempo per te. Nessuno ti obbligherà a partecipare a tutto.'
}, {
  id: 'installments',
  icon: CreditCard,
  title: '5. Paga a rate',
  description: 'Puoi dividere il costo del viaggio in più pagamenti e partire con più leggerezza.',
  featured: true
}];
const values = [{
  t: 'Slow travel',
  d: 'Meno tappe, più tempo. Ci fermiamo dove vale la pena restare, camminiamo piano e lasciamo che i luoghi ci raggiungano.'
}, {
  t: 'Cultura, davvero',
  d: 'Cerimonie, mercati, cucine di famiglia, guide locali. Non guardiamo la cultura da fuori: la attraversiamo con rispetto.'
}, {
  t: 'Gruppi piccoli',
  d: 'Massimo 12 persone. Abbastanza per sentirsi comunità, poche per conoscersi per nome, storia e risate.'
}, {
  t: 'Conversazioni che contano',
  d: 'Cerchi al tramonto, domande vere, silenzi accolti. Il viaggio fuori diventa un viaggio dentro.'
}];
const communityPolaroids = [{
  src: 'https://images.hostinger.com/92028a4d-14d1-4643-b869-31ed4194400a.png',
  alt: 'Tramonto in spiaggia con la community Wānanga',
  rotate: '-6deg',
  z: 1
}, {
  src: 'https://images.hostinger.com/78773698-72d1-4aa0-bbb6-8ad129bfc6e1.png',
  alt: 'Viaggiatrice in un campo al tramonto',
  rotate: '4deg',
  z: 2
}, {
  src: 'https://images.hostinger.com/345d37d2-a411-4c4c-be72-cb510ec208f3.png',
  alt: 'Cerchio intorno al fuoco in spiaggia',
  rotate: '-3deg',
  z: 3
}, {
  src: 'https://images.hostinger.com/e25a7531-c2a6-4558-9434-2ef04197d9e2.png',
  alt: 'Gruppo di amici seduti insieme all\'aperto',
  rotate: '5deg',
  z: 4
}];
function RestaAggiornatoForm() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    messaggio: '',
    privacy_accepted: false,
    consenso_newsletter: false
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const update = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value
    }));
    setErrors(current => ({
      ...current,
      [field]: undefined
    }));
  };
  const validate = () => {
    const next = {};
    if (!form.nome.trim()) next.nome = 'Inserisci il tuo nome.';
    if (!form.email.trim()) next.email = 'Inserisci la tua email.';else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Inserisci un indirizzo email valido.';
    if (!form.privacy_accepted) next.privacy_accepted = 'Devi accettare la privacy policy per iscriverti.';
    return next;
  };
  const handleSubmit = async event => {
    event.preventDefault();
    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setStatus('submitting');
    try {
      await pb.collection('novita_contatti').create({
        nome: form.nome.trim(),
        email: form.email.trim(),
        messaggio: form.messaggio.trim(),
        privacy_accepted: true,
        consenso_newsletter: form.consenso_newsletter
      });
      setStatus('success');
      setForm({
        nome: '',
        email: '',
        messaggio: '',
        privacy_accepted: false,
        consenso_newsletter: false
      });
    } catch (error) {
      setStatus('error');
      if (error?.response?.data) setErrors(error.response.data);
    }
  };
  const inputBase = 'w-full rounded-[0.9rem] border bg-[#FDEFE2]/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-primary focus:bg-background';
  const inputClass = field => `${inputBase} ${errors[field] ? 'border-destructive' : 'border-border'}`;
  if (status === 'success') {
    return <Reveal delay={0.05}>
                <div className="rounded-[1.25rem] border border-primary/25 bg-background p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check size={24} strokeWidth={2} /></div>
                    <p className="font-display mt-4 text-xl font-semibold text-foreground">Sei in viaggio con noi.</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Grazie! Ti scriveremo non appena ci saranno novità WĀNANGA in arrivo.</p>
                    <button type="button" onClick={() => setStatus('idle')} className="mt-6 inline-flex items-center rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-foreground/70 transition hover:border-primary hover:text-primary">
                        Invia un altro contatto
                    </button>
                </div>
            </Reveal>;
  }
  return <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="ra-nome" className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Nome <span className="text-primary">*</span></label>
                <input id="ra-nome" type="text" value={form.nome} onChange={event => update('nome', event.target.value)} placeholder="Es. Maria Rossi" className={inputClass('nome')} />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="ra-email" className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Email <span className="text-primary">*</span></label>
                <input id="ra-email" type="email" value={form.email} onChange={event => update('email', event.target.value)} placeholder="Es. maria@email.com" className={inputClass('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
                <label htmlFor="ra-messaggio" className="block text-xs font-bold uppercase tracking-[0.14em] text-foreground/80">Messaggio <span className="text-muted-foreground">(opzionale)</span></label>
                <textarea id="ra-messaggio" rows={3} value={form.messaggio} onChange={event => update('messaggio', event.target.value)} placeholder="Vuoi dirci qualcosa di più? Scrivilo qui." className={`${inputClass('messaggio')} resize-none`} />
            </div>

            <label htmlFor="ra-privacy" className="flex cursor-pointer items-start gap-3 rounded-[0.9rem] border border-border bg-[#FDEFE2]/40 p-4">
                <input id="ra-privacy" type="checkbox" checked={form.privacy_accepted} onChange={event => update('privacy_accepted', event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm leading-relaxed text-foreground/80">Ho letto e accetto la <a href="/privacy-policy" className="font-semibold text-primary underline underline-offset-2">Privacy Policy</a> e autorizzo il trattamento dei miei dati per ricevere le novità WĀNANGA. <span className="text-primary">*</span></span>
            </label>
            {errors.privacy_accepted && <p className="-mt-3 text-xs text-destructive">{errors.privacy_accepted}</p>}

            <label htmlFor="ra-newsletter" className="flex cursor-pointer items-start gap-3 rounded-[0.9rem] border border-border bg-[#FDEFE2]/40 p-4">
                <input id="ra-newsletter" type="checkbox" checked={form.consenso_newsletter} onChange={event => update('consenso_newsletter', event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm leading-relaxed text-foreground/80">Voglio ricevere newsletter, aggiornamenti sui prossimi viaggi e comunicazioni promozionali da WĀNANGA. <span className="text-muted-foreground">(opzionale)</span></span>
            </label>

            {status === 'error' && <p className="rounded-[0.9rem] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Qualcosa è andato storto. Riprova tra qualche istante.</p>}
            <button type="submit" disabled={status === 'submitting'} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
                {status === 'submitting' ? <><Loader2 size={16} className="animate-spin" />Invio in corso…</> : 'Resta aggiornato'}
            </button>
        </form>;
}
export default function HomePage() {
  const {
    openCommunityModal
  } = useCommunityModal();
  return <SiteLayout>
            <Helmet>
                <title>WĀNANGA — Viaggi che fanno bene | La nostra filosofia</title>
                <meta name="description" content="La filosofia WĀNANGA: slow travel, cultura autentica, gruppi di massimo 12 persone e conversazioni che contano. Viaggi, persone, vita." />
            </Helmet>

            {/* HERO */}
            <section className="relative">
                <div className="relative min-h-[100dvh] w-full overflow-hidden">
                    <img src={HERO} alt="Gruppo di viaggiatori al tramonto su una spiaggia di Bali" className="absolute inset-0 h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/25 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-transparent" />
                    <div className="relative mx-auto flex min-h-[100dvh] max-w-[80rem] items-end px-5 pb-14 pt-24 md:px-8 md:pb-20 lg:pb-24">
                        <div className="max-w-[42rem]">
                            <Reveal>
                                <p className="mb-4 pl-1 text-[10px] font-bold uppercase tracking-[0.34em] text-accent sm:text-[11px]">Viaggi, persone, vita.</p>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <h1 className="font-display text-black">
                                    <span className="wananga-wordmark" role="img" aria-label="WĀNANGA">
                                        <img src={WANANGA_LOGO} alt="" aria-hidden="true" />
                                    </span>
                                    <span className="mt-5 block text-[clamp(2.85rem,6vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.045em]">viaggi che<br />fanno bene.</span>
                                </h1>
                            </Reveal>
                            <Reveal delay={0.2}>
                                <p className="mt-6 max-w-md pl-1 text-base leading-relaxed text-foreground/80 sm:text-lg">
                                    Noi ci prendiamo cura del viaggio.
                                    <br />
                                    Tu ti prendi cura di te.
                                </p>
                            </Reveal>
                            <Reveal delay={0.3}>
                                <div className="mt-8 flex flex-wrap gap-3 pl-1">
                                    <Link to="/viaggi" className="rounded-full bg-primary px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]">
                                        Scopri il nostro primo viaggio
                                    </Link>
                                    <Link to="/filosofia" className="rounded-full border border-primary/40 bg-background/10 px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary/10">
                                        La nostra filosofia
                                    </Link>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLARS */}
            <section className="wa-grain border-y border-border/60 bg-[#FDEFE2]">
                <div className="mx-auto grid max-w-[80rem] gap-9 px-5 py-16 sm:grid-cols-3 md:px-8 lg:grid-cols-5">
                    {pillars.map((p, i) => <Reveal key={p.title} delay={i * 0.06} className="text-center">
                            <p.icon size={34} strokeWidth={1.3} className={`mx-auto mb-4 ${p.tone}`} />
                            <h3 className={`font-display mb-2 text-xs font-bold tracking-[0.24em] ${p.tone}`}>{p.title}</h3>
                            <p className="mx-auto max-w-[15rem] text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                        </Reveal>)}
                </div>
            </section>

            {/* LA NOSTRA FILOSOFIA — editorial split */}
            <section id="filosofia" className="bg-background">
                <div className="mx-auto max-w-[72rem] px-5 py-24 md:px-8">
                    <div className="grid items-center gap-14 lg:grid-cols-2">
                    <Reveal>
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">partire con noi</p>
                        <h2 className="font-display text-4xl font-bold leading-tight text-accent md:text-5xl">Perché Wānanga?</h2>
                        <div className="mt-7 space-y-5 text-[17px] leading-relaxed text-foreground/80">
                            <p>Crediamo nell’equilibrio tra esplorare il mondo e ritrovare spazio dentro di sè.</p>
                            <p>
                                Durante ogni WĀNANGA vivremo davvero il luogo che ci ospita: lo attraverseremo, lo ascolteremo, conosceremo persone, culture e modi di vivere diversi dai nostri. Ma ci saranno anche momenti in cui rallentare e farci domande semplici, ma importanti. <em>Sono felice della vita che sto vivendo? Cosa vorrei cambiare? Quale vita vorrei in futuro?</em>
                            </p>
                            <p>WĀNANGA nasce per questo: scoprire luoghi nuovi, incontrare amici e persone simili a noi, ma anche capire cosa ci fa stare bene, cosa desideriamo e quale vita immaginiamo per il nostro futuro.</p>
                            <Link to="/chi-siamo" className="mt-2 inline-flex items-center rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]">
                                Scopri chi siamo
                            </Link>
                        </div>
                    </Reveal>
                    <Reveal delay={0.15} y={30}>
                        <div className="relative">
                            <img src={MOUNTAIN} alt="Piccolo gruppo di viaggiatori all'alba su un punto panoramico" className="w-full rounded-[2rem] object-cover shadow-[0_30px_60px_-30px_hsl(17_60%_30%/0.45)]" />
                            <img src={RICE} alt="Risaie a terrazza di Tegallalang, Ubud" className="absolute -bottom-10 -left-6 hidden w-52 rotate-[-4deg] rounded-2xl border-4 border-card object-cover shadow-xl md:block" />
                        </div>
                    </Reveal>
                    </div>
                </div>
            </section>

            {/* VALORI — zig zag list */}
            <section className="bg-[#FDEFE2]">
                <div className="mx-auto max-w-[64rem] px-5 py-20 md:px-8">
                    <Reveal>
                        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">Perché viaggiare con noi?</h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            Equilibrio tra esplorare il mondo ed esplorare se stessi: è tutto qui.
                        </p>
                    </Reveal>
                    <div className="mt-12 divide-y divide-border/70">
                        {values.map((v, i) => <Reveal key={v.t} delay={i * 0.05}>
                                <div className="grid gap-3 py-8 md:grid-cols-[1fr_1.6fr] md:gap-10">
                                    <h3 className="font-display flex items-baseline gap-3 text-xl font-semibold text-accent">
                                        <span className="text-xs font-bold tracking-widest text-primary/60">0{i + 1}</span>
                                        {v.t}
                                    </h3>
                                    <p className="leading-relaxed text-foreground/75">{v.d}</p>
                                </div>
                            </Reveal>)}
                    </div>
                </div>
            </section>

            {/* IL PRIMO WĀNANGA */}
            <section id="viaggi" className="bg-background">
                <div className="mx-auto max-w-[80rem] px-5 py-20 md:px-8 md:py-24">
                    <Reveal>
                        <div className="mb-10">
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">in partenza</p>
                            <h2 className="font-display text-3xl font-bold text-accent md:text-4xl">
                                Il primo Wānanga sarà a Bali
                            </h2>
                            <span className="mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <Link to="/viaggi" className="group grid overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_20px_50px_-28px_hsl(20_30%_20%/0.45)] transition-transform hover:-translate-y-1 active:scale-[0.99] md:grid-cols-[1.15fr_0.85fr]">
                            <div className="relative min-h-[20rem] overflow-hidden md:min-h-[28rem]">
                                <img src="https://images.hostinger.com/7280a913-f298-4bb6-97b6-143d540459a2.png" alt="Risaie a terrazza di Bali con palme tropicali" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <span className="absolute bottom-4 left-4 rounded-full bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-md">
                                    Bali
                                </span>
                            </div>
                            <div className="flex flex-col justify-center gap-5 px-6 py-9 sm:px-10 md:px-12 md:py-12">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">15 – 29 giugno 2025</p>
                                <h3 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                                    Bali: tra natura e spiritualità
                                </h3>
                                <p className="max-w-md text-base leading-relaxed text-foreground/75">
                                    Il nostro primo viaggio: risaie, templi, oceano e tempo per ritrovare il proprio ritmo.
                                </p>
                                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform group-hover:-translate-y-px">
                                    Scopri il viaggio a Bali
                                    <ArrowRight size={16} strokeWidth={2.2} />
                                </span>
                            </div>
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* TUTTO CIÒ CHE TI SERVE */}
            <section className="bg-background">
                <div className="mx-auto max-w-[76rem] px-5 py-14 md:px-8 md:py-16">
                    <Reveal>
                        <div className="mb-8 flex items-center justify-center gap-4 text-center">
                            <span className="hidden h-px w-8 bg-primary/55 sm:block" aria-hidden />
                            <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-foreground sm:text-xs md:tracking-[0.2em]">
                                Tutto ciò che ti serve, per vivere un viaggio indimenticabile.
                            </h2>
                            <span className="hidden h-px w-8 bg-primary/55 sm:block" aria-hidden />
                        </div>
                    </Reveal>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {travelEssentials.map((item, i) => {
            const Icon = item.icon;
            const SecondaryIcon = item.secondaryIcon;
            return <Reveal key={item.id} delay={i * 0.05} className="h-full">
                            <article className={`flex h-full min-h-[18.5rem] flex-col items-center rounded-2xl border px-4 py-7 text-center shadow-[0_10px_28px_-20px_hsl(20_30%_20%/0.38)] transition-transform hover:-translate-y-0.5 ${item.featured ? 'border-primary bg-primary text-primary-foreground' : 'border-border/65 bg-[#FCF8F2] text-foreground'}`}>
                                <div className={`relative mb-5 flex h-12 w-12 items-center justify-center ${item.featured ? 'text-primary-foreground' : 'text-primary'}`} aria-hidden="true">
                                    <Icon size={40} strokeWidth={1.6} />
                                    {SecondaryIcon && <SecondaryIcon className="absolute bottom-0 left-1/2 -translate-x-1/2" size={37} strokeWidth={1.6} />}
                                </div>
                                <h3 className={`font-display max-w-[11rem] text-[17px] font-bold leading-[1.2] ${item.featured ? 'text-primary-foreground' : 'text-primary'}`}>
                                    {item.title}
                                </h3>
                                <p className={`mt-5 max-w-[12rem] text-[14px] leading-[1.55] ${item.featured ? 'text-primary-foreground/90' : 'text-foreground/85'}`}>
                                    {item.description}
                                </p>
                            </article>
                          </Reveal>;
          })}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-border/60 bg-background">
                <div className="mx-auto max-w-[68rem] px-5 py-20 md:px-8 md:py-24">
                    <Reveal>
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">prima di partire</p>
                        <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">Cose da sapere</h2>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">Le domande che ci fate più spesso.</p>
                            <Link to="/faq" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-80">
                                Vedi tutte le FAQ
                                <ArrowRight size={16} strokeWidth={2.2} />
                            </Link>
                        </div>
                    </Reveal>
                    <div className="mt-10 border-t border-border/80">
                        {faqItems.map((item, i) => <Reveal key={item.question} delay={i * 0.05}>
                                <details className="group border-b border-border/80">
                                    <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-6 bg-[#FDEFE2] px-5 py-5 text-left font-display text-base font-semibold text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                                        <span>{item.question}</span>
                                        <ChevronDown className="faq-chevron shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" size={20} strokeWidth={1.8} />
                                    </summary>
                                    <p className="max-w-3xl pb-6 pr-10 text-[15px] leading-relaxed text-foreground/75">{item.answer}</p>
                                </details>
                            </Reveal>)}
                    </div>
                </div>
            </section>

            {/* COMMUNITY CTA — polaroid collage */}
            <section className="relative overflow-hidden bg-[hsl(90_12%_28%)]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] wa-grain" aria-hidden />
                <div className="relative mx-auto grid max-w-[80rem] items-center gap-12 px-5 py-12 md:grid-cols-2 md:gap-10 md:px-8 md:py-16 lg:gap-16">
                    <Reveal>
                        <div className="max-w-md">
                            <h2 className="font-display text-3xl font-bold leading-tight text-[hsl(33_55%_96%)] sm:text-4xl md:text-[2.65rem]">
                                Fai parte
                                <br />
                                della community.
                            </h2>
                            <p className="mt-5 max-w-sm text-base leading-relaxed text-[hsl(33_30%_88%/0.85)]">
                                Consigli, storie, incontri e ispirazioni dal mondo Wānanga.
                            </p>
                            <button type="button" onClick={openCommunityModal} className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]">
                                Entra nella community
                            </button>
                        </div>
                    </Reveal>
                    <Reveal delay={0.12} y={20}>
                        <Link to="/community" aria-label="Entra nella community Wānanga" className="relative mx-auto flex h-[15.5rem] w-full max-w-lg items-center justify-center sm:h-[17.5rem] md:h-[18.5rem]">
                            {communityPolaroids.map((p, i) => <span key={p.src} className="absolute w-[38%] max-w-[9.5rem] rounded-sm bg-white p-1.5 pb-6 shadow-[0_14px_28px_-10px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:z-20 sm:max-w-[10.5rem] sm:p-2 sm:pb-7 md:max-w-[11rem]" style={{
              left: `${i * 20}%`,
              top: i % 2 === 0 ? '8%' : '18%',
              transform: `rotate(${p.rotate})`,
              zIndex: p.z
            }}>
                                    <img src={p.src} alt={p.alt} className="aspect-[4/5] w-full object-cover" />
                                </span>)}
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* RESTA AGGIORNATO — next journey teaser form */}
            <section id="resta-aggiornato" className="scroll-mt-24 border-t border-border/60 bg-[#FDEFE2]">
                <div className="mx-auto max-w-[52rem] px-5 py-20 md:px-8 md:py-24">
                    <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16">
                        <Reveal>
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">il prossimo passo</p>
                            <h2 className="font-display mt-4 text-4xl font-bold leading-[1.08] text-foreground sm:text-5xl">
                                Forse il prossimo viaggio <span className="text-primary">sarà il tuo.</span>
                            </h2>
                            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
                                Bali sarà solo l’inizio. Lasciaci il tuo contatto per ricevere in anteprima le prossime novità WĀNANGA.
                            </p>
                        </Reveal>

                        <Reveal delay={0.12} y={20}>
                            <div className="rounded-[1.75rem] border border-primary/30 bg-[#FCF8F2] p-6 shadow-[0_12px_40px_hsl(17_72%_47%/0.08)] md:p-8">
                                <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">Resta in viaggio con noi</p>
                                <h3 className="font-display mt-2 text-2xl font-bold text-accent">Resta aggiornato</h3>
                                <div className="mt-6">
                                    <RestaAggiornatoForm />
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

        </SiteLayout>;
}