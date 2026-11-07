import { useState } from "react";
import {
  FlaskConical, X, User, Building2, Car,
  ChevronUp, ChevronDown, Check, LogOut, Zap, Eye, Info,
} from "lucide-react";
import { C } from "./ds";
import { IS_CONFIGURED } from "./services/client";

// ─── Perfis de teste disponíveis ─────────────────────────────────────────────
const QUICK_LOGINS = [
  {
    type: "guest" as const,
    label: "Hóspede",
    name: "Ana Demo",
    desc: "Reservas, favoritos, táxi",
    color: "#0D9488",
  },
  {
    type: "admin" as const,
    label: "Anfitrião / Admin",
    name: "Carlos Admin",
    desc: "Painel admin, hospedagens",
    color: "#C41230",
  },
  {
    type: "driver" as const,
    label: "Motorista",
    name: "João Motorista",
    desc: "Painel, carros, corridas",
    color: "#7A5C3A",
  },
] as const;

const SIMULATED = [
  "Login / cadastro com qualquer dado",
  "Pagamento e validação de cartão",
  "Upload de imagens (preview local)",
  "Reservas e confirmações",
  "Cadastro de motorista e carro",
  "Cadastro de hotel / pousada",
  "Verificações de documentos",
  "Avaliações de motoristas e hóspedes",
];

type QuickLoginType = "guest" | "admin" | "driver";

type Props = {
  isPrototypeMode: boolean;
  onTogglePrototype: () => void;
  user: any;
  isAdmin: boolean;
  isDriver: boolean;
  onQuickLogin: (type: QuickLoginType) => void;
  onLogout: () => void;
  navigate: (p: string) => void;
};

export function PrototypeModeWidget({
  isPrototypeMode, onTogglePrototype,
  user, isAdmin, isDriver,
  onQuickLogin, onLogout, navigate,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showSimulated, setShowSimulated] = useState(false);

  const userRole = isAdmin ? "Anfitrião / Admin" : isDriver ? "Motorista" : "Hóspede";

  // Cores dependem do modo atual
  const panelBg    = isPrototypeMode ? "#16100A" : "white";
  const panelBdr   = isPrototypeMode ? "#F5C518" : C.border;
  const headColor  = isPrototypeMode ? "#F5C518" : C.textDark;
  const bodyColor  = isPrototypeMode ? "rgba(255,255,255,0.88)" : C.textDark;
  const mutedColor = isPrototypeMode ? "rgba(255,255,255,0.45)" : C.textLight;
  const divColor   = isPrototypeMode ? "rgba(255,255,255,0.08)" : C.border;

  const realModeLabel = IS_CONFIGURED
    ? "Supabase real conectado"
    : "Supabase não configurado (usando mock)";

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 select-none">

      {/* ── Painel expandido ──────────────────────────────────────────────── */}
      {expanded && (
        <div
          className="rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            backgroundColor: panelBg,
            borderColor: panelBdr,
            width: 284,
            boxShadow: isPrototypeMode
              ? "0 8px 32px rgba(245,197,24,0.25)"
              : "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {/* Cabeçalho */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${divColor}` }}
          >
            <div className="flex items-center gap-2">
              <FlaskConical size={15} style={{ color: isPrototypeMode ? "#F5C518" : C.textLight }} />
              <span className="text-sm" style={{ fontWeight: 700, color: headColor }}>
                Modo Protótipo
              </span>
              {isPrototypeMode && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] tracking-wide"
                  style={{ backgroundColor: "#F5C518", color: "#1A0E00", fontWeight: 800 }}
                >
                  ATIVO
                </span>
              )}
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: mutedColor }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* Toggle de ativação */}
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                backgroundColor: isPrototypeMode ? "rgba(245,197,24,0.08)" : C.bg,
                border: `1px solid ${isPrototypeMode ? "#F5C51888" : C.border}`,
              }}
            >
              <div>
                <p className="text-xs" style={{ fontWeight: 700, color: isPrototypeMode ? "#F5C518" : C.textDark }}>
                  {isPrototypeMode ? "🧪 Simulando operações" : "⚙️ Modo funcional"}
                </p>
                <p style={{ fontSize: 10, color: mutedColor, marginTop: 1 }}>
                  {isPrototypeMode ? "Nenhum dado é salvo" : realModeLabel}
                </p>
              </div>
              {/* Toggle switch com animação correta */}
              <button
                onClick={onTogglePrototype}
                className="relative shrink-0 rounded-full transition-colors duration-200"
                style={{
                  width: 44,
                  height: 24,
                  backgroundColor: isPrototypeMode ? "#F5C518" : C.border,
                }}
                title={isPrototypeMode ? "Desativar modo protótipo" : "Ativar modo protótipo"}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{
                    left: 2,
                    transform: isPrototypeMode ? "translateX(20px)" : "translateX(0px)",
                  }}
                />
              </button>
            </div>

            {/* Conteúdo exclusivo do modo protótipo */}
            {isPrototypeMode && (
              <>
                {/* Login rápido */}
                <div>
                  <p
                    className="flex items-center gap-1 text-[11px] mb-2 uppercase tracking-wide"
                    style={{ fontWeight: 700, color: mutedColor }}
                  >
                    <Zap size={10} />
                    Login rápido
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_LOGINS.map(({ type, label, name, desc, color }) => (
                      <button
                        key={type}
                        onClick={() => { onQuickLogin(type); setExpanded(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-80 active:scale-95"
                        style={{
                          backgroundColor: `${color}18`,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        {/* Avatar inicial */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs"
                          style={{ backgroundColor: `${color}30`, color, fontWeight: 800 }}
                        >
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate" style={{ fontWeight: 700, color: bodyColor }}>
                            {name}
                          </p>
                          <p style={{ fontSize: 10, color: mutedColor }}>{label} · {desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Separador */}
                <div style={{ height: 1, backgroundColor: divColor }} />

                {/* Usuário atual */}
                {user ? (
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${divColor}` }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0"
                        style={{ backgroundColor: C.primary, color: "white", fontWeight: 800 }}
                      >
                        {user.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate" style={{ fontWeight: 700, color: bodyColor }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: 10, color: mutedColor }}>{userRole}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => { navigate("profile"); setExpanded(false); }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: mutedColor }}
                        title="Ver perfil"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => { onLogout(); setExpanded(false); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                        style={{ color: "rgba(255,110,110,0.85)" }}
                        title="Sair"
                      >
                        <LogOut size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 11, color: mutedColor, textAlign: "center" }}>
                    Use um login rápido acima para começar a testar.
                  </p>
                )}

                {/* Separador */}
                <div style={{ height: 1, backgroundColor: divColor }} />

                {/* O que está simulado */}
                <div>
                  <button
                    onClick={() => setShowSimulated(!showSimulated)}
                    className="flex items-center gap-1.5 text-[11px] w-full hover:opacity-80 transition-opacity"
                    style={{ color: mutedColor, fontWeight: 600 }}
                  >
                    <Info size={11} />
                    <span className="flex-1 text-left">O que está sendo simulado</span>
                    {showSimulated ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  {showSimulated && (
                    <div className="mt-2 space-y-1.5 pl-0.5">
                      {SIMULATED.map((s) => (
                        <div key={s} className="flex items-start gap-1.5">
                          <Check size={9} style={{ color: "#F5C518", marginTop: 3, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: mutedColor }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Modo real — aviso */}
            {!isPrototypeMode && (
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              >
                <p style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>
                  {IS_CONFIGURED
                    ? "⚠️ As ações serão salvas no Supabase. Ative o modo protótipo para testar sem risco."
                    : "ℹ️ Supabase não configurado. Os dados já usam mock, mas as simulações de login rápido estão disponíveis somente no modo protótipo."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Botão flutuante ───────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-2xl transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: isPrototypeMode ? "#F5C518" : "white",
          color: isPrototypeMode ? "#1A0E00" : C.textMid,
          border: `2px solid ${isPrototypeMode ? "#F5C518" : C.border}`,
          fontWeight: 700,
          fontSize: 12,
          padding: "7px 14px",
          boxShadow: isPrototypeMode
            ? "0 4px 20px rgba(245,197,24,0.45)"
            : "0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        <FlaskConical size={14} />
        {isPrototypeMode ? "🧪 Protótipo" : "Protótipo"}
        {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>
    </div>
  );
}
