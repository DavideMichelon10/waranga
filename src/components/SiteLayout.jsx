import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Instagram, Facebook } from 'lucide-react';

const LOGO = 'https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/b35740afe47a15e299688d28ae419cfa.jpg';

const links = [
    { to: '/chi-siamo', label: 'Chi siamo' },
    { to: '/viaggi', label: 'Bali' },
    { to: '/filosofia', label: 'Filosofia' },
    { to: '/community', label: 'Community' },
    { to: '/contattaci', label: 'Contattaci' },
    { to: '/faq', label: 'FAQ' },
];

export function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[80rem] items-center justify-between px-5 py-3 md:px-8">
                <Link to="/" className="flex items-center gap-3">
                    <img src={LOGO} alt="Logo WĀNANGA" className="h-11 w-11 rounded-full object-cover" />
                    <span className="leading-tight">
                        <span className="font-display block text-lg font-bold tracking-[0.22em] text-primary">WĀNANGA</span>
                        <span className="block text-[10px] tracking-[0.18em] text-muted-foreground">VIAGGI, PERSONE, VITA.</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            className={({ isActive }) => {
                                const hashOnly = l.to.includes('#');
                                const active = hashOnly ? false : isActive;
                                return `text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${active ? 'text-primary' : 'text-foreground/70 hover:text-primary'}`;
                            }}
                        >
                            {l.label}
                        </NavLink>
                    ))}
                    <Link
                        to="/viaggi#candidatura"
                        className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]"
                    >
                        Parti con noi
                    </Link>
                </nav>

                <button
                    type="button"
                    aria-label="Apri menu"
                    onClick={() => setOpen((v) => !v)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary md:hidden"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {open && (
                <nav className="border-t border-border/60 bg-background px-5 py-4 md:hidden">
                    {links.map((l) => (
                        <Link
                            key={l.label}
                            to={l.to}
                            onClick={() => setOpen(false)}
                            className="block py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}

const footerLinks = [
    { to: '/chi-siamo', label: 'Chi siamo' },
    { to: '/viaggi', label: 'Viaggi' },
    { to: '/viaggi', label: 'Esperienze' },
    { to: '/filosofia', label: 'Filosofia' },
    { to: '/community', label: 'Community' },
    { to: '/contattaci', label: 'Contattaci' },
    { to: '/faq', label: 'FAQ' },
];

const socials = [
    { href: 'https://instagram.com/wananga.travel', label: 'Instagram', Icon: Instagram },
    { href: 'https://facebook.com/wananga.travel', label: 'Facebook', Icon: Facebook },
];

function TikTokIcon({ size = 18, strokeWidth = 1.6 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-[hsl(33_50%_96%)]">
            <div className="mx-auto max-w-[80rem] px-5 py-12 md:px-8 md:py-14">
                <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between md:gap-6">
                    {/* Logo + payoff */}
                    <div className="flex flex-col items-center text-center md:items-start md:text-left">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={LOGO} alt="Logo WĀNANGA" className="h-11 w-11 rounded-full object-cover" />
                            <span className="font-display text-lg font-bold tracking-[0.22em] text-primary">WĀNANGA</span>
                        </Link>
                        <p className="mt-3 text-[11px] tracking-[0.18em] text-muted-foreground">Viaggi, persone, vita.</p>
                    </div>

                    {/* Essential links */}
                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:max-w-[26rem]">
                        {footerLinks.map((l) => (
                            <Link
                                key={l.label}
                                to={l.to}
                                className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-primary"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Social */}
                    <div className="flex items-center gap-5">
                        {socials.map(({ href, label, Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="text-foreground/60 transition-colors hover:text-primary"
                            >
                                <Icon size={18} strokeWidth={1.6} />
                            </a>
                        ))}
                        <a
                            href="https://tiktok.com/@wananga.travel"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                            className="text-foreground/60 transition-colors hover:text-primary"
                        >
                            <TikTokIcon size={18} strokeWidth={1.6} />
                        </a>
                    </div>
                </div>

                {/* Closing phrase */}
                <p className="mt-12 text-center font-display text-sm font-semibold tracking-[0.2em] text-primary/80">
                    In viaggio, insieme.
                </p>

                {/* Thin line */}
                <div className="mt-6 border-t border-border/60" />

                {/* Bottom bar */}
                <div className="mt-5 flex flex-col items-center gap-3 text-[11px] text-muted-foreground md:flex-row md:justify-between">
                    <p>© WĀNANGA 2026</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                        <a href="/privacy-policy" className="transition-colors hover:text-primary">Privacy Policy</a>
                        <span className="text-border" aria-hidden>·</span>
                        <a href="/cookie-policy" className="transition-colors hover:text-primary">Cookie Policy</a>
                        <span className="text-border" aria-hidden>·</span>
                        <a href="/termini" className="transition-colors hover:text-primary">Termini e condizioni</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function SiteLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
