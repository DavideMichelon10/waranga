import React from 'react';
import { Helmet } from 'react-helmet';
import { Compass, Users, Waves, Leaf, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { useCommunityModal } from '@/contexts/CommunityModalContext';

const HERO_COUPLE =
  'https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/3x8a9240-2-pv6kY.JPG';
const RICCARDO =
  'https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/img_8194-OZSjS.jpeg';
const FATIMA =
  'https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/img_8280-FPdPv.jpeg';

const communityPolaroids = [
  {
    src: 'https://images.hostinger.com/92028a4d-14d1-4643-b869-31ed4194400a.png',
    alt: 'Tramonto in spiaggia con la community Wānanga',
    rotate: '-6deg',
    z: 1,
  },
  {
    src: 'https://images.hostinger.com/78773698-72d1-4aa0-bbb6-8ad129bfc6e1.png',
    alt: 'Viaggiatrice in un campo al tramonto',
    rotate: '4deg',
    z: 2,
  },
  {
    src: 'https://images.hostinger.com/345d37d2-a411-4c4c-be72-cb510ec208f3.png',
    alt: 'Cerchio intorno al fuoco in spiaggia',
    rotate: '-3deg',
    z: 3,
  },
  {
    src: 'https://images.hostinger.com/e25a7531-c2a6-4558-9434-2ef04197d9e2.png',
    alt: "Gruppo di amici seduti insieme all'aperto",
    rotate: '5deg',
    z: 4,
  },
];

const values = [
  {
    icon: Compass,
    title: 'AUTENTICITÀ',
    text: 'Viviamo luoghi e culture nella loro vera essenza.',
    tone: 'text-primary',
  },
  {
    icon: Users,
    title: 'CONNESSIONE',
    text: 'Crediamo nei legami veri che nascono tra le persone.',
    tone: 'text-[hsl(20_25%_30%)]',
  },
  {
    icon: Waves,
    title: 'LENTEZZA',
    text: 'Rallentiamo per godere ogni istante che conta.',
    tone: 'text-[hsl(190_35%_38%)]',
  },
  {
    icon: Leaf,
    title: 'CRESCITA',
    text: "Ogni viaggio è un'opportunità per evolvere e rinascere.",
    tone: 'text-accent',
  },
  {
    icon: Heart,
    title: 'GRATITUDINE',
    text: 'Siamo grati alla vita e a tutto ciò che incontriamo.',
    tone: 'text-primary',
  },
];

export default function ChiSiamoPage() {
  const { openCommunityModal } = useCommunityModal();
  return (
    <SiteLayout>
      <Helmet>
        <title>Chi siamo — Riccardo & Fátima | WĀNANGA</title>
        <meta
          name="description"
          content="Due persone, un modo di viaggiare. Incontra Riccardo e Fátima, fondatori di WĀNANGA: viaggi lenti, connessioni vere e una vita costruita insieme."
        />
      </Helmet>

      {/* HERO — full-viewport couple image with overlaid copy */}
      <section className="relative">
        <div className="relative min-h-[100dvh] w-full overflow-hidden">
          <img
            src={HERO_COUPLE}
            alt="Riccardo e Fátima seduti su una scogliera al tramonto, di spalle verso il mare"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
          <div className="relative mx-auto flex min-h-[100dvh] max-w-[80rem] items-center px-5 py-24 md:px-8">
            <Reveal>
              <h1 className="font-display max-w-md text-[2.35rem] font-bold leading-[1.12] tracking-tight text-[hsl(20_25%_22%)] sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]">
                Due persone,
                <br />
                un modo di
                <br />
                <span className="text-primary">viaggiare.</span>
              </h1>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-foreground/75 md:text-base">
                Siamo Riccardo e Fátima.
                <br />
                Wānanga nasce dalla vita che
                <br className="hidden sm:block" /> abbiamo scelto di costruire insieme.
              </p>
              <span
                className="mt-6 block h-[3px] w-10 rounded-full bg-primary"
                aria-hidden
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Story — two columns */}
      <section className="bg-background">
        <div className="mx-auto max-w-[72rem] px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <h2 className="font-display max-w-xl text-3xl font-bold leading-tight text-[hsl(20_25%_22%)] md:text-4xl">
              Wānanga è nato
              <br className="hidden sm:block" /> molto prima del suo nome.
            </h2>
            <span
              className="mt-4 block h-[3px] w-10 rounded-full bg-primary"
              aria-hidden
            />
          </Reveal>

          <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-2 md:gap-14 lg:gap-20">
            <Reveal>
              <div className="space-y-5 text-[15px] leading-relaxed text-foreground/75 md:text-[16px]">
                <p>
                  Negli anni abbiamo vissuto in diversi paesi, lavorato online,
                  attraversato momenti intensi che ci hanno cambiati per sempre.
                </p>
                <p>
                  Il viaggio è stato la nostra casa, la nostra scuola, la nostra
                  terapia. Ci ha insegnato a rallentare, ad ascoltare, a lasciar
                  andare, a fare spazio a ciò che conta davvero.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="space-y-5 text-[15px] leading-relaxed text-foreground/75 md:text-[16px]">
                <p>
                  Oggi sentiamo il bisogno di condividere tutto questo: creare
                  viaggi che non siano solo spostamenti, ma esperienze che
                  trasformano.
                </p>
                <p>
                  Viaggi in cui tornare a te, agli altri e alla vita.
                </p>
                <p className="font-semibold text-primary">
                  Questo è Wānanga. E siamo felici di condividerlo con te.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Founder cards */}
      <section className="bg-background pb-6 md:pb-10">
        <div className="mx-auto grid max-w-[72rem] gap-12 px-5 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
              <img
                src={RICCARDO}
                alt="Ritratto di Riccardo Bertoldi"
                className="aspect-[4/5] w-full max-w-[220px] shrink-0 rounded-2xl object-cover object-[50%_15%] shadow-[0_20px_40px_-24px_hsl(17_50%_30%/0.4)] sm:w-[42%] sm:max-w-none"
              />
              <div className="min-w-0 pt-1">
                <h3 className="font-display text-2xl font-bold text-[hsl(20_25%_22%)]">
                  Riccardo Bertoldi
                </h3>
                <span
                  className="mt-2 block h-[2px] w-8 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="mt-3 text-sm font-semibold leading-snug text-primary">
                  Scrittore e viaggiatore.
                  <br />
                  Innamorato del cambiamento.
                </p>
                <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-foreground/70">
                  <p>
                    Ho lasciato una vita sicura per inseguire un sogno che
                    sembrava impossibile: vivere di scrittura e viaggiare il
                    mondo.
                  </p>
                  <p>
                    Oggi aiuto le persone a smettere di aspettare il momento
                    perfetto per iniziare a vivere. Credo che ogni viaggio sia
                    prima di tutto un viaggio dentro di sé.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
              <img
                src={FATIMA}
                alt="Ritratto di Fátima"
                className="aspect-[4/5] w-full max-w-[220px] shrink-0 rounded-2xl object-cover object-top shadow-[0_20px_40px_-24px_hsl(17_50%_30%/0.4)] sm:w-[42%] sm:max-w-none"
              />
              <div className="min-w-0 pt-1">
                <h3 className="font-display text-2xl font-bold text-[hsl(20_25%_22%)]">
                  Fátima
                </h3>
                <span
                  className="mt-2 block h-[2px] w-8 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="mt-3 text-sm font-semibold leading-snug text-primary">
                  Scrittrice e nomade digitale.
                  <br />
                  Anime, parole e connessioni.
                </p>
                <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-foreground/70">
                  <p>
                    Scrivo per dare voce a ciò che sentiamo ma non sempre
                    riusciamo a dire. Il viaggio mi ha insegnato che le persone
                    sono il posto più bello in cui fermarsi.
                  </p>
                  <p>
                    In Wānanga mi occupo di creare spazi di ascolto,
                    condivisione e crescita che fanno bene al cuore.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Five values */}
      <section className="bg-background py-14 md:py-16">
        <div className="mx-auto max-w-[80rem] px-5 md:px-8">
          <div className="rounded-[1.5rem] border border-border/50 bg-[hsl(33_50%_97%)] px-4 py-10 shadow-[inset_0_1px_0_hsl(33_40%_100%/0.8)] sm:px-6 md:px-4 md:py-12">
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 md:grid-cols-5 md:gap-0 md:divide-x md:divide-border/60">
              {values.map(({ icon: Icon, title, text, tone }, i) => (
                <Reveal key={title} delay={i * 0.05}>
                  <div className="flex flex-col items-center px-3 text-center md:px-5">
                    <Icon size={28} strokeWidth={1.4} className={tone} />
                    <p
                      className={`mt-3 text-[11px] font-bold uppercase tracking-[0.16em] ${tone}`}
                    >
                      {title}
                    </p>
                    <p className="mt-2 max-w-[11rem] text-[12px] leading-snug text-foreground/60 md:text-[13px]">
                      {text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
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
                zIndex: p.z,
              }}>
                <img src={p.src} alt={p.alt} className="aspect-[4/5] w-full object-cover" />
              </span>)}
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
