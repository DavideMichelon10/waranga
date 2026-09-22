import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const CommunityModalContext = createContext(null);

export function useCommunityModal() {
  const ctx = useContext(CommunityModalContext);
  if (!ctx) {
    throw new Error('useCommunityModal must be used within CommunityModalProvider');
  }
  return ctx;
}

const SPIRAL = 'https://horizons-cdn.hostinger.com/356254a3-e909-4e6e-be23-5f7439e796ec/b35740afe47a15e299688d28ae419cfa.jpg';

function CommunityModal({ open, onClose }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Reset form whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setNome('');
      setEmail('');
      setPrivacy(false);
      setErrors({});
      setSubmitting(false);
      setDone(false);
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const validate = () => {
    const next = {};
    if (!nome.trim()) next.nome = 'Inserisci il tuo nome.';
    if (!email.trim()) {
      next.email = 'Inserisci la tua email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Inserisci un indirizzo email valido.';
    }
    if (!privacy) next.privacy = 'Devi accettare la Privacy Policy per iscriverti.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await pb.collection('community_subscribers').create({
        nome: nome.trim(),
        email: email.trim(),
        privacy_accepted: true,
      });
      setDone(true);
    } catch (err) {
      if (err?.status === 400 && err?.response?.data?.email) {
        setErrors({ email: 'Questa email è già iscritta alla community.' });
      } else {
        setErrors({ form: 'Qualcosa è andato storto. Riprova tra poco.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop — click outside to close */}
          <div
            className="absolute inset-0 bg-[hsl(20_25%_18%/0.55)] backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] border border-border/70 bg-[hsl(33_60%_97%)] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground/70 transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              <X size={18} strokeWidth={2} />
            </button>

            {done ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check size={28} strokeWidth={2.2} />
                </span>
                <h2 className="font-display mt-6 text-2xl font-bold leading-snug text-[hsl(100_12%_22%)]">
                  Benvenuto in WĀNANGA.
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/70">
                  Il viaggio comincia da qui.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98]"
                >
                  Chiudi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="px-6 py-9 sm:px-8">
                <div className="mb-6 flex items-center gap-3">
                  <img src={SPIRAL} alt="" className="h-9 w-9 rounded-full object-cover" aria-hidden />
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                    WĀNANGA
                  </span>
                </div>

                <h2 id="community-modal-title" className="font-display text-2xl font-bold leading-tight text-[hsl(100_12%_22%)] sm:text-[1.7rem]">
                  Entra nella community WĀNANGA
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-foreground/70">
                  Storie, riflessioni, nuovi viaggi e piccoli pezzi del nostro mondo. Direttamente nella tua email.
                </p>

                <div className="mt-6 space-y-4">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <label htmlFor="cm-nome" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/70">
                      Nome
                    </label>
                    <input
                      id="cm-nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Il tuo nome"
                      autoComplete="given-name"
                    />
                    {errors.nome && <p className="text-[12px] text-destructive">{errors.nome}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="cm-email" className="block text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/70">
                      Email
                    </label>
                    <input
                      id="cm-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="la-tua@email.com"
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-[12px] text-destructive">{errors.email}</p>}
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={privacy}
                        onChange={(e) => setPrivacy(e.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-primary accent-[hsl(17_72%_47%)] focus:ring-2 focus:ring-primary/30"
                        aria-describedby="cm-privacy-err"
                      />
                      <span className="text-[13px] leading-relaxed text-foreground/70">
                        Ho letto e accetto la{' '}
                        <a href="/privacy-policy" className="font-semibold text-primary underline-offset-2 hover:underline">
                          Privacy Policy
                        </a>{' '}
                        e autorizzo il trattamento dei miei dati per ricevere le comunicazioni WĀNANGA.
                      </span>
                    </label>
                    {errors.privacy && <p id="cm-privacy-err" className="mt-1 text-[12px] text-destructive">{errors.privacy}</p>}
                  </div>
                </div>

                {errors.form && <p className="mt-4 text-[13px] text-destructive">{errors.form}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-primary px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Iscrizione…' : 'Entra nella community'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CommunityModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openCommunityModal = useCallback(() => setOpen(true), []);
  const closeCommunityModal = useCallback(() => setOpen(false), []);

  return (
    <CommunityModalContext.Provider value={{ openCommunityModal, closeCommunityModal }}>
      {children}
      <CommunityModal open={open} onClose={closeCommunityModal} />
    </CommunityModalContext.Provider>
  );
}

export default CommunityModalProvider;
