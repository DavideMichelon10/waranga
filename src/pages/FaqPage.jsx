import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SiteLayout from '@/components/SiteLayout';
import { faqItems } from '@/data/faq';

export default function FaqPage() {
    return (
        <SiteLayout>
            <Helmet>
                <title>FAQ — Cose da sapere | WĀNANGA</title>
                <meta name="description" content="Le risposte alle domande più frequenti sui viaggi Wānanga: quote, voli, camere, partecipazione singola e pagamenti." />
            </Helmet>

            <section className="bg-background">
                <div className="mx-auto max-w-[80rem] px-5 py-16 md:px-8 md:py-24">
                    <Reveal>
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">prima di partire</p>
                        <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl md:text-6xl">
                            Cose da sapere.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/75">
                            Le domande che ci fate più spesso, prima di scegliere il vostro prossimo Wānanga.
                        </p>
                    </Reveal>

                    <div className="mt-14 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
                        <Reveal>
                            <div className="max-w-sm border-t-2 border-primary pt-5">
                                <p className="font-display text-2xl font-semibold leading-snug text-accent">
                                    Hai ancora qualche dubbio?
                                </p>
                                <p className="mt-4 leading-relaxed text-foreground/70">
                                    Scrivici: saremo felici di aiutarti a capire se il viaggio è quello giusto per te.
                                </p>
                                <Link
                                    to="/viaggi"
                                    className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-80"
                                >
                                    Scopri i viaggi
                                    <ArrowRight size={16} strokeWidth={2.2} />
                                </Link>
                            </div>
                        </Reveal>

                        <div className="border-t border-border/80">
                            {faqItems.map((item, i) => (
                                <Reveal key={item.question} delay={i * 0.05}>
                                    <details className="group border-b border-border/80">
                                        <summary className="flex min-h-[4.75rem] cursor-pointer list-none items-center justify-between gap-6 bg-[#FDEFE2] px-5 py-5 text-left font-display text-base font-semibold text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden sm:px-6">
                                            <span>{item.question}</span>
                                            <ChevronDown className="shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" size={20} strokeWidth={1.8} />
                                        </summary>
                                        <p className="bg-[#FDEFE2]/45 px-5 pb-6 pt-1 text-[15px] leading-relaxed text-foreground/75 sm:px-6">
                                            {item.answer}
                                        </p>
                                    </details>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
