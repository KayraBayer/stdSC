// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  BookOpen,
  ClipboardList,
  FileText,
  ExternalLink,
  SquareLibrary,
  Presentation,
  Layers,
  ChevronDown,
} from "lucide-react";
import { db } from "../firebaseConfig";
import Logo from "../assets/logo.png";
import BottomNav from "./components/bottomNav";
import Spinner from "./components/spinner";
import { motion } from "framer-motion";

/* ——— Tipler ——— */
type SlideItem = { name: string; link?: string };
type SlideCategoryBlock = { category: string; slides: SlideItem[] };

type TestItem = {
  name: string;
  link?: string;
  closing: Date | null;
  testmakerLink?: string; // ✅ eklendi
};
type TestCategoryBlock = { category: string; tests: TestItem[] };

/* ——— Günün Sözü tipi ——— */
type QuoteItem = { author: string; quote: string; source?: string };

type PastelColor = "indigo" | "emerald" | "rose" | "slate";

/* ——— Dark-Pastel yardımcıları ——— */
const pastelBadge: Record<PastelColor, string> = {
  indigo: "bg-indigo-500/10 text-indigo-300 ring-indigo-400/20",
  emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  rose: "bg-rose-500/10 text-rose-300 ring-rose-400/20",
  slate: "bg-white/5 text-slate-200 ring-white/10",
};
const pastelText: Record<Exclude<PastelColor, "slate">, string> = {
  indigo: "text-indigo-300",
  emerald: "text-emerald-300",
  rose: "text-rose-300",
};

const IconBadge: React.FC<{ color?: PastelColor; className?: string; children: React.ReactNode }> = ({
  color = "indigo",
  children,
  className = "",
}) => (
  <span
    className={`inline-flex m-1 h-7 w-7 items-center justify-center rounded-full ring-1 ${pastelBadge[color]} ${className}`}
  >
    {children}
  </span>
);

const SectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  color?: Exclude<PastelColor, "slate">;
  children: React.ReactNode;
}> = ({ icon: Icon, color = "indigo", children }) => (
  <div className="mb-3 flex items-center gap-2">
    <IconBadge color={color}>
      <Icon className="h-4 w-4" />
    </IconBadge>
    <h2 className={`text-base font-semibold ${pastelText[color]}`}>{children}</h2>
  </div>
);

/* ——— Basit Card ——— */
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`rounded-xl border border-white/10 bg-neutral-900 shadow-sm ${className}`}>{children}</div>
);

/* ——— Mobil için stabil Collapsible (dark) ——— */
const Collapsible: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: PastelColor;
  children: React.ReactNode;
}> = ({ title, icon: Icon, color = "indigo", children }) => {
  const [open, setOpen] = useState(false);
  const [maxH, setMaxH] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setMaxH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = setTimeout(measure, 50);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [children, open]);

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border-b border-white/10 px-4 py-3 text-left text-[15px] font-semibold text-slate-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <span className="inline-flex items-center gap-2">
          <IconBadge color={color}>
            <Icon className="h-4 w-4" />
          </IconBadge>
          {title}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-slate-400">
          ▼
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={open ? { maxHeight: maxH, opacity: 1 } : { maxHeight: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div ref={contentRef} className="max-h-72 overflow-y-auto px-4 pb-4 pt-3">
          {children}
        </div>
      </motion.div>
    </Card>
  );
};

/* ——— Kategori içi Dropdown ——— */
const CategoryDropdown: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: Exclude<PastelColor, "slate">;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon: Icon, color = "indigo", children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [maxH, setMaxH] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setMaxH(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const t = setTimeout(measure, 50);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [children, open]);

  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/60">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <span className="inline-flex items-center gap-2">
          <IconBadge color={color}>
            <Icon className="h-4 w-4" />
          </IconBadge>
          <span className={pastelText[color]}>{title}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }} className="text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={open ? { maxHeight: maxH, opacity: 1 } : { maxHeight: 0, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div ref={contentRef} className="px-3 pb-3 pt-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

/* ——— Yardımcılar ——— */
const trNat = new Intl.Collator("tr", { sensitivity: "base", numeric: true });
const sortTR = (a = "", b = "") => trNat.compare(a, b);
const normType = (v?: string | null) => String(v ?? "").trim().toLowerCase();
const TZ = "Europe/Istanbul";

/** Protokolsüz linklere otomatik https:// ekler; boş veya '-' ise null döner */
const normalizeUrl = (u?: string | null): string | null => {
  const s = String(u ?? "").trim();
  if (!s || s === "-") return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

/* ——— İstanbul TZ seri gün hesabı ——— */
const serialDayInTZ = (d: Date, tz: string): number => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return Math.floor(Date.UTC(y, m - 1, day) / 86_400_000);
};

/* ——— Sabit başlangıç: 16 Eylül 2025 (İstanbul bazlı) ——— */
const ANCHOR_SERIAL = Math.floor(Date.UTC(2025, 8, 17) / 86_400_000); // 8=Eylül

export default function Index(): React.ReactElement {
  const [slides, setSlides] = useState<SlideCategoryBlock[]>([]);
  const [categories, setCategories] = useState<TestCategoryBlock[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Günün sözü
  const [quote, setQuote] = useState<QuoteItem | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Veri çek
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoadingData(true);
      try {
        // Slayt kategorileri
        const slideCatSnap = await getDocs(collection(db, "slaytKategoriAdlari"));
        const slideCatNames = slideCatSnap.docs
          .map((d) => (d.data() as { name?: string }).name)
          .filter(Boolean) as string[];

        const fetchSlides = async (cat: string): Promise<SlideItem[]> => {
          const snap = await getDocs(query(collection(db, cat), where("grade", "==", selectedGrade)));
          return snap.docs.flatMap<SlideItem>((s) => {
            const data = s.data() as { name?: string; link?: string; type?: string };
            if (normType(data.type) !== "slayt") return [];
            return [{ name: data.name ?? "Adsız", link: data.link || undefined }];
          });
        };

        const slideListsUnsorted = await Promise.all(
          slideCatNames.map(async (cat) => ({
            category: cat,
            slides: await fetchSlides(cat),
          }))
        );

        const slideLists = slideListsUnsorted
          .map((c) => ({ ...c, slides: [...c.slides].sort((a, b) => sortTR(a.name, b.name)) }))
          .filter((c) => c.slides.length)
          .sort((a, b) => sortTR(a.category, b.category));

        setSlides(slideLists);

        // Test kategorileri
        const testCatSnap = await getDocs(collection(db, "kategoriAdlari"));
        const testCatNames = testCatSnap.docs
          .map((d) => (d.data() as { name?: string }).name)
          .filter(Boolean) as string[];

        const fetchTests = async (cat: string): Promise<TestItem[]> => {
          const snap = await getDocs(query(collection(db, cat), where("grade", "==", selectedGrade)));
          return snap.docs.flatMap<TestItem>((t) => {
            const data = t.data() as {
              name?: string;
              link?: string;
              createdAt?: { toDate?: () => Date };
              duration?: number;
              type?: string;
              testmakerLink?: string;
            };
            if (normType(data.type) !== "test") return [];
            const start = data.createdAt?.toDate?.() ?? null;
            const end = start ? new Date(start.getTime() + (data.duration ?? 0) * 60_000) : null;
            return [
              {
                name: data.name ?? "Adsız",
                link: data.link || undefined,
                closing: end,
                testmakerLink: data.testmakerLink, // ✅ taşı
              },
            ];
          });
        };

        const testListsUnsorted = await Promise.all(
          testCatNames.map(async (cat) => ({
            category: cat,
            tests: await fetchTests(cat),
          }))
        );

        const testList = testListsUnsorted
          .map((c) => ({ ...c, tests: [...c.tests].sort((a, b) => sortTR(a.name, b.name)) }))
          .filter((c) => c.tests.length)
          .sort((a, b) => sortTR(a.category, b.category));

        setCategories(testList);
      } catch (err) {
        console.error("Firestore veri çekme hatası:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    void fetchData();
  }, [selectedGrade]);

  // Günün Sözü (16 Eylül 2025 sabit başlangıç, İstanbul TZ)
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setIsLoadingQuote(true);
        setQuoteError(null);

        const url = `${import.meta.env.BASE_URL}sozler.json`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`sozler.json yüklenemedi (HTTP ${res.status})`);

        const all: QuoteItem[] = await res.json();
        if (!Array.isArray(all) || all.length === 0) {
          throw new Error("sozler.json boş veya hatalı.");
        }

        const todaySerial = serialDayInTZ(new Date(), TZ);
        const diff = Math.max(0, todaySerial - ANCHOR_SERIAL);
        const idx = diff % all.length;

        if (!aborted) setQuote(all[idx]);
      } catch (e: any) {
        if (!aborted) setQuoteError(e?.message ?? "Günün sözü yüklenirken bir hata oluştu.");
      } finally {
        if (!aborted) setIsLoadingQuote(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  /* ——— Liste bileşenleri (render’dan sonra tanımlı kalsın) ——— */
  const SlideList: React.FC<{ items?: SlideCategoryBlock[] }> = ({ items = [] }) =>
    items.length ? (
      <div className="space-y-2">
        {items.map((cat) => (
          <CategoryDropdown key={cat.category} title={cat.category} icon={BookOpen} color="indigo" defaultOpen={false}>
            <ul className="space-y-1.5 text-sm leading-6 text-slate-300">
              {cat.slides.map((s, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <IconBadge color="indigo" className="h-6 w-6">
                    <FileText className="h-3.5 w-3.5" />
                  </IconBadge>
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline decoration-indigo-700/40 underline-offset-2 hover:text-indigo-300"
                    >
                      {s.name}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    s.name
                  )}
                </li>
              ))}
            </ul>
          </CategoryDropdown>
        ))}
      </div>
    ) : (
      <p className="text-xs text-slate-400">Bu sınıf için slayt yok.</p>
    );

  const TestList: React.FC<{ items?: TestCategoryBlock[] }> = ({ items = [] }) =>
    items.length ? (
      <div className="space-y-2">
        {items.map((cat) => (
          <CategoryDropdown
            key={cat.category}
            title={cat.category}
            icon={SquareLibrary}
            color="emerald"
            defaultOpen={false}
          >
            <ul className="space-y-2 text-sm leading-6 text-slate-300">
              {cat.tests.map((t, idx) => {
                const tmUrl = normalizeUrl(t.testmakerLink);
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <IconBadge color="emerald" className="h-6 w-6">
                      <ClipboardList className="h-3.5 w-3.5" />
                    </IconBadge>
                    <div className="min-w-0">
                      {/* Üst satır: test adı */}
                      <div className="leading-6">
                        {t.link ? (
                          <a
                            href={t.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 underline decoration-emerald-700/40 underline-offset-2 hover:text-emerald-300"
                          >
                            {t.name}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          t.name
                        )}
                      </div>

                      {/* Alt satır: TestMaker linki (varsa) */}
                      {tmUrl && (
                        <div className="mt-1">
                          <a
                            href={tmUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20 transition hover:bg-emerald-500/15 hover:text-emerald-200"
                            title="TestMaker bağlantısını aç"
                          >
                            Optik Form
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CategoryDropdown>
        ))}
      </div>
    ) : (
      <p className="text-xs text-slate-400">Bu sınıf için test yok.</p>
    );

  return (
    <section className="relative min-h-screen bg-neutral-950 px-4 py-6 pb-[calc(88px+env(safe-area-inset-bottom))] text-slate-200">
      {/* —— ÜST ŞERİT: Logo solda, Günün Sözü sağda —— */}
      <div className="mx-auto mb-6 w-full max-w-6xl">
        <div className="flex flex-wrap items-start gap-3 md:gap-6">
          <img src={Logo} alt="Site Logosu" className="h-14 w-auto opacity-90 md:h-21 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-300/80">Günün Sözü</div>

            {isLoadingQuote ? (
              <div className="py-2">
                <Spinner label="Söz yükleniyor..." />
              </div>
            ) : quoteError ? (
              <p className="text-sm text-rose-300">{quoteError}</p>
            ) : quote ? (
              <div className="flex items-start gap-3">
                <span className="mt-1 h-8 w-1 rounded-full bg-indigo-400/40 md:h-10" />
                <div className="min-w-0">
                  <p className="text-[15px] leading-7 text-slate-200">
                    <span className="mr-1 text-rose-300">“</span>
                    {quote.quote}
                    <span className="ml-1 text-rose-300">”</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">— {quote.author}</p>
                  {quote.source ? (
                    <p className="text-xs text-slate-500">
                      Kaynak:{" "}
                      {/^https?:\/\//i.test(quote.source) ? (
                        <a
                          href={quote.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-rose-700/40 underline-offset-2 hover:text-rose-300"
                        >
                          {quote.source}
                        </a>
                      ) : (
                        quote.source
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Bugün için gösterilecek söz bulunamadı.</p>
            )}
          </div>
        </div>
      </div>

      {/* Masaüstünde iki sütun: Slaytlar & Testler */}
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 md:grid-cols-2">
        {/* SOL: Slaytlar */}
        <Card className="hidden md:flex md:h-[450px] flex-col p-4">
          <SectionHeader icon={Presentation} color="indigo">
            Konu Anlatım Slaytları
          </SectionHeader>
          <div className="mt-1 min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoadingData ? <Spinner label="Slaytlar yükleniyor..." /> : <SlideList items={slides} />}
          </div>
        </Card>

        {/* SAĞ: Testler */}
        <Card className="hidden md:flex md:h-[450px] flex-col p-4">
          <SectionHeader icon={Layers} color="emerald">
            Testler
          </SectionHeader>
          <div className="mt-1 min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoadingData ? <Spinner label="Testler yükleniyor..." /> : <TestList items={categories} />}
          </div>
        </Card>
      </div>

      {/* Mobil: collapsible */}
      <div className="mx-auto mt-4 w-full max-w-md space-y-3 md:hidden">
        <Collapsible title="Konu Anlatım Slaytları" icon={BookOpen} color="indigo">
          {isLoadingData ? <Spinner label="Slaytlar yükleniyor..." /> : <SlideList items={slides} />}
        </Collapsible>
        <Collapsible title="Testler" icon={SquareLibrary} color="emerald">
          {isLoadingData ? <Spinner label="Testler yükleniyor..." /> : <TestList items={categories} />}
        </Collapsible>
      </div>

      {/* Sınıf seçimi */}
      <div className="mx-auto mt-4 max-w-6xl">
        <BottomNav active={selectedGrade as 5 | 6 | 7 | 8} onSelect={setSelectedGrade as (g: 5 | 6 | 7 | 8) => void} />
      </div>
    </section>
  );
}
