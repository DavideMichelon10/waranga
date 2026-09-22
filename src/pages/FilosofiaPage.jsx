import React from 'react';
import { Helmet } from 'react-helmet';
import { Globe2, Leaf, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { useCommunityModal } from '@/contexts/CommunityModalContext';
const HERO = 'https://images.hostinger.com/0aaeea10-ca19-4cc9-ad52-85f335423b14.png';
const PILLARS = [{
  title: 'Persone',
  icon: Users,
  image: 'https://images.hostinger.com/0acbe982-0737-471e-97ab-010b82bfe1f5.png',
  alt: 'Gruppo di viaggiatori intorno al fuoco',
  text: 'Piccoli gruppi, relazioni vere e connessioni che vanno oltre il viaggio. Crescere insieme, condividere, ispirarsi a vicenda.'
}, {
  title: 'Viaggi',
  icon: Globe2,
  image: 'https://images.hostinger.com/c7aeaba7-c5ed-4933-9cfd-b13241bedf84.png',
  alt: 'Viaggiatore su un pontile davanti a un lago di montagna',
  text: 'Luoghi autentici, lontano dal turismo di massa. Itinerari curati nei dettagli per vivere il mondo in modo profondo e consapevole.'
}, {
  title: 'Vita',
  icon: Leaf,
  image: 'https://images.hostinger.com/867aaf5d-4aa7-43d8-b430-832b3769ff26.png',
  alt: 'Momento di quiete e meditazione al tramonto',
  text: 'Tempo per te, per ascoltarti e ritrovare equilibrio. Ogni viaggio è un’opportunità per tornare alla tua versione migliore.'
}];
const COMMUNITY = ['https://images.hostinger.com/e3b6d63c-95e4-4821-8684-3a4fd74155c4.png', 'https://images.hostinger.com/9a92d3b8-cd5c-4f7c-90d6-d250742f3b26.png', 'https://images.hostinger.com/f1d21261-3366-408f-938b-2e4b9d741a1d.png', 'https://images.hostinger.com/c5948e50-c057-43b5-a5c2-a02265c53882.png'];
export default function FilosofiaPage() {
  const { openCommunityModal } = useCommunityModal();
  return <SiteLayout>
            <Helmet>
                <title>La nostra filosofia — WĀNANGA</title>
                <meta name="description" content="La filosofia Wānanga: viaggi che uniscono scoperta del mondo e crescita personale. Persone, viaggi, vita." />
            </Helmet>

            {/* HERO */}
            <section className="bg-background">
                <div className="mx-auto grid max-w-[80rem] items-center gap-10 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
                    <Reveal>
                        <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
                            <span className="text-[hsl(100_12%_22%)]">La nostra</span>
                            <br />
                            <span className="text-primary">filosofia.</span>
                        </h1>
                        <p className="mt-6 max-w-sm text-base leading-relaxed text-foreground/75 sm:text-lg">
                            Crediamo che il viaggio possa essere molto più di una destinazione.
                            <br />
                            Può essere una scelta di vita.
                        </p>
                        <span className="mt-5 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                    </Reveal>
                    <Reveal delay={0.12} y={28}>
                        <img src={HERO} alt="Coppia che osserva una valle tropicale al tramonto" className="w-full rounded-[1.75rem] object-cover shadow-[0_28px_60px_-28px_hsl(17_50%_28%/0.45)] aspect-[16/11]" />
                    </Reveal>
                </div>
            </section>

            {/* VISIONE */}
            <section className="bg-background">
                <div className="mx-auto max-w-[72rem] px-5 pb-20 md:px-8 md:pb-24">
                    <Reveal>
                        <h2 className="font-display text-3xl font-bold text-[hsl(100_12%_22%)] md:text-4xl">
                            La nostra visione.
                        </h2>
                        <span className="mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                    </Reveal>

                    <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
                        <Reveal>
                            <div className="space-y-5 text-[16px] leading-relaxed text-foreground/78">
                                <p>
                                    Wānanga nasce dalla convinzione che viaggiare significhi molto più che spostarsi da un
                                    luogo all’altro. Per noi è uno strumento potente di trasformazione, un modo per uscire
                                    dalla routine, rimettersi in discussione e ritrovare ciò che conta davvero.
                                </p>
                                <p>
                                    Un viaggio può aprire prospettive, sciogliere paure, farci conoscere persone che ci
                                    cambiano la vita. Può darci il coraggio di scegliere una strada nuova, più autentica,
                                    più nostra.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <div className="space-y-5 text-[16px] leading-relaxed text-foreground/78">
                                <p>
                                    Per questo creiamo esperienze che uniscono scoperta del mondo e crescita personale.
                                </p>
                                <p>
                                    Viaggi di gruppo pensati per chi vuole andare oltre la superficie, condividere un
                                    percorso, lasciarsi ispirare e tornare a casa diverso.
                                </p>
                                <p className="font-semibold text-primary">
                                    Crediamo che quando le persone si incontrano nel posto giusto, possono trasformarsi
                                    quando meno se lo aspettano.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* TRE PILASTRI */}
            <section className="bg-background">
                <div className="mx-auto max-w-[80rem] px-5 pb-20 md:px-8 md:pb-24">
                    <Reveal>
                        <h2 className="font-display text-3xl font-bold text-[hsl(100_12%_22%)] md:text-4xl">
                            I nostri tre pilastri.
                        </h2>
                        <span className="mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                    </Reveal>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {PILLARS.map((p, i) => <Reveal key={p.title} delay={i * 0.08}>
                                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-[hsl(33_45%_97%)] shadow-[0_14px_40px_-28px_hsl(20_30%_20%/0.4)]">
                                    <div className="aspect-[16/11] overflow-hidden">
                                        <img src={p.image} alt={p.alt} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2 px-5 py-5">
                                        <div className="flex items-center gap-2.5">
                                            <p.icon size={22} strokeWidth={1.6} className="text-primary" />
                                            <h3 className="font-display text-xl font-bold text-[hsl(100_12%_22%)]">
                                                {p.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/70">{p.text}</p>
                                    </div>
                                </article>
                            </Reveal>)}
                    </div>
                </div>
            </section>

            {/* COS'È WĀNANGA */}
            <section className="bg-background">
                <div className="mx-auto max-w-[48rem] px-5 pb-20 md:px-8 md:pb-24">
                    <Reveal>
                        <h2 className="font-display text-3xl font-bold text-[hsl(100_12%_22%)] md:text-4xl">Che cosa significa "Wananga"?</h2>
                        <span className="mt-3 block h-[3px] w-10 rounded-full bg-primary" aria-hidden />
                        <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-foreground/78">
                            <p>
                                <em>(pronuncia: Wah-nan-ga)</em>
                            </p>
                            <p>
                                <strong>Wānanga</strong> è una parola che viene dal <em>te reo Māori</em>, la lingua del
                                popolo Māori della Nuova Zelanda.
                            </p>
                            <p>
                                Non ha una traduzione unica in italiano. Significa{' '}
                                <strong>
                                    incontrarsi per condividere, confrontarsi, riflettere e imparare insieme
                                </strong>
                                . È una parola legata alla conoscenza, ma soprattutto al modo in cui quella conoscenza
                                nasce: attraverso l’incontro, il dialogo e lo scambio con gli altri.
                            </p>
                            <p>
                                Tradizionalmente, <em>wānanga</em> indica anche momenti e luoghi dedicati
                                all’apprendimento e alla trasmissione di conoscenze importanti per la comunità.
                            </p>
                            <p>Abbiamo scelto questo nome perché racchiude ciò che vogliamo siano i nostri viaggi.</p>
                            <p>
                                Non semplicemente partire per vedere un posto nuovo, ma{' '}
                                <strong>vivere qualcosa insieme</strong>.
                            </p>
                            <p>
                                Conoscere un luogo e le persone con cui lo attraversiamo. Condividere esperienze,
                                conversazioni e momenti che difficilmente avremmo vissuto rimanendo nella nostra
                                quotidianità. Imparare dagli altri e, inevitabilmente, scoprire qualcosa di nuovo anche
                                di noi stessi.
                            </p>
                            <p className="font-semibold text-[hsl(100_12%_22%)]">
                                Per noi, Wānanga è un viaggio che non si limita a portarci altrove. È un’esperienza che
                                nasce dall’incontro: con un luogo, con gli altri e con noi stessi.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* COMMUNITY */}
            <section className="relative overflow-hidden bg-[hsl(100_12%_28%)] text-white">
                <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, hsl(88 25% 55%) 0%, transparent 45%), radial-gradient(circle at 80% 70%, hsl(30 40% 40%) 0%, transparent 40%)'
      }} aria-hidden />
                <div className="relative mx-auto flex max-w-[80rem] flex-col items-center gap-7 px-6 py-12 text-center md:flex-row md:justify-between md:gap-10 md:px-10 md:py-14 md:text-left">
                    <Reveal>
                        <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                            Fai parte
                            <br className="hidden md:block" /> della community.
                        </h2>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">
                            Consigli, storie, incontri e ispirazioni dal mondo Wānanga.
                        </p>
                        <button
                            type="button"
                            onClick={openCommunityModal}
                            className="mt-6 inline-flex rounded-full bg-primary px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]"
                        >
                            Entra nella community
                        </button>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="relative h-[150px] w-full max-w-[440px] sm:h-[170px] md:h-[190px]">
                            {[{
              src: COMMUNITY[0],
              alt: 'Amici al tramonto su una scogliera tropicale',
              className: 'left-[0%] top-[6%] w-[26%] rotate-[-8deg] z-[1]'
            }, {
              src: COMMUNITY[1],
              alt: 'Momento di quiete su un pontile al lago',
              className: 'left-[26%] top-[0%] w-[22%] rotate-[6deg] z-[2]'
            }, {
              src: COMMUNITY[2],
              alt: 'Cerchio intorno al fuoco in viaggio',
              className: 'right-[24%] top-[4%] w-[24%] -rotate-[4deg] z-[3]'
            }, {
              src: COMMUNITY[3],
              alt: 'Gruppo connesso su un crinale al golden hour',
              className: 'right-[0%] top-[8%] w-[26%] rotate-[-3deg] z-[4]'
            }].map(shot => <figure key={shot.src} className={`absolute bg-white p-1 pb-3 shadow-[0_10px_22px_-12px_rgba(0,0,0,0.55)] ${shot.className}`}>
                                    <img src={shot.src} alt={shot.alt} className="aspect-[4/3] w-full object-cover" />
                                </figure>)}
                        </div>
                    </Reveal>
                </div>
            </section>
        </SiteLayout>;
}