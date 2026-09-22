import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  TreePalm,
  Users,
  Sun,
  MessagesSquare,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import Seo from '@/components/Seo';
import SiteLayout from '@/components/SiteLayout';
import CandidaturaForm from '@/components/CandidaturaForm';

/* — Bali imagery (stessa selezione della pagina Bali) — */
const HERO =
  'https://images.hostinger.com/998e3ff6-b478-47aa-a4ad-ac8e6a33be41.png';
const RICE =
  'https://images.hostinger.com/7280a913-f298-4bb6-97b6-143d540459a2.png';
const GROUP =
  'https://images.hostinger.com/86db96dc-3f20-4ce6-a72f-66d4b989e5bd.png';

const spiritCards = [
  {
    icon: TreePalm,
    title: 'Un luogo che conosciamo',
    text: 'Bali è la nostra seconda casa. Le strade, le famiglie, i warung, i templi: ci siamo già stati, tante volte, e siamo dove portare chi viene con noi.',
  },
  {
    icon: Users,
    title: 'Un piccolo gruppo',
    text: 'Dodici viaggiatori, non cinquanta. Si parte anche da soli e si torna con amici: il gruppo nasce proprio durante il viaggio.',
  },
  {
    icon: Sun,
    title: 'Un ritmo vero',
    text: 'Niente corse, niente sveglie inutili. Tempo per stare, per riposare, per le deviazioni non previste. Bali ci raggiunge, non la rincorriamo.',
  },
];

const questionsIntro = [
  {
    icon: MessagesSquare,
    title: 'Le domande sono dentro il modulo',
    text: 'Non c’è una risposta giusta. Le quattro domande che ti aiutiamo a farci sono ora campi del modulo di candidatura: puoi rispondere con calma, insieme agli altri dati, e noi le leggiamo prima di ricontattarti.',
  },
];

export default function CandidaturaBaliPage() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Candidati al viaggio WĀNANGA Bali | Viaggi, persone, vita</title>
        <meta
          name="description"
          content="Candidati al primo viaggio WĀNANGA a Bali: 15 giorni, un piccolo gruppo di 12 persone con Riccardo e Fátima. La candidatura è il primo passo per conoscerci prima di partire."
        />
      </Helmet>
      <Seo
        title="Candidati al viaggio WĀNANGA Bali"
        description="Il primo WĀNANGA è a Bali: 15 giorni, 12 persone, ritmo lento. La candidatura serve anche a conoscerci prima di partire. Raccontaci chi sei."
        image={HERO}
        siteName="WĀNANGA"
        type="website"
      />

      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden">
        <img
          src={HERO}
          alt="Piccolo gruppo di viaggiatori WĀNANGA insieme all'alba su un punto panoramico di Bali"
          className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/30" />

        <div className="relative z-10 mx-auto flex min-h-[88dvh] w-full max-w-[80rem] flex-col px-5 sm:px-8 md:px-10 lg:px-14">
          <div className="flex items-center justify-between py-5 md:py-6">
            <Link
              to="/viaggi"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:text-primary"
            >
              <ArrowLeft size={15} strokeWidth={2.2} />
              Torna alla pagina Bali
            </Link>
          </div>

          <div className="flex flex-1 flex-col justify-center pb-16 pt-6 md:pb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              Candidatura · WĀNANGA Bali
            </p>
            <h1 className="font-display mt-4 max-w-[44rem] font-bold leading-[1.04] tracking-tight">
              <span className="block text-[clamp(2.2rem,5.2vw,3.6rem)] text-foreground">
                Prima di partire,
              </span>
              <span className="block text-[clamp(2.2rem,5.2vw,3.6rem)] text-primary">
                vogliamo conoscerci.
              </span>
            </h1>
            <svg
              className="mt-3 h-3.5 w-24 text-primary md:mt-4 md:w-32"
              viewBox="0 0 140 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 9c22-7 44-8 66-4 24 4 42 3 66-3"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-7 max-w-[34rem] text-[15px] leading-[1.75] text-foreground/80 md:mt-8 md:text-[1.05rem]">
              Il primo WĀNANGA è a Bali: quindici giorni, dodici persone,
              un ritmo lento e un modo diverso di viaggiare. La candidatura
              non è una prenotazione: è il primo passo per capire,
              insieme, se questo viaggio è fatto per te.
            </p>
            <a
              href="#candidatura"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_14px_30px_-12px_hsl(17_72%_47%/0.5)] transition-transform hover:-translate-y-px active:scale-[0.98] sm:text-sm"
            >
              Vai al modulo
              <ArrowRight size={16} strokeWidth={2.2} />
            </a>
          </div>
        </div>
      </section>

      {/* ───────── INTRO: lo spirito WĀNANGA ───────── */}
      <section className="px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[72rem]">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-16">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                Lo spirito del viaggio
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">
                Wānanga è un modo di viaggiare
              </h2>
              <div className="mt-6 space-y-5 leading-relaxed text-foreground/80">
                <p>
                  Non un tour da consumare, non un retreat da subire. Wānanga
                  è un piccolo gruppo che attraversa insieme un luogo,
                  lasciandosi cambiare dal tempo, dalle persone e da ciò che
                  non era previsto.
                </p>
                <p>
                  Per questo non accettiamo chiunque: partiamo in dodici, e
                  ogni persona conta. La candidatura serve a capire se siamo
                  compatibili, se il ritmo ti somiglia, se questo viaggio
                  può davvero essere il tuo.
                </p>
                <p>
                  Compila il modulo qui sotto. Ti ricontatteremo noi, Riccardo
                  e Fátima, per una chiacchierata: senza fretta, senza
                  impegno. È il primo passo per conoscerci prima di partire.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12} y={24}>
              <div className="space-y-4">
                {spiritCards.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-[1.25rem] border border-border/60 bg-card p-5 shadow-[0_14px_34px_-26px_hsl(20_30%_15%/0.4)] md:p-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <div>
                      <p className="font-display text-base font-semibold text-foreground">
                        {title}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── FULL-BLEED IMAGE BREAK ───────── */}
      <section className="relative overflow-hidden">
        <img
          src={RICE}
          alt="Risaie a terrazza di Tegallalang con palme tropicali a Bali"
          className="h-64 w-full object-cover md:h-80"
        />
      </section>

      {/* ───────── INTRO: le domande dentro il modulo ───────── */}
      <section className="bg-[#FDEFE2]">
        <div className="mx-auto max-w-[72rem] px-5 py-20 md:px-8 md:py-24">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                Prima di compilare il modulo
              </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">
              Quattro domande per capirci
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Le troverai direttamente nel modulo di candidatura, insieme agli
              altri dati. Non ci sono risposte giuste: servono a noi, Riccardo e
              Fátima, per capire chi sei e se il ritmo di questo Wānanga ti
              somiglia, prima di sentirci.
            </p>
          </Reveal>

          <div className="mt-12 md:mt-14">
            {questionsIntro.map(({ icon: Icon, title, text }) => (
              <Reveal key={title} y={20}>
                <div className="flex gap-4 rounded-[1.25rem] border border-border/60 bg-background p-6 shadow-[0_14px_34px_-28px_hsl(20_30%_15%/0.4)] md:p-7">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold leading-snug text-foreground">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.05}>
            <div className="mt-12 text-center">
              <a
                href="#candidatura"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_14px_30px_-12px_hsl(17_72%_47%/0.5)] transition-transform hover:-translate-y-px active:scale-[0.98] sm:text-sm"
              >
                Compila la candidatura
                <ArrowRight size={16} strokeWidth={2.2} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── IMMAGINE GRUPPO + CHIAMATA ───────── */}
      <section className="bg-background px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[72rem]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
            <Reveal y={24}>
              <div className="overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_-28px_hsl(20_30%_20%/0.45)]">
                <img
                  src={GROUP}
                  alt="Gruppo di viaggiatori Wānanga insieme al tramonto su una spiaggia di Bali"
                  className="h-72 w-full object-cover md:h-[24rem]"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                Conoscerci prima di partire
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">
                Un viaggio inizia prima di salire in aereo
              </h2>
              <div className="mt-6 space-y-5 leading-relaxed text-foreground/80">
                <p>
                  Quando riceviamo la tua candidatura, non ti mandiamo un
                  modulo da firmare. Ti scriviamo, e poi ci sentiamo: una
                  conversazione semplice, per capire chi sei, cosa cerchi e
                  se il ritmo di questo Wānanga ti somiglia.
                </p>
                <p>
                  Solo dopo, se siamo d'accordo entrambi, si parla di
                  partenza. Perché in dodici, ogni persona cambia il viaggio.
                  E vogliamo che ognuno sia lì per il motivo giusto.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── MODULO DI CANDIDATURA (esistente, invariato) ───────── */}
      <CandidaturaForm destination="Bali" />
    </SiteLayout>
  );
}
