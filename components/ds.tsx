import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import { X, AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";
import HospedaLogo from "../Hospeda.png";

// ─── Design Tokens (CSS custom properties — respondem ao tema) ───────────────
export const C = {
  primary:      "var(--c-primary)",
  primaryDark:  "var(--c-primaryDark)",
  primaryLight: "var(--c-primaryLight)",
  primaryMid:   "var(--c-primaryMid)",
  teal:         "var(--c-teal)",
  tealLight:    "var(--c-tealLight)",
  coral:        "var(--c-coral)",
  coralLight:   "var(--c-coralLight)",
  bg:           "var(--c-bg)",
  card:         "var(--c-card)",
  border:       "var(--c-border)",
  borderDark:   "var(--c-borderDark)",
  textDark:     "var(--c-textDark)",
  textMid:      "var(--c-textMid)",
  textLight:    "var(--c-textLight)",
  success:      "var(--c-success)",
  successLight: "var(--c-successLight)",
  warning:      "var(--c-warning)",
  warningLight: "var(--c-warningLight)",
  error:        "var(--c-error)",
  errorLight:   "var(--c-errorLight)",
  star:         "var(--c-star)",
  yellow:       "var(--c-yellow)",
  starEmpty:    "var(--c-starEmpty)",
  grayBg:       "var(--c-grayBg)",
  header:       "var(--c-header)",
};

// ─── Theme Context ────────────────────────────────────────────────────────────
type ThemeCtx = { isDark: boolean; toggle: () => void };
const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function GlobalStyles() {
  return (
    <style>{`
      :root {
        --c-primary:      #C41230;
        --c-primaryDark:  #8B0D22;
        --c-primaryLight: #FDE8EB;
        --c-primaryMid:   #D41F3F;
        --c-teal:         #7A5C3A;
        --c-tealLight:    #F5ECD8;
        --c-coral:        #F5C518;
        --c-coralLight:   #FDF5D0;
        --c-bg:           #F2EAD8;
        --c-card:         #FFFFFF;
        --c-border:       #E5D8C0;
        --c-borderDark:   #C9B99A;
        --c-textDark:     #1A0E05;
        --c-textMid:      #6B5240;
        --c-textLight:    #A8927A;
        --c-success:      #1A9C5B;
        --c-successLight: #E6F7EF;
        --c-warning:      #D97706;
        --c-warningLight: #FEF3CD;
        --c-error:        #D63B30;
        --c-errorLight:   #FDE8E7;
        --c-star:         #F5C518;
        --c-yellow:       #F5C518;
        --c-starEmpty:    #D1D9E6;
        --c-grayBg:       #F1F5F9;
        /* Header vermelho claro no modo claro */
        --c-header:       #F03050;
      }
      /* ── Modo Escuro: preto azulado + vermelho mais vivo ── */
      [data-theme="dark"] {
        --c-primary:      #F03050;
        --c-primaryDark:  #C41230;
        --c-primaryMid:   #F84060;
        --c-primaryLight: #1E0510;
        --c-teal:         #C89155;
        --c-tealLight:    #1A1208;
        --c-coralLight:   #252008;
        /* Fundo preto azulado */
        --c-bg:           #0D1117;
        --c-card:         #161B22;
        --c-border:       #21262D;
        --c-borderDark:   #30363D;
        /* Texto com tom frio */
        --c-textDark:     #E6EDF3;
        --c-textMid:      #8B949E;
        --c-textLight:    #6E7681;
        /* Badges de status */
        --c-successLight: #091D14;
        --c-warningLight: #1C1500;
        --c-errorLight:   #1A0508;
        /* Misc */
        --c-starEmpty:    #373E47;
        --c-grayBg:       #1C2128;
        /* Header vermelho escuro no dark mode */
        --c-header:       #C41230;
      }
      /* Tailwind hover — overrides no dark */
      [data-theme="dark"] .hover\\:bg-gray-50:hover  { background-color: var(--c-border) !important; }
      [data-theme="dark"] .hover\\:bg-gray-100:hover { background-color: var(--c-border) !important; }
      [data-theme="dark"] .hover\\:bg-red-50:hover   { background-color: var(--c-errorLight) !important; }
      /* Tailwind static classes — dark mode overrides */
      [data-theme="dark"] .bg-white  { background-color: var(--c-card) !important; }
      [data-theme="dark"] .bg-gray-50 { background-color: var(--c-grayBg) !important; }
      [data-theme="dark"] .bg-gray-100 { background-color: var(--c-border) !important; }
      [data-theme="dark"] .bg-gray-200 { background-color: var(--c-borderDark) !important; }
      [data-theme="dark"] .border-gray-200 { border-color: var(--c-border) !important; }
      [data-theme="dark"] .text-gray-900 { color: var(--c-textDark) !important; }
      [data-theme="dark"] .text-gray-800 { color: var(--c-textDark) !important; }
      [data-theme="dark"] .text-gray-700 { color: var(--c-textMid) !important; }
      [data-theme="dark"] .text-gray-600 { color: var(--c-textMid) !important; }
      [data-theme="dark"] .text-gray-500 { color: var(--c-textLight) !important; }
      /* Inputs nativos */
      [data-theme="dark"] input,
      [data-theme="dark"] select,
      [data-theme="dark"] textarea { color-scheme: dark; }
      [data-theme="dark"] input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
      [data-theme="dark"] select,
      [data-theme="dark"] textarea {
        background-color: var(--c-card);
        color: var(--c-textDark);
      }
      [data-theme="dark"] select option { background-color: var(--c-card); color: var(--c-textDark); }
    `}</style>
  );
}

export function ThemeProvider({ children }: { children: any }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("hospedaqui-theme") === "dark";
      // aplica imediatamente para evitar flash
      document.documentElement.setAttribute("data-theme", saved ? "dark" : "light");
      return saved;
    } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem("hospedaqui-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <GlobalStyles />
      {children}
    </ThemeContext.Provider>
  );
}

// ─── ImageWithFallback ───────────────────────────────────────────────────────
export function ImageWithFallback({ src, alt, className, style, ...rest }: any) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      style={{ ...style, backgroundColor: "var(--c-grayBg)" }}
    >
      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==" alt="" />
    </div>
  );
  return <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} {...rest} />;
}

// ─── Logo ────────────────────────────────────────────────────────────────────
export function Logo({ size = "md", dark = false }: { size?: "sm"|"md"|"lg"; dark?: boolean }) {
  const sizes = { sm: { text: 17, iconH: 28 }, md: { text: 21, iconH: 36 }, lg: { text: 26, iconH: 44 } };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2 select-none cursor-pointer">
      <img
        src={HospedaLogo}
        alt="HospedAqui"
        style={{ height: s.iconH, width: "auto", flexShrink: 0, objectFit: "contain" }}
      />
      <span style={{ fontSize: s.text, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>
        <span style={{ color: "#FFFFFF" }}>Hosped</span>
        <span style={{ color: "#F5C518" }}>Aqui</span>
      </span>
    </div>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
type BtnVariant = "primary"|"secondary"|"ghost"|"outline"|"danger"|"teal"|"coral";
type BtnSize = "sm"|"md"|"lg";

export function Btn({
  children, variant = "primary", size = "md", fullWidth = false,
  disabled = false, loading = false, icon, onClick, type = "button", className = "",
}: {
  children?: ReactNode; variant?: BtnVariant; size?: BtnSize; fullWidth?: boolean;
  disabled?: boolean; loading?: boolean; icon?: ReactNode; onClick?: () => void;
  type?: "button"|"submit"; className?: string;
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 select-none cursor-pointer";
  const sizeStyles = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const variantStyles: Record<BtnVariant, string> = {
    primary: `text-white hover:opacity-90 active:scale-95`,
    secondary: `bg-[${C.primaryLight}] text-[${C.primary}] hover:bg-blue-100`,
    ghost: `bg-transparent text-[${C.textMid}] hover:bg-[${C.bg}]`,
    outline: `bg-transparent border text-[${C.primary}] hover:bg-[${C.primaryLight}]`,
    danger: `bg-[${C.error}] text-white hover:opacity-90`,
    teal: `text-white hover:opacity-90`,
    coral: `text-white hover:opacity-90`,
  };
  const bgMap: Record<BtnVariant, string> = {
    primary: C.primary, secondary: C.primaryLight, ghost: "transparent",
    outline: "transparent", danger: C.error, teal: C.teal, coral: C.coral,
  };
  const borderMap: Record<BtnVariant, string> = {
    primary: "none", secondary: "none", ghost: "none",
    outline: `1px solid ${C.primary}`, danger: "none", teal: "none", coral: "none",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{
        backgroundColor: bgMap[variant],
        border: borderMap[variant],
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({
  label, placeholder, value, onChange, type = "text", error, hint, icon,
  required = false, disabled = false, className = "",
}: {
  label?: string; placeholder?: string; value?: string; onChange?: (v: string) => void;
  type?: string; error?: string; hint?: string; icon?: ReactNode;
  required?: boolean; disabled?: boolean; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>
          {label}{required && <span style={{ color: C.coral }}> *</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textLight }}>{icon}</div>}
        <input
          type={type} placeholder={placeholder} value={value} disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full rounded-xl text-sm outline-none transition-colors`}
          style={{
            padding: icon ? "10px 12px 10px 38px" : "10px 12px",
            border: `1.5px solid ${error ? C.error : C.border}`,
            backgroundColor: disabled ? C.bg : C.card,
            color: C.textDark,
            fontWeight: 400,
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? C.error : C.primary; }}
          onBlur={(e) => { e.target.style.borderColor = error ? C.error : C.border; }}
        />
      </div>
      {error && <p className="text-xs flex items-center gap-1" style={{ color: C.error }}><AlertCircle size={12} />{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: C.textLight }}>{hint}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }: {
  label?: string; value?: string; onChange?: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>{label}{required && <span style={{ color: C.coral }}> *</span>}</label>}
      <select
        value={value} onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl text-sm outline-none"
        style={{ padding: "10px 12px", border: `1.5px solid ${C.border}`, backgroundColor: C.card, color: C.textDark, fontWeight: 400 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Badge / Tag ─────────────────────────────────────────────────────────────
type BadgeColor = "blue"|"teal"|"coral"|"green"|"yellow"|"red"|"gray";
const badgeColors: Record<BadgeColor, { bg: string; text: string }> = {
  blue: { bg: C.primaryLight, text: C.primary },
  teal: { bg: C.tealLight, text: C.teal },
  coral: { bg: C.coralLight, text: C.coral },
  green: { bg: C.successLight, text: C.success },
  yellow: { bg: C.warningLight, text: C.warning },
  red: { bg: C.errorLight, text: C.error },
  gray: { bg: C.grayBg, text: C.textMid },
};
export function Badge({ children, color = "blue", size = "sm" }: { children: ReactNode; color?: BadgeColor; size?: "sm"|"md" }) {
  const { bg, text } = badgeColors[color];
  return (
    <span className="inline-flex items-center rounded-full" style={{ backgroundColor: bg, color: text, fontSize: size === "sm" ? 11 : 13, fontWeight: 600, padding: size === "sm" ? "2px 8px" : "4px 10px" }}>
      {children}
    </span>
  );
}

// ─── Score Badge ─────────────────────────────────────────────────────────────
export function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="px-2.5 py-1.5 rounded-xl rounded-tr-none" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700, fontSize: 14 }}>
        {score.toFixed(1)}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: C.textDark }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
export function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i < n ? C.star : C.starEmpty}>
          <path d="M6 1l1.5 3 3.3.4-2.4 2.3.6 3.3L6 8.5l-3 1.5.6-3.3L1.2 4.4l3.3-.4z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", onClick, hover = false, padding = true }: {
  children: ReactNode; className?: string; onClick?: () => void; hover?: boolean; padding?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${padding ? "p-5" : ""} ${hover ? "hover:shadow-lg cursor-pointer transition-shadow" : ""} ${className}`}
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {children}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: "sm"|"md"|"lg"|"xl";
}) {
  if (!open) return null;
  const widths = { sm: 400, md: 560, lg: 720, xl: 900 };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="relative rounded-2xl w-full overflow-auto max-h-[90vh]"
        style={{ backgroundColor: C.card, maxWidth: widths[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: C.border }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast / Alert ───────────────────────────────────────────────────────────
export function Alert({ type = "info", children, className = "" }: { type?: "info"|"success"|"warning"|"error"; children: ReactNode; className?: string }) {
  const styles = {
    info: { bg: C.primaryLight, text: C.primary, icon: <Info size={15} /> },
    success: { bg: C.successLight, text: C.success, icon: <CheckCircle size={15} /> },
    warning: { bg: C.warningLight, text: C.warning, icon: <AlertCircle size={15} /> },
    error: { bg: C.errorLight, text: C.error, icon: <AlertCircle size={15} /> },
  };
  const s = styles[type];
  return (
    <div className={`flex items-start gap-2 rounded-xl p-3 ${className}`} style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="shrink-0 mt-0.5">{s.icon}</span>
      <span className="text-sm" style={{ fontWeight: 500 }}>{children}</span>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" style={{ color: C.primary }} />;
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
      {label && <span className="text-xs" style={{ color: C.textLight, fontWeight: 500 }}>{label}</span>}
      <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
    </div>
  );
}

// ─── Progress Steps ──────────────────────────────────────────────────────────
export function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all"
              style={{
                backgroundColor: i < current ? C.teal : i === current ? C.primary : C.border,
                color: i <= current ? "white" : C.textLight,
                fontWeight: 700,
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className="text-[10px] text-center whitespace-nowrap hidden sm:block" style={{ color: i === current ? C.primary : C.textLight, fontWeight: i === current ? 600 : 400 }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 mb-4" style={{ backgroundColor: i < current ? C.teal : C.border }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<string, { label: string; color: BadgeColor; desc: string }> = {
  pending_payment: { label: "A pagar", color: "yellow", desc: "Aguardando pagamento" },
  awaiting_confirmation: { label: "Aguardando confirmação", color: "blue", desc: "Solicitação registrada" },
  confirmed: { label: "Confirmada", color: "green", desc: "Reserva confirmada" },
  cancelled: { label: "Cancelada", color: "red", desc: "Reserva cancelada" },
  completed: { label: "Concluída", color: "gray", desc: "Hospedagem finalizada" },
};

// ─── Section Title ─────────────────────────────────────────────────────────────
export function SectionTitle({ title, subtitle, action, onAction }: {
  title: string; subtitle?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 style={{ fontWeight: 800, fontSize: "clamp(1.1rem,2.5vw,1.5rem)", color: C.textDark }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: C.textMid }}>{subtitle}</p>}
      </div>
      {action && <button onClick={onAction} className="text-sm hover:underline" style={{ color: C.primary, fontWeight: 600 }}>{action} →</button>}
    </div>
  );
}

// ─── Amenity Icon + Label ─────────────────────────────────────────────────────
export function AmenityChip({ label, available = true }: { label: string; available?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: available ? C.textMid : C.textLight, textDecoration: available ? "none" : "line-through" }}>
      <span style={{ color: available ? C.teal : C.textLight }}>✓</span>
      {label}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: C.border }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="px-4 py-2.5 text-sm whitespace-nowrap transition-colors relative"
          style={{
            fontWeight: active === t.id ? 700 : 500,
            color: active === t.id ? C.primary : C.textMid,
            borderBottom: active === t.id ? `2px solid ${C.primary}` : "2px solid transparent",
          }}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: active === t.id ? C.primaryLight : C.bg, color: active === t.id ? C.primary : C.textLight, fontWeight: 600 }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}