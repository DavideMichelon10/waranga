import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
    Users,
    MessagesSquare,
    CalendarDays,
    Globe2,
    Heart,
    ShieldCheck,
    Leaf,
    Smile,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { useCommunityModal } from '@/contexts/CommunityModalContext';

const HERO =
    'https://images.hostinger.com/24487b7e-d3c9-43db-953a-4faa3c6290d7.png';
const CTA_BG =
    'https://images.hostinger.com/034193e0-9cbc-4d70-85ec-b1b41b9fc3aa.png';

const ACTION_PHOTOS = [
    {
        src: 'https://images.hostinger.com/92028a4d-14d1-4643-b869-31ed4194400a.png',
        alt: 'Gruppo di viaggiatori felici al tramonto',
        className: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.hostinger.com/78773698-72d1-4aa0-bbb6-8ad129bfc6e1.png',
        alt: 'Amici su un pontile davanti al lago',
        className: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.hostinger.com/345d37d2-a411-4c4c-be72-cb510ec208f3.png',
        alt: 'Due amiche che si abbracciano',
        className: 'col-span-1 row-span-2 max-md:row-span-1',
    },
    {
        src: 'https://images.hostinger.com/e25a7531-c2a6-4558-9434-2ef04197d9e2.png',
        alt: 'Cerchio intorno al fuoco di notte',
        className: 'col-span-1 row-span-1',
    },
    {
        src: 'https://images.hostinger.com/85e49c64-486f-46a2-8e29-39be940da666.png',
        alt: 'Escursione nella giungla',
        className: 'col-span-1 row-span-1',
    },
];

const FEATURES = [
    {
        icon: Users,
        title: 'Connessioni vere',
        text: 'Incontri persone con valori affini e crei legami che vanno oltre il viaggio.',
    },
    {
        icon: MessagesSquare,
        title: 'Supporto e ispirazione',
        text: 'Scambia idee, chiedi consigli e lasciati ispirare dalle storie degli altri.',
    },
    {
        icon: CalendarDays,
        title: 'Eventi e incontri',
        text: 'Partecipa a call, serate, ritiri e viaggi di gruppo esclusivi.',
    },
    {
        icon: Globe2,
        title: 'Risorse esclusive',
        text: 'Contenuti, guide e strumenti per continuare a crescere ogni giorno.',
    },
    {
        icon: Heart,
        title: 'Un senso di appartenenza',
        text: 'Entri per un viaggio, rimani per la community. Sei parte di qualcosa di più.',
    },
];

const TESTIMONIALS = [
    {
        name: 'Giulia',
        place: 'Bali 2024',
        photo: 'https://images.hostinger.com/c3404ae3-9788-4169-9b6b-9eac07a598c9.png',
        quote:
            'Ho trovato molto più di un viaggio. Ho trovato persone che mi capiscono, mi ispirano e mi spingono ogni giorno a diventare la mia versione migliore.',
    },
    {
        name: 'Luca',
        place: 'Thailandia 2024',
        photo: 'https://images.hostinger.com/4a64f4a1-9120-4a92-a7ce-905f4a738df9.png',
        quote:
            'Dopo il viaggio pensavo sarebbe finita lì. Invece ho trovato una famiglia sparsa per il mondo con cui continuo a condividere vita vera.',
    },
    {
        name: 'Sara',
        place: 'Marocco 2024',
        photo: 'https://images.hostinger.com/f6b98494-247a-42d5-9228-2c1a1209393b.png',
        quote:
            'La community è il luogo dove torno quando ho bisogno di ispirazione o di un consiglio. Qui mi sento sempre a casa.',
    },
];

const PROMISES = [
    { icon: ShieldCheck, text: 'Gruppi piccoli e selezionati' },
    { icon: Heart, text: 'Assistenza prima, durante e dopo il viaggio' },
    { icon: Leaf, text: 'Turismo responsabile e sostenibile' },
    { icon: Smile, text: 'Esperienze autentiche e locali' },
];

export default function CommunityPage() {
    const [active, setActive] = useState(0);
    const { openCommunityModal } = useCommunityModal();

    return (
        <SiteLayout>
            <Helmet>
                <title>Community — WĀNANGA</title>
                <meta
                    name="description"
                    content="La community Wānanga: uno spazio sicuro per condividere esperienze, ispirazioni e legami che continuano dopo il viaggio."
                />
            </Helmet>

            {/* HERO */}
            <section className="bg-background">
                <div className="mx-auto grid max-w-[80rem] items-center gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-12">
                    <Reveal>
                        <h1 className="font-display text-[2.35rem] font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-[3.15rem]">
                            <span className="text-[hsl(100_12%_22%)]">Una community</span>
                            <br />
                            <span className="text-[hsl(100_12%_22%)]">che viaggia,</span>
                            <br />
                            <span className="text-primary">cresce e ispira.</span>
                        </h1>
                        <span className="mt-5 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                        <div className="mt-6 max-w-md space-y-1 text-[15px] leading-relaxed text-foreground/75 sm:text-base">
                            <p>Wānanga non è solo un viaggio.</p>
                            <p>
                                È un insieme di persone che hanno scelto di vivere in modo più autentico e consapevole.
                            </p>
                            <p>È un legame che continua, anche dopo il rientro.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCommunityModal}
                            className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]"
                        >
                            Entra nella community
                        </button>
                    </Reveal>
                    <Reveal delay={0.1} y={28}>
                        <img
                            src={HERO}
                            alt="Community intorno al fuoco sulla spiaggia al tramonto"
                            className="w-full rounded-[1.5rem] object-cover shadow-[0_28px_60px_-28px_hsl(17_50%_28%/0.45)] aspect-[16/11]"
                        />
                    </Reveal>
                </div>
            </section>

            {/* FEATURES */}
            <section className="bg-background pb-16 md:pb-24">
                <div className="mx-auto max-w-[80rem] px-5 md:px-8">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="font-display text-2xl font-bold text-[hsl(100_12%_22%)] sm:text-3xl md:text-[2rem]">
                                Insieme, andiamo oltre il viaggio.
                            </h2>
                            <span className="mx-auto mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                            <p className="mt-5 text-[15px] leading-relaxed text-foreground/70">
                                La nostra community è uno spazio sicuro e positivo dove condividere esperienze, ispirazioni e
                                cambiamenti.
                                <br className="hidden sm:block" />
                                Dove puoi fare domande, trovare supporto, conoscere nuove persone e partecipare a incontri ed
                                eventi speciali.
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <Reveal key={f.title} delay={i * 0.05}>
                                    <div
                                        className={`flex h-full flex-col items-center px-3 text-center ${
                                            i < FEATURES.length - 1
                                                ? 'lg:border-r lg:border-border/70'
                                                : ''
                                        }`}
                                    >
                                        <Icon size={28} className="text-primary" strokeWidth={1.4} />
                                        <h3 className="mt-4 font-display text-[15px] font-bold text-[hsl(100_12%_22%)]">
                                            {f.title}
                                        </h3>
                                        <p className="mt-2 text-[13px] leading-relaxed text-foreground/65">{f.text}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* IN AZIONE */}
            <section className="bg-background pb-16 md:pb-24">
                <div className="mx-auto grid max-w-[80rem] items-start gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:gap-14">
                    <Reveal>
                        <h2 className="font-display text-3xl font-bold leading-tight text-[hsl(100_12%_22%)] md:text-4xl">
                            La community
                            <br />
                            in azione.
                        </h2>
                        <span className="mt-4 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                        <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-foreground/75">
                            Ogni giorno nella nostra community succedono cose belle: nascono amicizie, si condividono consigli
                            di viaggio, si festeggiano traguardi e si trovano nuovi compagni di avventura.
                        </p>
                        <p className="mt-4 max-w-sm text-[15px] font-semibold text-primary">
                            È un luogo vivo, accogliente e autentico.
                        </p>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            {ACTION_PHOTOS.map((p, idx) => (
                                <div
                                    key={p.src}
                                    className={`overflow-hidden rounded-2xl ${
                                        idx === 2
                                            ? 'row-span-2 max-sm:col-span-2 max-sm:row-span-1 max-sm:aspect-[16/10] sm:aspect-auto sm:h-full'
                                            : 'aspect-[4/3]'
                                    }`}
                                >
                                    <img
                                        src={p.src}
                                        alt={p.alt}
                                        className={`h-full w-full object-cover ${idx === 2 ? 'sm:min-h-full' : ''}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="bg-background pb-16 md:pb-20">
                <div className="mx-auto max-w-[80rem] px-5 md:px-8">
                    <Reveal>
                        <div className="text-center">
                            <h2 className="font-display text-2xl font-bold text-[hsl(100_12%_22%)] sm:text-3xl">
                                Cosa dicono le persone della community.
                            </h2>
                            <span className="mx-auto mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                        </div>
                    </Reveal>

                    <div className="mt-10 hidden gap-5 md:grid md:grid-cols-3">
                        {TESTIMONIALS.map((t, i) => (
                            <Reveal key={t.name} delay={i * 0.06}>
                                <article className="flex h-full flex-col rounded-2xl bg-[hsl(30_40%_95%)] px-6 py-7">
                                    <div className="flex gap-4">
                                        <img
                                            src={t.photo}
                                            alt={t.name}
                                            className="h-14 w-14 shrink-0 rounded-full object-cover"
                                        />
                                        <p className="text-[14px] leading-relaxed text-foreground/75">&ldquo;{t.quote}&rdquo;</p>
                                    </div>
                                    <div className="mt-5 pl-[4.5rem]">
                                        <p className="font-display text-sm font-bold text-[hsl(100_12%_22%)]">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.place}</p>
                                    </div>
                                </article>
                            </Reveal>
                        ))}
                    </div>

                    {/* Mobile carousel */}
                    <div className="mt-10 md:hidden">
                        <article className="rounded-2xl bg-[hsl(30_40%_95%)] px-6 py-7">
                            <div className="flex gap-4">
                                <img
                                    src={TESTIMONIALS[active].photo}
                                    alt={TESTIMONIALS[active].name}
                                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                                />
                                <p className="text-[14px] leading-relaxed text-foreground/75">
                                    &ldquo;{TESTIMONIALS[active].quote}&rdquo;
                                </p>
                            </div>
                            <div className="mt-5 pl-[4.5rem]">
                                <p className="font-display text-sm font-bold text-[hsl(100_12%_22%)]">
                                    {TESTIMONIALS[active].name}
                                </p>
                                <p className="text-xs text-muted-foreground">{TESTIMONIALS[active].place}</p>
                            </div>
                        </article>
                        <div className="mt-5 flex justify-center gap-2">
                            {TESTIMONIALS.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`Testimonianza ${i + 1}`}
                                    onClick={() => setActive(i)}
                                    className={`h-2 w-2 rounded-full transition-colors ${
                                        i === active ? 'bg-primary' : 'bg-border'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 hidden justify-center gap-2 md:flex">
                        {TESTIMONIALS.map((_, i) => (
                            <span
                                key={i}
                                className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-border'}`}
                                aria-hidden
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="bg-background pb-14 md:pb-20">
                <div className="mx-auto max-w-[80rem] px-5 md:px-8">
                    <Reveal>
                        <div className="relative overflow-hidden rounded-[1.75rem]">
                            <img
                                src={CTA_BG}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                                aria-hidden
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(100_18%_14%/0.92)] via-[hsl(100_16%_16%/0.78)] to-[hsl(100_14%_18%/0.35)]" />
                            <div className="relative grid items-center gap-8 px-8 py-12 sm:px-12 md:grid-cols-[1fr_1.1fr] md:py-14 lg:px-16">
                                <div>
                                    <h2 className="font-display text-3xl font-bold text-white md:text-[2.15rem]">
                                        Sei dei nostri?
                                    </h2>
                                    <span className="mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                                    <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85">
                                        Che tu abbia già viaggiato con noi o stia ancora scegliendo la tua destinazione, la
                                        community è pronta ad accoglierti.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openCommunityModal}
                                        className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]"
                                    >
                                        Entra nella community
                                    </button>
                                </div>
                                <div className="hidden md:block" aria-hidden />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* PROMISES */}
            <section className="border-t border-border/50 bg-background">
                <div className="mx-auto grid max-w-[80rem] gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border/70 md:px-8">
                    {PROMISES.map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-3 md:justify-center md:px-5">
                            <Icon size={22} className="shrink-0 text-primary" strokeWidth={1.5} />
                            <p className="text-sm leading-snug text-foreground/70">{text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
