import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  TreePalm,
  Users,
  Sun,
  CalendarDays,
  MapPin,
  ArrowRight,
  Sparkles,
  Leaf,
  Flame,
  Heart,
  Waves,
  Check,
  ChevronDown,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { faqItems } from '@/data/faq';

/* — Bali imagery — */
const HERO =
  'https://images.hostinger.com/92415ae6-aca0-41e3-ac76-ad6004b4bdde.png';
const RICE =
  'https://images.hostinger.com/7280a913-f298-4bb6-97b6-143d540459a2.png';
const TEMPLE =
  'https://images.hostinger.com/71e62ad3-e380-45f4-b78f-db36e1292960.png';
const SEA =
  'https://images.hostinger.com/850e71c5-4a9f-4bdf-8671-4163c06d28b3.png';
const YOGA =
  'https://images.hostinger.com/466eac4c-0c8c-45ce-871c-de4f0734ee7c.png';
const FOOD =
  'https://images.hostinger.com/0ddf17e1-795e-42c9-9b36-d82517e8e821.png';
const SWING =
  'https://images.hostinger.com/d8888505-00b6-429f-9856-b22a8eed4264.png';
const GROUP =
  'https://images.hostinger.com/86db96dc-3f20-4ce6-a72f-66d4b989e5bd.png';
const DAWN =
  'https://images.hostinger.com/998e3ff6-b478-47aa-a4ad-ac8e6a33be41.png';

const pillars = [
  {
    icon: TreePalm,
    title: 'SCOPRIRE BALI',
    text: 'Luoghi autentici, cultura locale e la nostra Bali, quella vera.',
  },
  {
    icon: Users,
    title: 'CONOSCERE PERSONE',
    text: 'Nuove amicizie, storie diverse e connessioni vere.',
  },
  {
    icon: Sun,
    title: 'DEDICARSI TEMPO',
    text: 'Momenti per sé, per riflettere, condividere e semplicemente vivere.',
  },
];

const included = [
  'Tutti i pernottamenti in guesthouse e homestay selezionati',
  'Trasporti interni privati e traghetti',
  'Colazioni e 8 cene condivise con cucina locale',
  'Guide locali, ingressi ai templi e alle attività',
  'Accompagnamento di Riccardo e Fátima per tutti i 15 giorni',
  "Cerchi di condivisione, yoga all'alba e tempo libero reale",
];

/* — Cosa vivrai a Bali: cinque temi — */
const themes = [
  {
    icon: Leaf,
    kicker: 'Natura',
    title: 'Risaie, vulcani e oceano',
    text: "Camminiamo tra le terrazze di Tegallalang, saliamo all'alba sul Monte Batur e ci lasciamo accogliere dall'oceano di Nusa Penida. La natura di Bali non si visita: si respira.",
    image: RICE,
    alt: 'Risaie a terrazza di Tegallalang con palme tropicali a Bali',
  },
  {
    icon: Flame,
    kicker: 'Spiritualità',
    title: 'Templi, offerte e silenzio',
    text: 'Partecipiamo a una benedizione al tempio, impariamo a intrecciare le offerte del mattino e troviamo il silenzio scelto tra i cortili di pietra coperti di muschio. Bali respira il sacro, ogni giorno.',
    image: TEMPLE,
    alt: "Tempio balinese all'alba con offerte di fiori e incenso",
  },
  {
    icon: Sparkles,
    kicker: 'Cultura',
    title: 'Mercati, cucine e famiglie',
    text: "Viviamo la cultura dall'interno: i mercati all'aperto, una lezione di cucina con una famiglia balinese, i villaggi di tessitori e i warung dove si mangia con le mani. Niente da turisti, tutto da locali.",
    image: FOOD,
    alt: 'Colazione balinese condivisa con una famiglia a Ubud',
  },
  {
    icon: Heart,
    kicker: 'Persone',
    title: 'Dodici viaggiatori, una comunità',
    text: 'Si parte anche da soli: il gruppo nasce proprio lì. Cerchi al tramonto, cene lunghe, risate e conversazioni che continuano dopo il viaggio. A Bali si torna con amici, non solo con foto.',
    image: GROUP,
    alt: 'Gruppo di viaggiatori Wānanga insieme al tramonto su una spiaggia di Bali',
  },
  {
    icon: Waves,
    kicker: 'Ritmo lento',
    title: 'Niente corse, solo tempo',
    text: 'Niente sveglie inutili, niente bus affollati. Un ritmo che lascia spazio al riposo, alla noia buona, alle deviazioni non previste. Ci fermiamo dove vale la pena restare e lasciamo che Bali ci raggiunga.',
    image: SEA,
    alt: "Barca tradizionale su acque turchesi dell'isola di Nusa Penida",
  },
];

const days = [
  {
    r: 'Giorni 1 – 3',
    t: 'Canggu: arrivo e respiro',
    d: 'Ci conosciamo davanti al primo tramonto, colazioni lente e il cerchio di apertura del viaggio.',
  },
  {
    r: 'Giorni 4 – 7',
    t: 'Ubud: giungla e cerimonie',
    d: 'Risaie di Tegallalang, benedizione al tempio, mercato locale e cucina balinese con una famiglia.',
  },
  {
    r: 'Giorni 8 – 10',
    t: 'Sidemen e Monte Batur',
    d: 'Alba sul vulcano, sorgenti calde, villaggi di tessitori e due giorni di silenzio scelto.',
  },
  {
    r: 'Giorni 11 – 14',
    t: 'Nusa Penida e oceano',
    d: 'Snorkeling tra le mante, scogliere, e il cerchio di chiusura: cosa ci portiamo a casa.',
  },
];

const gallery = [
  { src: SWING, alt: "Viaggiatrice sull'altalena nella giungla di Bali" },
  { src: DAWN, alt: "Piccolo gruppo all'alba su un punto panoramico di Bali" },
  { src: YOGA, alt: "Cortile di un tempio balinese all'alba tra offerte e vegetazione" },
  { src: TEMPLE, alt: 'Dettaglio di offerte floreali e incenso in un tempio di Bali' },
  { src: SEA, alt: 'Acque turchesi e scogliere di Nusa Penida' },
  { src: FOOD, alt: 'Tavola di cucina balinese condivisa a Ubud' },
];

export default function ViaggiPage() {
  return (
    <SiteLayout>
      <Helmet>
        <title>WĀNANGA Bali — Il nostro primo viaggio | Viaggi, persone, vita</title>
        <meta
          name="description"
          content="Il primo WĀNANGA è a Bali: 15 giorni dal 15 al 29 giugno 2025, un gruppo di 12 persone con Riccardo e Fátima. Natura, spiritualità, cultura e ritmo lento. Scopri il viaggio e candidati."
        />
      </Helmet>

      {/* ───────── HERO — foto a campo largo con titolo sovrapposto ───────── */}
      <section className="relative isolate overflow-hidden">
        {/* Foto full-bleed a campo largo come sfondo */}
        <img
          src={HERO}
          alt="Tramonto tropicale a Bali tra palme, oceano e villa sulla scogliera"
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
        />
        {/* Overlay per garantire contrasto leggibile del titolo */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/30" />

        {/* Contenuto sovrapposto alla foto */}
        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[80rem] flex-col px-5 sm:px-8 md:px-10 lg:px-14">
          {/* Barra logo + CTA */}
          <div className="flex items-center justify-between py-5 md:py-6">
            <Link
              to="/"
              className="font-display w-fit text-[1.4rem] font-bold tracking-[0.2em] text-primary md:text-[1.65rem]"
            >
              WĀNANGA
            </Link>
          </div>

          {/* Titolo e testo dentro la foto */}
          <div className="flex flex-1 flex-col justify-center pb-16 pt-6 md:pb-20">
            <h1 className="font-display max-w-[52rem] font-bold leading-[1.02] tracking-tight">
              <span className="block text-[clamp(2.5rem,5.8vw,4rem)] text-foreground">
                Il primo
              </span>
              <span className="block text-[clamp(2.5rem,5.8vw,4rem)] text-primary">
                WĀNANGA
              </span>
              <span className="block text-[clamp(2.5rem,5.8vw,4rem)] text-foreground">
                sarà a Bali.
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
            <p className="mt-7 max-w-[32rem] text-[15px] leading-[1.75] text-foreground/80 md:mt-8 md:text-[1.05rem]">
              Un piccolo gruppo, un luogo che conosciamo
              profondamente e un modo diverso di viaggiare.
              Esploreremo Bali, conosceremo nuove persone
              e ci prenderemo il tempo per vivere qualcosa
              che non finisca soltanto nelle fotografie.
            </p>
            <Link
              to="/candidatura-bali"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_14px_30px_-12px_hsl(17_72%_47%/0.5)] transition-transform hover:-translate-y-px active:scale-[0.98] sm:text-sm"
            >
              Candidati al viaggio
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <span className="sr-only">IL PRIMO WĀNANGA SARÀ A BALI</span>
          </div>
        </div>
      </section>

      {/* ───────── TRIP FACTS BAR ───────── */}
      <div className="relative z-10 -mt-1 border-b border-border/60 bg-[#FDEFE2]/80 backdrop-blur-sm">
        <div className="mx-auto grid max-w-[80rem] gap-6 px-5 py-7 sm:grid-cols-3 md:px-8">
          {[
            { icon: CalendarDays, k: 'Date', v: '15 – 29 giugno 2025' },
            { icon: Users, k: 'Gruppo', v: '12 persone + i fondatori' },
            { icon: MapPin, k: 'Tappe', v: 'Canggu · Ubud · Sidemen · Nusa Penida' },
          ].map((s) => (
            <div key={s.k} className="flex items-center gap-3">
              <s.icon size={22} strokeWidth={1.5} className="shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {s.k}
                </p>
                <p className="font-display text-sm font-semibold text-foreground">{s.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───────── THREE PILLARS ───────── */}
      <section className="relative z-10 px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[72rem] rounded-[1.75rem] border border-border/50 bg-card px-5 py-12 shadow-[0_20px_50px_-30px_hsl(20_30%_20%/0.35)] sm:px-8 md:px-10 md:py-14">
          <Reveal>
            <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[hsl(20_25%_22%)] md:text-xs">
              Non sarà un tour. Non sarà un retreat.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border/70">
            {pillars.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.07}>
                <div className="flex flex-col items-center px-4 text-center md:px-8">
                  <Icon size={32} strokeWidth={1.35} className="text-primary" />
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    {title}
                  </p>
                  <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[72rem] text-center">
          <Reveal>
            <a
              href="#itinerario"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-80"
            >
              Scopri il viaggio in dettaglio
              <ArrowRight size={16} strokeWidth={2.2} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───────── PERCHÉ BALI ───────── */}
      <section className="mx-auto max-w-[72rem] px-5 py-20 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              Perché Bali, perché adesso
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">
              La nostra seconda casa
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-foreground/80">
              <p>
                Bali è l'isola che ci ha accolti quando l'Asia era ancora
                tutta da scoprire. Ci conosciamo le strade sterrate, i warung dove
                si mangia con le mani, le famiglie che ci hanno insegnato a fare le
                offerte del mattino.
              </p>
              <p>
                Per questo il primo viaggio Wānanga parte da qui: non un tour, ma un
                ritmo. Niente sveglie inutili, niente bus da cinquanta persone. Solo
                dodici viaggiatori, guide locali e tanto tempo per stare.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {included.map((i) => (
                <p key={i} className="flex gap-2 text-sm text-foreground/75">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  {i}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12} y={28}>
            <div className="grid grid-cols-2 gap-3">
              <img
                src={TEMPLE}
                alt="Tempio balinese all'alba con offerte di fiori"
                className="col-span-2 h-64 w-full rounded-[1.5rem] object-cover"
              />
              <img
                src={SEA}
                alt="Barca tradizionale su acque turchesi a Nusa Penida"
                className="h-40 w-full rounded-[1.25rem] object-cover"
              />
              <img
                src={FOOD}
                alt="Colazione balinese condivisa a Ubud"
                className="h-40 w-full rounded-[1.25rem] object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── CTA: Candidati al viaggio (dopo le info principali) ───────── */}
      <section className="px-5 py-10 md:px-8 md:py-12">
        <div className="mx-auto max-w-[72rem] text-center">
          <Reveal>
            <Link
              to="/candidatura-bali"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_14px_30px_-12px_hsl(17_72%_47%/0.5)] transition-transform hover:-translate-y-px active:scale-[0.98] sm:text-sm"
            >
              Candidati al viaggio
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────── FULL-BLEED IMAGE BREAK ───────── */}
      <section className="relative overflow-hidden">
        <img
          src={YOGA}
          alt="Cortile di un tempio balinese all'alba, tra offerte e vegetazione tropicale"
          className="h-72 w-full object-cover md:h-80"
        />
      </section>

      {/* ───────── COSA VIVRAI A BALI — cinque temi a zig-zag ───────── */}
      <section className="bg-[#FDEFE2]">
        <div className="mx-auto max-w-[76rem] px-5 py-20 md:px-8 md:py-24">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              Cosa vivrai
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">
              Cinque modi di incontrare Bali
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Non un itinerario da spuntare, ma un'esperienza da attraversare.
              Natura, spiritualità, cultura, persone e ritmo lento: ecco cosa ti
              porti a casa.
            </p>
          </Reveal>

          <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
            {themes.map((th, i) => {
              const Icon = th.icon;
              const flip = i % 2 === 1;
              return (
                <Reveal key={th.kicker} y={24}>
                  <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                    <div className={flip ? 'md:order-2' : ''}>
                      <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_50px_-28px_hsl(20_30%_20%/0.45)]">
                        <img
                          src={th.image}
                          alt={th.alt}
                          className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105 md:h-[22rem]"
                        />
                      </div>
                    </div>
                    <div className={flip ? 'md:order-1' : ''}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon size={22} strokeWidth={1.6} />
                        </span>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                          {th.kicker}
                        </p>
                      </div>
                      <h3 className="font-display mt-5 text-2xl font-bold leading-tight text-foreground md:text-3xl">
                        {th.title}
                      </h3>
                      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/75 md:text-base">
                        {th.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── GALLERY ───────── */}
      <section className="bg-background px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[76rem]">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              Galleria
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-accent md:text-4xl">
              Bali, in qualche immagine
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Un assaggio di ciò che vivrai. Le foto non rendono giustizia: ma
              aiutano a sognare.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {gallery.map((g, i) => (
              <Reveal key={g.src} delay={i * 0.05}>
                <div className="group overflow-hidden rounded-[1.25rem] shadow-[0_14px_34px_-22px_hsl(20_30%_15%/0.5)]">
                  <img
                    src={g.src}
                    alt={g.alt}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      i === 0 ? 'h-56 md:h-72 md:row-span-2' : 'h-40 md:h-52'
                    }`}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TIMELINE ───────── */}
      <section
        id="itinerario"
        className="scroll-mt-24 border-y border-border/60 bg-secondary/40"
      >
        <div className="mx-auto max-w-[64rem] px-5 py-20 md:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              Il ritmo del viaggio
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-primary md:text-4xl">
              Quindici giorni, quattro capitoli
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Una panoramica dell'esperienza. Il programma completo, tappa per
              tappa, lo trovi nella pagina di Bali.
            </p>
          </Reveal>

          <div className="mt-12 space-y-0 border-l-2 border-primary/25 pl-7">
            {days.map((d, i) => (
              <Reveal key={d.t} delay={i * 0.06}>
                <div className="relative pb-10">
                  <span className="absolute -left-[2.3rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                    {d.r}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-semibold text-foreground">
                    {d.t}
                  </h3>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">
                    {d.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.05}>
            <a
              href="#itinerario"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Vedi il programma completo
              <ArrowRight size={15} strokeWidth={2.2} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ───────── CANDIDATURA ───────── */}
      <section className="border-y border-border/60 bg-secondary/40 px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[60rem] rounded-[1.75rem] border border-primary/25 bg-card px-6 py-10 text-center shadow-[0_20px_50px_-30px_hsl(20_30%_20%/0.35)] md:px-10 md:py-14">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
              Il primo passo
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-foreground md:text-4xl">
              Vuoi partire con noi?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Raccontaci chi sei e cosa cerchi: la candidatura è il primo passo per conoscerci prima di partire.
            </p>
            <Link
              to="/candidatura-bali"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_14px_30px_-12px_hsl(17_72%_47%/0.5)] transition-transform hover:-translate-y-px active:scale-[0.98] sm:text-sm"
            >
              Candidati al viaggio
              <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────── FAQ ESSENZIALI ───────── */}
      <section className="bg-background px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[68rem]">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
              Prima di partire
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-primary md:text-4xl">
              Cose da sapere
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Le domande che ci fate più spesso. Per qualsiasi altro dubbio,
              scrivici: ti rispondiamo noi, Riccardo e Fátima.
            </p>
          </Reveal>

          <div className="mt-10 border-t border-border/80">
            {faqItems.map((item, i) => (
              <Reveal key={item.question} delay={i * 0.05}>
                <details className="group border-b border-border/80">
                  <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center justify-between gap-6 bg-[#FDEFE2] px-5 py-5 text-left font-display text-base font-semibold text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden sm:px-6">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="shrink-0 text-primary transition-transform duration-300 group-open:rotate-180"
                      size={20}
                      strokeWidth={1.8}
                    />
                  </summary>
                  <p className="bg-[#FDEFE2]/45 px-5 pb-6 pt-1 text-[15px] leading-relaxed text-foreground/75 sm:px-6">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.05}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-80"
              >
                Vedi tutte le FAQ
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </SiteLayout>
  );
}
