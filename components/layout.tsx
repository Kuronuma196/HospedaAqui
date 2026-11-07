import { useState } from "react";
import { Menu, X, User, Heart, Calendar, Search, ChevronDown, Bell, LogOut, Settings, Sun, Moon, Building2, Car } from "lucide-react";
import { C, Logo, Btn, useTheme } from "./ds";

type NavProps = {
  navigate: (p: string, params?: any) => void;
  user: any;
  onLogout: () => void;
  isAdmin?: boolean;
  adminMode?: boolean;
  onToggleAdminMode?: () => void;
  isDriver?: boolean;
};

export function Header({ navigate, user, onLogout, isAdmin, adminMode, onToggleAdminMode, isDriver }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  const navItems: { label: string; page: string; params?: any }[] = [
    { label: "Hospedagens", page: "search" },
    { label: "Táxi", page: "taxi" },
    { label: "Voos + Hotel", page: "packages" },
    { label: "Minhas Reservas", page: "reservations" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: C.header }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div onClick={() => navigate("home")} className="cursor-pointer">
            <Logo size="md" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.page, item.params)}
                className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-white/15"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate("reservations")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm hover:bg-white/15 transition-colors"
                  style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}
                >
                  <Calendar size={16} />
                  <span className="hidden md:inline">Reservas</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/15 transition-colors"
                    style={{ color: "white" }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: C.coral, fontWeight: 700 }}>
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm hidden md:inline" style={{ fontWeight: 600 }}>{user.name.split(" ")[0]}</span>
                    <ChevronDown size={14} />
                  </button>
                  {profileOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 rounded-2xl shadow-xl overflow-hidden w-52"
                      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
                    >
                      <div className="p-4 border-b" style={{ borderColor: C.border }}>
                        <div className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{user.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: C.textLight }}>{user.email}</div>
                      </div>
                      {[
                        { icon: <User size={15} />, label: "Meu Perfil", page: "profile" },
                        { icon: <Calendar size={15} />, label: "Minhas Reservas", page: "reservations" },
                        { icon: <Heart size={15} />, label: "Favoritos", page: "profile" },
                        { icon: <Settings size={15} />, label: "Preferências", page: "profile" },
                        ...(isDriver ? [{ icon: <Car size={15} />, label: "Painel Motorista", page: "driver" }] : []),
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left"
                          style={{ color: C.textMid }}
                          onClick={() => { navigate(item.page); setProfileOpen(false); }}
                        >
                          <span style={{ color: C.primary }}>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                      <div className="border-t" style={{ borderColor: C.border }}>
                        <button
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-red-50 transition-colors text-left"
                          style={{ color: C.error }}
                          onClick={() => { onLogout(); setProfileOpen(false); }}
                        >
                          <LogOut size={15} />
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigate("login")}
                  className="px-4 py-2 rounded-xl text-sm border border-white/40 hover:border-white hover:bg-white/10 transition-colors"
                  style={{ color: "white", fontWeight: 600 }}
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate("register")}
                  className="px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: C.coral, color: "white", fontWeight: 700 }}
                >
                  Cadastrar
                </button>
              </div>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-white/15 transition-colors"
              style={{ color: "white" }}
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Admin mode toggle — só aparece para admin */}
            {isAdmin && user && (
              <button
                onClick={onToggleAdminMode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all hover:opacity-90"
                title={adminMode ? "Desativar modo admin" : "Ativar modo admin"}
                style={{
                  backgroundColor: adminMode ? "#F5C518" : "rgba(255,255,255,0.18)",
                  color: adminMode ? "#1A0E00" : "white",
                  border: adminMode ? "none" : "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <Building2 size={15} />
                <span className="text-xs hidden sm:inline" style={{ fontWeight: 700 }}>
                  {adminMode ? "Admin ✓" : "Admin"}
                </span>
              </button>
            )}

            {/* Driver button */}
            {isDriver && user && (
              <button
                onClick={() => navigate("driver")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <Car size={15} />
                <span className="text-xs hidden sm:inline" style={{ fontWeight: 700 }}>Motorista</span>
              </button>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/15"
              style={{ color: "white" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/20 pt-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { navigate(item.page, item.params); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-white/15 transition-colors"
                style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2 border-t border-white/20 mt-2">
              {user ? (
                <>
                  <button onClick={() => { navigate("profile"); setMobileOpen(false); }} className="flex-1 text-sm py-2 rounded-xl border border-white/40 hover:bg-white/10 transition-colors" style={{ color: "white", fontWeight: 600 }}>
                    Perfil
                  </button>
                  <button onClick={() => { onLogout(); setMobileOpen(false); }} className="flex-1 text-sm py-2 rounded-xl bg-white/20 hover:bg-white/30" style={{ color: "white", fontWeight: 600 }}>
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate("login"); setMobileOpen(false); }} className="flex-1 text-sm py-2 rounded-xl border border-white/40 hover:bg-white/10" style={{ color: "white", fontWeight: 600 }}>
                    Entrar
                  </button>
                  <button onClick={() => { navigate("register"); setMobileOpen(false); }} className="flex-1 text-sm py-2 rounded-xl hover:opacity-90" style={{ backgroundColor: C.coral, color: "white", fontWeight: 700 }}>
                    Cadastrar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer({ navigate }: { navigate: (p: string) => void }) {
  const cols = [
    { title: "HospedAqui", links: ["Sobre nós", "Trabalhe conosco", "Blog de viagens", "Sala de imprensa", "Sustentabilidade"] },
    { title: "Suporte", links: ["Central de ajuda", "Fale conosco", "Acessibilidade", "Relatar problema", "Política de privacidade"] },
    { title: "Para parceiros", links: ["Cadastre sua propriedade", "Portal do parceiro", "Soluções corporativas", "Programa de afiliados"] },
    { title: "Termos", links: ["Termos de uso", "Política de privacidade", "Cookies", "Avisos legais", "LGPD"] },
  ];
  return (
    <footer style={{ backgroundColor: "#0A1E35" }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "#7A9BB5" }}>
              Conectando viajantes às melhores acomodações do Brasil e do mundo.
            </p>
            <div className="flex gap-2 mt-4">
              {["F", "ig", "in", "X"].map((s) => (
                <button key={s} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs transition-colors flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {cols.slice(1).map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm mb-3" style={{ fontWeight: 700 }}>{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button className="text-sm hover:text-white transition-colors text-left" style={{ color: "#7A9BB5" }}>{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#4A6880" }}>© 2026 HospedAqui · CNPJ 00.000.000/0001-00 · Dados fictícios para fins de demonstração</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#4A6880" }}>
            <span>Português (BR)</span>
            <span>R$ BRL</span>
            <div className="flex gap-2">
              {["Visa", "Mastercard", "Pix", "Boleto"].map((p) => (
                <span key={p} className="px-2 py-0.5 rounded border border-white/10 text-white/40">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
