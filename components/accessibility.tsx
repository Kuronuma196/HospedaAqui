import { useState, useEffect, useRef, useCallback } from "react";
import { X, Volume2, VolumeX, ZoomIn, ZoomOut, Minus, Plus, ChevronUp } from "lucide-react";
import iconeA from "../ìconeA.png";

// ─── Accessibility Widget (gov.br style) ─────────────────────────────────────
// Canto inferior direito, verde claro, expande como no gov.br
// Funcionalidades: Libras (VLibras), Leitura em voz, tamanho da fonte

export function AccessibilityWidget() {
  const [expanded, setExpanded] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);
  const [librasOpen, setLibrasOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis;
    }
    return () => {
      synth.current?.cancel();
    };
  }, []);

  // Apply font size globally
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [fontSize]);

  // Apply high contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
  }, [highContrast]);

  const handleTTS = useCallback(() => {
    if (!synth.current) return;
    if (ttsActive) {
      synth.current.cancel();
      setTtsActive(false);
    } else {
      // Get readable text from page
      const main = document.querySelector("main") || document.body;
      const text = (main.innerText || main.textContent || "").substring(0, 4000);
      if (!text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.85;
      utterance.pitch = 1;
      // Try to find a PT-BR voice
      const voices = synth.current.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith("pt"));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => setTtsActive(false);
      utterance.onerror = () => setTtsActive(false);
      synth.current.cancel();
      synth.current.speak(utterance);
      setTtsActive(true);
    }
  }, [ttsActive]);

  const changeFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(80, Math.min(150, prev + delta)));
  };

  const resetFontSize = () => setFontSize(100);

  // Colors
  const GREEN = "#1B7A45";
  const GREEN_LIGHT = "#2DA05A";
  const GREEN_BG = "#E8F5EE";
  const WHITE = "#FFFFFF";

  const btnStyle = (active = false): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: active ? `2px solid ${WHITE}` : "2px solid rgba(255,255,255,0.25)",
    backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
    color: WHITE,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    marginBottom: 8,
  });

  return (
    <>
      {/* Libras Panel */}
      {librasOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 300,
            height: 380,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            zIndex: 9998,
            backgroundColor: GREEN,
            border: `3px solid ${WHITE}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", backgroundColor: "#155F35",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤟</span>
              <div>
                <p style={{ color: WHITE, fontWeight: 700, fontSize: 14, margin: 0 }}>VLibras</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>Tradução em LIBRAS</p>
              </div>
            </div>
            <button
              onClick={() => setLibrasOpen(false)}
              style={{ background: "none", border: "none", color: WHITE, cursor: "pointer", padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 16 }}>
            {/* Animated sign language avatar placeholder */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              <span style={{ fontSize: 60 }}>🤟</span>
              {/* Pulse ring */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.4)",
                animation: "pulse 2s infinite",
              }} />
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ color: WHITE, fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>
                Interpretação em LIBRAS
              </p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                Tradução automática do conteúdo<br />da página para LIBRAS
              </p>
            </div>

            <a
              href="https://vlibras.gov.br/app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                backgroundColor: WHITE,
                color: GREEN,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              🌐 Abrir VLibras completo
            </a>
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 16px", backgroundColor: "rgba(0,0,0,0.15)", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: 0 }}>
              Powered by VLibras · Governo Federal
            </p>
          </div>
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 240,
            borderRadius: 18,
            backgroundColor: GREEN,
            boxShadow: "0 12px 40px rgba(27,122,69,0.35)",
            zIndex: 9999,
            border: `2px solid rgba(255,255,255,0.25)`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}>
            <span style={{ color: WHITE, fontWeight: 800, fontSize: 14, letterSpacing: 0.3 }}>
              ♿ Acessibilidade
            </span>
            <button
              onClick={() => setExpanded(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 2 }}
              title="Fechar"
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ padding: "12px 14px 14px" }}>

            {/* Libras */}
            <button
              onClick={() => setLibrasOpen(!librasOpen)}
              style={btnStyle(librasOpen)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = librasOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"; }}
            >
              <span style={{ fontSize: 18 }}>🤟</span>
              <span>Libras</span>
              {librasOpen && <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.8 }}>Ativo ✓</span>}
            </button>

            {/* Leitura em voz */}
            <button
              onClick={handleTTS}
              style={btnStyle(ttsActive)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ttsActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"; }}
            >
              {ttsActive ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{ttsActive ? "Parar leitura" : "Leitura em voz"}</span>
              {ttsActive && (
                <span style={{
                  marginLeft: "auto", width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: "#F5C518", flexShrink: 0,
                  animation: "pulse 1s infinite",
                }} />
              )}
            </button>

            {/* Font size */}
            <div style={{
              borderRadius: 10,
              border: "2px solid rgba(255,255,255,0.25)",
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "10px 12px",
              marginBottom: 8,
            }}>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, margin: "0 0 8px" }}>
                Tamanho do texto
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => changeFontSize(-10)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.15)", color: WHITE, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={resetFontSize}
                  style={{
                    flex: 1, height: 32, borderRadius: 8, border: "none",
                    backgroundColor: "rgba(255,255,255,0.15)", color: WHITE,
                    cursor: "pointer", fontWeight: 700, fontSize: 12,
                  }}
                  title="Resetar tamanho"
                >
                  {fontSize}%
                </button>
                <button
                  onClick={() => changeFontSize(10)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.15)", color: WHITE, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* High contrast */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              style={btnStyle(highContrast)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = highContrast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"; }}
            >
              <span style={{ fontSize: 16 }}>◑</span>
              <span>Alto contraste</span>
              {highContrast && <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.8 }}>Ativo ✓</span>}
            </button>

            {/* gov.br credit */}
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textAlign: "center", marginTop: 4 }}>
              Acessibilidade Digital · HospedAqui
            </p>
          </div>
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        title="Acessibilidade"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 54,
          height: 54,
          borderRadius: "50%",
          backgroundColor: GREEN_LIGHT,
          color: WHITE,
          border: `3px solid ${WHITE}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(27,122,69,0.45)",
          zIndex: 9999,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          fontSize: 22,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(27,122,69,0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(27,122,69,0.45)";
        }}
      >
        {expanded ? <ChevronUp size={22} /> : (
          <img
            src={iconeA}
            alt="Acessibilidade"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
        )}
      </button>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}