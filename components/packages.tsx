import { useState } from "react";
import {
  Plane, Hotel, Calendar, Users, Search, MapPin,
  Clock, SlidersHorizontal, ArrowLeftRight, Check,
  ChevronDown, X,
} from "lucide-react";
import { C, ImageWithFallback, Stars, ScoreBadge, Spinner } from "./ds";
import { PROPERTIES, Property } from "./data";

// ─── Hero image ──────────────────────────────────────────────────────────────
const HERO_IMG =
  "https://images.unsplash.com/photo-1758531491352-7887c1fe45b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

// ─── Cores do tema aéreo (azul-marinho) ──────────────────────────────────────
const FLIGHT_BG   = "#0A2558";
const FLIGHT_MID  = "#1A3A78";
const FLIGHT_ICON = "#3B82F6";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type FlightPkg = {
  id: string;
  airline: string;
  airlineCode: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  propertyId: string;
  nights: number;
  pricePerPerson: number;
  originalPrice?: number;
  includes: string[];
  badge?: string;
};

// ─── Pacotes mock ────────────────────────────────────────────────────────────
const PACKAGES: FlightPkg[] = [
  {
    id: "pk1", airline: "BrasilAir", airlineCode: "BA",
    origin: "São Paulo", originCode: "GRU",
    destination: "Rio de Janeiro", destinationCode: "GIG",
    departTime: "06:30", arriveTime: "07:40", duration: "1h 10min", stops: 0,
    propertyId: "p1", nights: 3, pricePerPerson: 1890, originalPrice: 2340,
    includes: ["Passagem ida e volta", "Hotel 5★", "Café da manhã"],
    badge: "Mais vendido",
  },
  {
    id: "pk2", airline: "AzulCéu", airlineCode: "AC",
    origin: "São Paulo", originCode: "CGH",
    destination: "Salvador", destinationCode: "SSA",
    departTime: "08:15", arriveTime: "10:45", duration: "2h 30min", stops: 0,
    propertyId: "p2", nights: 4, pricePerPerson: 1640,
    includes: ["Passagem ida e volta", "Hotel 4★", "Café da manhã"],
  },
  {
    id: "pk3", airline: "VoaBrazil", airlineCode: "VB",
    origin: "São Paulo", originCode: "GRU",
    destination: "Gramado", destinationCode: "CXJ",
    departTime: "10:00", arriveTime: "11:25", duration: "1h 25min", stops: 0,
    propertyId: "p3", nights: 3, pricePerPerson: 1420,
    includes: ["Passagem ida e volta", "Chalé premium", "Café colonial"],
    badge: "Melhor custo-benefício",
  },
  {
    id: "pk4", airline: "SolAir", airlineCode: "SA",
    origin: "Rio de Janeiro", originCode: "GIG",
    destination: "Fortaleza", destinationCode: "FOR",
    departTime: "07:00", arriveTime: "09:50", duration: "2h 50min", stops: 0,
    propertyId: "p4", nights: 5, pricePerPerson: 3280,
    includes: ["Passagem ida e volta", "Resort all-inclusive", "Tudo incluído"],
    badge: "Premium",
  },
  {
    id: "pk5", airline: "BrasilAir", airlineCode: "BA",
    origin: "São Paulo", originCode: "GRU",
    destination: "Florianópolis", destinationCode: "FLN",
    departTime: "14:30", arriveTime: "15:50", duration: "1h 20min", stops: 0,
    propertyId: "p6", nights: 4, pricePerPerson: 1580,
    includes: ["Passagem ida e volta", "Pousada ecológica", "Café artesanal"],
  },
  {
    id: "pk6", airline: "AzulCéu", airlineCode: "AC",
    origin: "Rio de Janeiro", originCode: "SDU",
    destination: "São Paulo", destinationCode: "CGH",
    departTime: "09:00", arriveTime: "10:10", duration: "1h 10min", stops: 0,
    propertyId: "p5", nights: 2, pricePerPerson: 980,
    includes: ["Passagem ida e volta", "Flat moderno", "Wi-Fi e academia"],
    badge: "Curta estadia",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  navigate: (p: string, params?: any) => void;
  params?: any;
  user: any;
};

// ─── Card de pacote ───────────────────────────────────────────────────────────
function PackageCard({ pkg, navigate }: { pkg: FlightPkg; navigate: (p: string, params?: any) => void }) {
  const hotel = PROPERTIES.find((p) => p.id === pkg.propertyId);
  if (!hotel) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden border hover:shadow-xl transition-all cursor-pointer group"
      style={{ backgroundColor: C.card, borderColor: C.border }}
      onClick={() => navigate("property", { propertyId: hotel.id })}
    >
      <div className="flex flex-col md:flex-row">
        {/* Foto do hotel */}
        <div className="relative md:w-60 h-48 md:h-auto shrink-0 overflow-hidden">
          <ImageWithFallback
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {pkg.badge && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs text-white shadow"
              style={{ backgroundColor: C.coral, fontWeight: 700 }}
            >
              {pkg.badge}
            </div>
          )}
          {/* Tag voo + hotel */}
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white"
            style={{ backgroundColor: "rgba(10,37,88,0.85)", backdropFilter: "blur(4px)" }}
          >
            <Plane size={10} />
            <span style={{ fontWeight: 700 }}>+ Hotel</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-4 flex flex-col gap-3 justify-between">
          {/* Linha do voo */}
          <div className="rounded-xl p-3" style={{ backgroundColor: C.bg }}>
            <div className="flex items-center justify-between mb-1.5">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-white"
                style={{ backgroundColor: FLIGHT_BG, fontWeight: 700 }}
              >
                <Plane size={11} />
                {pkg.airline}
              </div>
              <span className="text-xs" style={{ color: C.textLight }}>Ida e volta</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Origem */}
              <div className="text-center w-16">
                <div style={{ fontWeight: 800, fontSize: 18, color: C.textDark }}>{pkg.departTime}</div>
                <div
                  className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
                  style={{ backgroundColor: FLIGHT_BG, color: "white", fontWeight: 700, letterSpacing: 1 }}
                >
                  {pkg.originCode}
                </div>
              </div>

              {/* Linha central */}
              <div className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-xs" style={{ color: C.textLight }}>{pkg.duration}</span>
                <div className="w-full flex items-center gap-1">
                  <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
                  <Plane size={13} style={{ color: FLIGHT_ICON }} />
                  <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
                </div>
                <span
                  className="text-xs"
                  style={{ color: pkg.stops === 0 ? C.success : C.warning, fontWeight: 600 }}
                >
                  {pkg.stops === 0 ? "✈ Direto" : `${pkg.stops} escala`}
                </span>
              </div>

              {/* Destino */}
              <div className="text-center w-16">
                <div style={{ fontWeight: 800, fontSize: 18, color: C.textDark }}>{pkg.arriveTime}</div>
                <div
                  className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
                  style={{ backgroundColor: FLIGHT_BG, color: "white", fontWeight: 700, letterSpacing: 1 }}
                >
                  {pkg.destinationCode}
                </div>
              </div>
            </div>
          </div>

          {/* Info do hotel */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ fontWeight: 700, color: C.textDark }}>
                {hotel.name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Stars n={hotel.stars} />
                <span className="text-xs" style={{ color: C.textLight }}>
                  {hotel.city}, {hotel.state} · {pkg.nights} noites
                </span>
              </div>
              {/* O que inclui */}
              <div className="flex flex-wrap gap-1 mt-2">
                {pkg.includes.map((inc) => (
                  <span
                    key={inc}
                    className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: C.successLight, color: C.success, fontWeight: 600 }}
                  >
                    <Check size={9} />
                    {inc}
                  </span>
                ))}
              </div>
            </div>

            {/* Score */}
            <div className="shrink-0">
              <div
                className="px-2.5 py-1.5 rounded-xl rounded-tr-none text-center"
                style={{ backgroundColor: C.primary, color: "white", fontWeight: 800, fontSize: 16 }}
              >
                {hotel.score.toFixed(1)}
              </div>
              <div className="text-xs text-center mt-0.5" style={{ color: C.textLight }}>
                {hotel.scoreLabel}
              </div>
            </div>
          </div>

          {/* Preço + CTA */}
          <div
            className="flex items-end justify-between pt-3 border-t"
            style={{ borderColor: C.border }}
          >
            <div>
              <div className="text-xs" style={{ color: C.textLight }}>A partir de</div>
              {pkg.originalPrice && (
                <div className="text-xs line-through" style={{ color: C.textLight }}>
                  R$ {pkg.originalPrice.toLocaleString("pt-BR")}
                </div>
              )}
              <div style={{ fontWeight: 900, fontSize: 22, color: C.primary, lineHeight: 1.2 }}>
                R$ {pkg.pricePerPerson.toLocaleString("pt-BR")}
              </div>
              <div className="text-xs" style={{ color: C.textLight }}>
                por pessoa · voo + {pkg.nights} noites
              </div>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate("property", { propertyId: hotel.id });
              }}
            >
              Ver pacote →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function PackagesPage({ navigate, params = {} }: Props) {
  const [origin, setOrigin]           = useState(params.origin || "São Paulo");
  const [destination, setDestination] = useState(params.destination || "");
  const [departDate, setDepartDate]   = useState(params.checkIn || "");
  const [returnDate, setReturnDate]   = useState(params.checkOut || "");
  const [passengers, setPassengers]   = useState("2 passageiros");
  const [loading, setLoading]         = useState(false);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [sortBy, setSortBy]           = useState("recomendado");
  const [maxBudget, setMaxBudget]     = useState(5000);
  const [minNights, setMinNights]     = useState(0);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  const swapOriginDest = () => {
    const tmp = origin;
    setOrigin(destination || "");
    setDestination(tmp);
  };

  const filtered = PACKAGES
    .filter((p) => {
      if (p.pricePerPerson > maxBudget) return false;
      if (minNights && p.nights < minNights) return false;
      if (destination && !p.destination.toLowerCase().includes(destination.toLowerCase())) return false;
      if (origin && !p.origin.toLowerCase().includes(origin.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "menor_preco") return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === "maior_preco") return b.pricePerPerson - a.pricePerPerson;
      return 0;
    });

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>

      {/* ── HERO / BUSCA ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
        {/* Fundo */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={HERO_IMG}
            alt="Voos"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${FLIGHT_BG}F0 0%, ${FLIGHT_MID}CC 60%, rgba(0,80,180,0.55) 100%)` }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Título */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(6px)" }}
            >
              <Plane size={14} /> Voos + Hospedagem
            </div>
            <h1 className="text-white mb-1" style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.4rem)", lineHeight: 1.15 }}>
              Pacotes completos para o Brasil inteiro
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(0.85rem,1.8vw,1rem)" }}>
              Passagem + hotel numa única reserva — sem complicação, com os melhores preços
            </p>
          </div>

          {/* Formulário de busca */}
          <div className="max-w-5xl mx-auto">
            <div
              className="rounded-2xl p-4 shadow-2xl"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="flex flex-col md:flex-row gap-2">
                {/* Origem */}
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5">
                  <MapPin size={15} style={{ color: FLIGHT_BG, flexShrink: 0 }} />
                  <input
                    placeholder="Origem"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="outline-none text-sm flex-1 bg-transparent"
                    style={{ color: C.textDark, fontWeight: 500 }}
                  />
                </div>

                {/* Swap button */}
                <button
                  onClick={swapOriginDest}
                  className="hidden md:flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                  style={{ width: 40, color: "white" }}
                  title="Inverter origem e destino"
                >
                  <ArrowLeftRight size={16} />
                </button>

                {/* Destino */}
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5">
                  <MapPin size={15} style={{ color: FLIGHT_BG, flexShrink: 0 }} />
                  <input
                    placeholder="Destino"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="outline-none text-sm flex-1 bg-transparent"
                    style={{ color: C.textDark, fontWeight: 500 }}
                  />
                </div>

                {/* Datas */}
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 md:w-36">
                  <Calendar size={15} style={{ color: FLIGHT_BG, flexShrink: 0 }} />
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="outline-none text-xs bg-transparent flex-1"
                    style={{ color: C.textDark }}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 md:w-36">
                  <Calendar size={15} style={{ color: FLIGHT_BG, flexShrink: 0 }} />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="outline-none text-xs bg-transparent flex-1"
                    style={{ color: C.textDark }}
                  />
                </div>

                {/* Passageiros */}
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 md:w-44">
                  <Users size={15} style={{ color: FLIGHT_BG, flexShrink: 0 }} />
                  <input
                    placeholder="Passageiros"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="outline-none text-sm bg-transparent flex-1"
                    style={{ color: C.textDark }}
                  />
                </div>

                {/* Buscar */}
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity shrink-0"
                  style={{ backgroundColor: C.coral, color: "white", fontWeight: 700, fontSize: 14 }}
                >
                  <Search size={16} /> Buscar
                </button>
              </div>
            </div>

            {/* Destinos populares */}
            <div className="flex gap-2 mt-3 flex-wrap justify-center">
              {["Rio de Janeiro","Salvador","Fortaleza","Gramado","Florianópolis"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDestination(d)}
                  className="text-xs px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, backdropFilter: "blur(4px)" }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DIFERENCIAIS ── */}
      <div style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { icon: "✈️", text: "Passagem + hotel em 1 reserva" },
              { icon: "💰", text: "Até 35% mais barato que separado" },
              { icon: "🔒", text: "Pagamento único e seguro" },
              { icon: "↩️", text: "Cancelamento flexível em muitos pacotes" },
              { icon: "🎧", text: "Suporte 24h durante a viagem" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 shrink-0 text-xs" style={{ color: C.textMid, fontWeight: 500 }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESULTADOS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Controles */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>
              {loading ? "Buscando pacotes..." : `${filtered.length} pacotes disponíveis`}
              {destination && <span style={{ color: C.textMid, fontWeight: 400 }}> para {destination}</span>}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: C.textLight }}>
              Preços por pessoa · voo ida e volta + hospedagem
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 border"
              style={{ borderColor: C.border, backgroundColor: C.card }}
            >
              <span className="text-xs" style={{ color: C.textMid, fontWeight: 500 }}>Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs outline-none bg-transparent cursor-pointer"
                style={{ color: C.textDark, fontWeight: 600 }}
              >
                <option value="recomendado">Recomendados</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
              </select>
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs border transition-colors"
              style={{
                borderColor: filterOpen ? C.primary : C.border,
                backgroundColor: filterOpen ? C.primaryLight : C.card,
                color: filterOpen ? C.primary : C.textMid,
                fontWeight: 600,
              }}
            >
              <SlidersHorizontal size={14} /> Filtros
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de filtros */}
          {filterOpen && (
            <aside className="w-72 shrink-0 hidden md:block space-y-4">
              <div
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: C.card, borderColor: C.border }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>Filtros de pacote</h3>
                  <button
                    onClick={() => { setMaxBudget(5000); setMinNights(0); }}
                    className="text-xs"
                    style={{ color: C.coral, fontWeight: 600 }}
                  >
                    Limpar
                  </button>
                </div>

                {/* Orçamento */}
                <div className="mb-5">
                  <h4 className="text-xs mb-2" style={{ fontWeight: 600, color: C.textDark }}>
                    Orçamento máx. por pessoa
                  </h4>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(+e.target.value)}
                    className="w-full"
                    style={{ accentColor: C.primary }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: C.textMid }}>
                    <span>R$ 500</span>
                    <span style={{ color: C.primary, fontWeight: 700 }}>
                      até R$ {maxBudget.toLocaleString("pt-BR")}
                    </span>
                    <span>R$ 5.000</span>
                  </div>
                </div>

                {/* Noites mínimas */}
                <div className="mb-5">
                  <h4 className="text-xs mb-2" style={{ fontWeight: 600, color: C.textDark }}>
                    Duração mínima (noites)
                  </h4>
                  <div className="flex gap-2">
                    {[0, 2, 3, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setMinNights(n)}
                        className="flex-1 py-1.5 rounded-lg text-xs border transition-colors"
                        style={{
                          borderColor: minNights === n ? C.primary : C.border,
                          backgroundColor: minNights === n ? C.primaryLight : "transparent",
                          color: minNights === n ? C.primary : C.textMid,
                          fontWeight: 600,
                        }}
                      >
                        {n === 0 ? "Todos" : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Companhias */}
                <div>
                  <h4 className="text-xs mb-3" style={{ fontWeight: 600, color: C.textDark }}>
                    Companhia aérea
                  </h4>
                  {["BrasilAir", "AzulCéu", "VoaBrazil", "SolAir"].map((airline) => (
                    <label key={airline} className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" defaultChecked style={{ accentColor: C.primary }} />
                      <span className="text-sm" style={{ color: C.textMid }}>{airline}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Lista de pacotes */}
          <div className="flex-1 min-w-0 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={32} />
                <p style={{ color: C.textMid }}>Buscando os melhores pacotes...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="text-5xl">✈️</div>
                <h3 style={{ fontWeight: 700, color: C.textDark, fontSize: 18 }}>
                  Nenhum pacote encontrado
                </h3>
                <p style={{ color: C.textMid, fontSize: 14, maxWidth: 380 }}>
                  Tente ajustar os filtros ou buscar outro destino.
                </p>
                <button
                  onClick={() => { setMaxBudget(5000); setMinNights(0); setDestination(""); }}
                  className="mt-2 px-5 py-2.5 rounded-xl text-sm"
                  style={{ backgroundColor: C.primary, color: "white", fontWeight: 600 }}
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              filtered.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} navigate={navigate} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
