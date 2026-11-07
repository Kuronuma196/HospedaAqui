import { useState } from "react";
import { Search, MapPin, Calendar, Users, ChevronDown, Star, Heart, Shield, Tag, Award, Headphones, ArrowRight, Car, Building2, CheckCircle2 } from "lucide-react";
import { C, ImageWithFallback, Stars, ScoreBadge, Card, SectionTitle, Badge } from "./ds";
import { PROPERTIES, DESTINATIONS, IMGS } from "./data";
import { AdminSetupBanner } from "./admin";

// Imagens dos cards de parceiro
const IMG_DRIVER = "https://images.unsplash.com/photo-1629935252276-2e9267f778a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";
const IMG_HOST   = "https://images.unsplash.com/photo-1666813721996-42956e40788e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";

type Props = {
  navigate: (p: string, params?: any) => void;
  user: any;
  favorites: string[];
  onToggleFav: (id: string) => void;
  isAdmin?: boolean;
  adminMode?: boolean;
  isDriver?: boolean;
  onOpenAdminSetup?: () => void;
};

export function HomePage({ navigate, user, favorites, onToggleFav, isAdmin, adminMode, isDriver, onOpenAdminSetup }: Props) {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2 adultos");
  const [activeType, setActiveType] = useState("todos");

  const propTypes = ["todos","Hotel","Pousada","Chalé","Resort","Flat","Hostel"];

  const handleSearch = () => navigate("search", { destination, checkIn, checkOut, guests });

  // ── Lógica dos botões de parceiro ──────────────────────────────────────────
  const handleDriverCTA = () => {
    if (!user) { navigate("register"); return; }
    // Motorista já cadastrado → painel direto
    // Admin fora do modo admin OU usuário comum → página de motorista (cadastro/painel)
    navigate("driver");
  };

  const handleHostCTA = () => {
    if (!user) { navigate("register"); return; }
    if (isAdmin) { navigate("admin"); return; }
    // Usuário comum → abre o setup de anfitrião
    onOpenAdminSetup?.();
  };

  // Rótulo dinâmico do botão
  const driverBtnLabel = isDriver
    ? "Acessar meu painel"
    : user
    ? "Quero ser motorista"
    : "Cadastrar e ser motorista";

  const hostBtnLabel = isAdmin
    ? "Acessar painel admin"
    : user
    ? "Quero ser anfitrião"
    : "Cadastrar e ser anfitrião";

  return (
    <div style={{ backgroundColor: C.bg, fontFamily: "Inter, Segoe UI, sans-serif" }}>
      {/* ── HERO ── */}
      <section className="relative" style={{ minHeight: 500 }}>
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback src={IMGS.beachResort} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${C.primaryDark}DD 0%, ${C.primary}99 60%, rgba(12,139,122,0.7) 100%)` }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <div className="text-center mb-8">
            <Badge color="coral" size="md">🌍 Mais de 2,8 milhões de opções no Brasil e no mundo</Badge>
            <h1 className="text-white mt-4 mb-3" style={{ fontWeight: 900, fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 1.15 }}>
              Onde a sua próxima<br />aventura começa
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(0.9rem,2vw,1.05rem)" }}>
              Hotéis, pousadas, chalés, resorts e apartamentos com os melhores preços
            </p>
          </div>

          {/* Search box */}
          <div className="max-w-4xl mx-auto rounded-3xl shadow-2xl p-3" style={{ backgroundColor: C.card }}>
            {/* Type tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {propTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className="px-4 py-2 rounded-xl text-xs whitespace-nowrap capitalize transition-all"
                  style={{ fontWeight: 600, backgroundColor: activeType === t ? C.primary : "transparent", color: activeType === t ? "white" : C.textMid }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              {/* Destination */}
              <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-3 border-2 hover:border-blue-300 focus-within:border-blue-500 transition-colors" style={{ borderColor: C.border }}>
                <MapPin size={18} style={{ color: C.primary, flexShrink: 0 }} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>Destino</span>
                  <input
                    placeholder="Cidade, hotel ou região..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="outline-none text-sm bg-transparent"
                    style={{ color: C.textDark, fontWeight: 500 }}
                  />
                </div>
              </div>

              {/* Check-in */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-3 border-2 hover:border-blue-300 focus-within:border-blue-500 transition-colors md:w-36" style={{ borderColor: C.border }}>
                <Calendar size={18} style={{ color: C.primary, flexShrink: 0 }} />
                <div className="flex flex-col flex-1">
                  <span className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>Entrada</span>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="outline-none text-sm bg-transparent" style={{ color: C.textDark, fontWeight: 500 }} />
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-3 border-2 hover:border-blue-300 focus-within:border-blue-500 transition-colors md:w-36" style={{ borderColor: C.border }}>
                <Calendar size={18} style={{ color: C.primary, flexShrink: 0 }} />
                <div className="flex flex-col flex-1">
                  <span className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>Saída</span>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="outline-none text-sm bg-transparent" style={{ color: C.textDark, fontWeight: 500 }} />
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-3 border-2 hover:border-blue-300 transition-colors cursor-pointer md:w-44" style={{ borderColor: C.border }}>
                <Users size={18} style={{ color: C.primary, flexShrink: 0 }} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>Hóspedes</span>
                  <span className="text-sm truncate" style={{ color: C.textDark, fontWeight: 500 }}>{guests}</span>
                </div>
                <ChevronDown size={14} style={{ color: C.textLight }} />
              </div>

              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: C.coral, color: "white", fontWeight: 700, fontSize: 15 }}
              >
                <Search size={18} /> Buscar
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[["2,8mi+","acomodações"],["230+","países"],["98%","satisfeitos"],["24/7","suporte"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <div style={{ fontWeight: 800, fontSize: 20, color: C.star }}>{v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMO STRIP ── */}
      <div style={{ backgroundColor: C.teal }} className="py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-white text-sm" style={{ fontWeight: 600 }}>🏷️ Oferta especial: até 35% OFF em mais de 2.000 hospedagens selecionadas hoje!</span>
          <button onClick={() => navigate("search")} className="text-sm px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white whitespace-nowrap" style={{ fontWeight: 700 }}>Ver agora</button>
        </div>
      </div>

      {/* ── ADMIN SETUP BANNER (apenas para usuários logados que ainda não são admin) ── */}
      {user && !isAdmin && onOpenAdminSetup && (
        <AdminSetupBanner onOpen={onOpenAdminSetup} />
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Popular Destinations */}
        <section>
          <SectionTitle title="Destinos populares" subtitle="Os mais buscados por viajantes brasileiros" action="Ver todos" onAction={() => navigate("search")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((d) => (
              <div key={d.id} onClick={() => navigate("search", { destination: d.name })} className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all" style={{ height: 160 }}>
                <ImageWithFallback src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm" style={{ fontWeight: 700 }}>{d.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>{d.count.toLocaleString("pt-BR")} opções</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TAXI SECTION ── */}
        <section className="rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #8B0D22 100%)` }}>
          <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <Car size={14} style={{ color: C.coral }} />
                <span className="text-xs text-white" style={{ fontWeight: 700 }}>Serviço de Táxi</span>
              </div>
              <h2 className="mb-3" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,3vw,2rem)", color: "white" }}>
                Táxi direto para sua hospedagem
              </h2>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                Motoristas verificados e avaliados, direto da plataforma. Reserve com antecedência e chegue com conforto.
              </p>
              <div className="flex flex-wrap gap-4 mb-6 justify-center md:justify-start">
                {[
                  { icon: "✅", label: "Motoristas verificados" },
                  { icon: "⭐", label: "Avaliações reais" },
                  { icon: "💳", label: isRealMode ? "Pagamento pendente · gateway não configurado" : "Pagamento simulado no protótipo" },
                  { icon: "📍", label: "Rastreamento em tempo real" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("taxi")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: C.coral, color: "#1A0E00", fontWeight: 800 }}
              >
                <Car size={16} /> Reservar táxi agora <ArrowRight size={15} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { icon: "🚗", label: "Econômico", price: "a partir de R$ 18" },
                { icon: "🚙", label: "Conforto", price: "a partir de R$ 25" },
                { icon: "🚐", label: "SUV", price: "a partir de R$ 35" },
              ].map((cat) => (
                <div key={cat.label} onClick={() => navigate("taxi")} className="rounded-2xl p-4 text-center cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <p className="text-xs text-white" style={{ fontWeight: 700 }}>{cat.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{cat.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured properties */}
        <section>
          <SectionTitle title="Hospedagens em destaque" subtitle="Selecionadas pela nossa equipe de curadoria" action="Ver todas" onAction={() => navigate("search")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROPERTIES.map((p) => (
              <PropertyCard key={p.id} property={p} navigate={navigate} favorites={favorites} onToggleFav={onToggleFav} />
            ))}
          </div>
        </section>

        {/* ── SEÇÃO SEJA UM PARCEIRO ── */}
        <section>
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs mb-3" style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 700 }}>
              🤝 Seja um Parceiro HospedAqui
            </span>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.3rem,3vw,2rem)", color: C.textDark }}>
              Transforme o que você tem em renda
            </h2>
            <p className="mt-2 text-sm max-w-lg mx-auto" style={{ color: C.textMid }}>
              Cadastre-se como motorista ou anfitrião e comece a faturar com a maior plataforma de hospedagem do Brasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card Motorista */}
            <div className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 420 }}>
              {/* Imagem de fundo */}
              <ImageWithFallback
                src={IMG_DRIVER}
                alt="Motorista de táxi"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay gradiente */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.15) 100%)" }} />

              {/* Badge */}
              <div className="absolute top-5 left-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                  <Car size={12} /> Motorista Parceiro
                </span>
              </div>

              {/* Conteúdo */}
              <div className="absolute inset-0 flex flex-col justify-end p-7">
                <p className="text-xs mb-2" style={{ color: C.star, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Seu carro, sua renda
                </p>
                <h3 className="mb-2" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,2.5vw,1.65rem)", color: "white", lineHeight: 1.2 }}>
                  Dirija para a HospedAqui e ganhe mais por km
                </h3>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  {isRealMode ? "Leve hóspedes do aeroporto direto à pousada. Os pedidos ficam registrados, mas pagamentos e repasses ainda não são processados." : "Leve hóspedes do aeroporto direto à pousada. Pagamentos e repasses são apenas simulados nesta demonstração."}
                </p>

                {/* Benefícios */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-6">
                  {[isRealMode ? "Repasses PIX após integração" : "Pagamento via PIX simulado", "Horários flexíveis", "App dedicado ao motorista", "Suporte 24h"].map((b) => (
                    <span key={b} className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                      <CheckCircle2 size={12} style={{ color: C.star, flexShrink: 0 }} /> {b}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleDriverCTA}
                  className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-2xl text-sm transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: C.star, color: "#1A0E00", fontWeight: 800 }}
                >
                  <Car size={16} />
                  {driverBtnLabel}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card Anfitrião */}
            <div className="relative rounded-3xl overflow-hidden group" style={{ minHeight: 420 }}>
              {/* Imagem de fundo */}
              <ImageWithFallback
                src={IMG_HOST}
                alt="Anfitrião de hospedagem"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay gradiente */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.15) 100%)" }} />

              {/* Badge */}
              <div className="absolute top-5 left-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: "#7A5C3A", color: "white", fontWeight: 700 }}>
                  <Building2 size={12} /> Anfitrião Parceiro
                </span>
              </div>

              {/* Conteúdo */}
              <div className="absolute inset-0 flex flex-col justify-end p-7">
                <p className="text-xs mb-2" style={{ color: "#F5C518", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Seu espaço, sua história
                </p>
                <h3 className="mb-2" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,2.5vw,1.65rem)", color: "white", lineHeight: 1.2 }}>
                  Abra seu hotel ou pousada para o Brasil inteiro
                </h3>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  Cadastre sua hospedagem e alcance milhares de viajantes. Você controla preços, disponibilidade e recebe reservas direto na plataforma.
                </p>

                {/* Benefícios */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-6">
                  {["Zero taxa de adesão", "Painel de gestão completo", "Visibilidade nacional", "Suporte dedicado"].map((b) => (
                    <span key={b} className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                      <CheckCircle2 size={12} style={{ color: "#F5C518", flexShrink: 0 }} /> {b}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleHostCTA}
                  className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-2xl text-sm transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "#F5C518", color: "#1A0E00", fontWeight: 800 }}
                >
                  <Building2 size={16} />
                  {hostBtnLabel}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé da seção */}
          <p className="text-center text-xs mt-5" style={{ color: C.textLight }}>
            Já tem conta?{" "}
            <button onClick={() => navigate(user ? "profile" : "login")} style={{ color: C.primary, fontWeight: 700 }} className="hover:underline">
              {user ? "Acesse seu perfil" : "Faça login"}
            </button>{" "}
            e escolha o tipo de parceria.
          </p>
        </section>

        {/* Trust pillars */}
        <section className="rounded-3xl p-8" style={{ backgroundColor: C.primaryLight }}>
          <h2 className="text-center mb-7" style={{ fontWeight: 800, fontSize: "clamp(1.1rem,2.5vw,1.5rem)", color: C.textDark }}>Por que escolher a HospedAqui?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: <Shield size={28} />, title: "Reserva segura", desc: "Dados e pagamento protegidos com criptografia." },
              { icon: <Tag size={28} />, title: "Melhor preço", desc: "Garantia de preço. Encontrou mais barato? Igualamos." },
              { icon: <Award size={28} />, title: "Avaliações reais", desc: "Avaliações verificadas de quem realmente hospedou." },
              { icon: <Headphones size={28} />, title: "Suporte 24h", desc: "Atendimento em português a qualquer hora." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-white">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm mb-1" style={{ fontWeight: 700, color: C.textDark }}>{item.title}</h3>
                  <p className="text-xs" style={{ color: C.textMid }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loyalty banner */}
        <section className="rounded-3xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${C.teal} 0%, #086860 100%)` }}>
          <div className="absolute inset-0 opacity-10">
            {[...Array(4)].map((_, i) => <div key={i} className={`absolute rounded-full border-2 border-white`} style={{ width: 120 + i*80, height: 120 + i*80, right: -60 + i*20, top: -30 + i*10 }} />)}
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
            <div className="text-center md:text-left">
              <Badge color="coral" size="md">Programa Fidelidade</Badge>
              <h2 className="text-white mt-3 mb-2" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,3vw,1.9rem)" }}>
                Acumule pontos e ganhe<br />estadias grátis
              </h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
                A cada reserva você acumula pontos que valem diárias, upgrades<br />e experiências exclusivas em todo o Brasil.
              </p>
              <div className="flex flex-wrap gap-6 mt-4">
                {[["5x","pontos no 1º mês"],["300+","benefícios"],["1.200+","hotéis parceiros"]].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: C.star }}>{v}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 text-center">
              <button
                onClick={() => navigate(user ? "profile" : "register")}
                className="px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
                style={{ backgroundColor: C.star, color: "#1A0E00", fontWeight: 800, fontSize: 15 }}
              >
                {user ? "Ver meus pontos" : "Cadastrar grátis"}
              </button>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 8 }}>Sem taxas · Sem compromisso</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

// ── Property Card (reusable) ───────────────────────────────────────────────────
export function PropertyCard({ property, navigate, favorites, onToggleFav }: {
  property: any; navigate: (p: string, params?: any) => void; favorites: string[]; onToggleFav: (id: string) => void;
}) {
  const isFav = favorites.includes(property.id);
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border"
      style={{ borderColor: C.border }}
      onClick={() => navigate("property", { propertyId: property.id })}
    >
      <div className="relative overflow-hidden" style={{ height: 210 }}>
        <ImageWithFallback src={property.images[0]} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(property.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart size={15} fill={isFav ? C.coral : "none"} stroke={isFav ? C.coral : C.textMid} />
        </button>
        {property.badge && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>{property.badge}</div>
        )}
        {property.originalPrice && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: C.star, color: "#1A0E00", fontWeight: 700 }}>
            -{Math.round((1 - property.pricePerNight / property.originalPrice) * 100)}% OFF
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: C.textMid, fontWeight: 600 }}>{property.type}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm flex-1 pr-2" style={{ fontWeight: 700, color: C.textDark }}>{property.name}</h3>
          <div className="shrink-0">
            <ScoreBadge score={property.score} label={property.scoreLabel} />
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={12} style={{ color: C.textLight }} />
          <span className="text-xs" style={{ color: C.textLight }}>{property.city}, {property.state}</span>
          <span className="mx-1" style={{ color: C.border }}>·</span>
          <Stars n={property.stars} />
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities.slice(0, 3).map((a: string) => (
            <span key={a} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: C.tealLight, color: C.teal, fontWeight: 500 }}>{a}</span>
          ))}
        </div>
        <div className="flex items-end justify-between border-t pt-3" style={{ borderColor: C.border }}>
          <div>
            {property.originalPrice && <div className="text-xs line-through" style={{ color: C.textLight }}>R$ {property.originalPrice}/noite</div>}
            <div style={{ fontWeight: 800, fontSize: 18, color: C.primary }}>R$ {property.pricePerNight}<span className="text-xs font-normal" style={{ color: C.textLight }}>/noite</span></div>
            <div className="text-xs" style={{ color: C.textLight }}>Impostos incl. · Cancelamento flex.</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate("property", { propertyId: property.id }); }}
            className="px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: C.primary, color: "white", fontWeight: 600 }}
          >
            Ver oferta
          </button>
        </div>
      </div>
    </div>
  );
}
import { getIsPrototypeMode, IS_CONFIGURED } from "./services/client";
  const isRealMode = IS_CONFIGURED && !getIsPrototypeMode();
