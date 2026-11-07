import { useState } from "react";
import { Search, MapPin, Calendar, Users, SlidersHorizontal, X, ChevronDown, List, Map, Star } from "lucide-react";
import { C, ImageWithFallback, Stars, ScoreBadge, Badge, Spinner } from "./ds";
import { PROPERTIES, AMENITY_LIST, PROPERTY_TYPES, managedToProperty } from "./data";
import { PropertyCard } from "./home";

type Props = { navigate: (p: string, params?: any) => void; params?: any; user: any; favorites: string[]; onToggleFav: (id: string) => void; managedProperties?: any[]; };

export function SearchPage({ navigate, params = {}, user, favorites, onToggleFav, managedProperties = [] }: Props) {
  const [destination, setDestination] = useState(params.destination || "");
  const [checkIn, setCheckIn] = useState(params.checkIn || "");
  const [checkOut, setCheckOut] = useState(params.checkOut || "");
  const [guests, setGuests] = useState(params.guests || "2 adultos");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recomendado");
  const [view, setView] = useState<"list"|"map">("list");
  const [loading, setLoading] = useState(false);

  // Filters
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [minStars, setMinStars] = useState(0);

  const toggleType = (t: string) => setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const toggleAmenity = (a: string) => setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const hasFilters = selectedTypes.length > 0 || selectedAmenities.length > 0 || minScore > 0 || minStars > 0 || priceMin > 0 || priceMax < 2000;
  const clearFilters = () => { setSelectedTypes([]); setSelectedAmenities([]); setMinScore(0); setMinStars(0); setPriceMin(0); setPriceMax(2000); };

  const allProperties = [
    ...PROPERTIES,
    ...managedProperties.filter((p) => p.active).map(managedToProperty),
  ];

  const filtered = allProperties
    .filter((p) => {
      if (priceMin && p.pricePerNight < priceMin) return false;
      if (priceMax && p.pricePerNight > priceMax) return false;
      if (selectedTypes.length && !selectedTypes.includes(p.type)) return false;
      if (selectedAmenities.length && !selectedAmenities.every((a) => p.amenities.includes(a))) return false;
      if (minScore && p.score < minScore) return false;
      if (minStars && p.stars < minStars) return false;
      if (destination && !p.city.toLowerCase().includes(destination.toLowerCase()) && !p.name.toLowerCase().includes(destination.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "menor_preco") return a.pricePerNight - b.pricePerNight;
      if (sortBy === "melhor_avaliacao") return b.score - a.score;
      if (sortBy === "maior_preco") return b.pricePerNight - a.pricePerNight;
      return b.score * 0.6 + (1 / a.pricePerNight) * 0.4 > a.score * 0.6 + (1 / b.pricePerNight) * 0.4 ? -1 : 1;
    });

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      {/* ── SEARCH BAR ── */}
      <div style={{ backgroundColor: C.primary }} className="py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: C.card }}>
              <MapPin size={16} style={{ color: C.primary, flexShrink: 0 }} />
              <input
                placeholder="Destino..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="outline-none text-sm flex-1 bg-transparent"
                style={{ color: C.textDark, fontWeight: 500 }}
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 md:w-34" style={{ backgroundColor: C.card }}>
              <Calendar size={16} style={{ color: C.primary, flexShrink: 0 }} />
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="outline-none text-sm bg-transparent flex-1" style={{ color: C.textDark }} />
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 md:w-34" style={{ backgroundColor: C.card }}>
              <Calendar size={16} style={{ color: C.primary, flexShrink: 0 }} />
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="outline-none text-sm bg-transparent flex-1" style={{ color: C.textDark }} />
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 md:w-40" style={{ backgroundColor: C.card }}>
              <Users size={16} style={{ color: C.primary, flexShrink: 0 }} />
              <input placeholder="Hóspedes" value={guests} onChange={(e) => setGuests(e.target.value)} className="outline-none text-sm bg-transparent flex-1" style={{ color: C.textDark }} />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 hover:opacity-90"
              style={{ backgroundColor: C.coral, color: "white", fontWeight: 700, fontSize: 14 }}
            >
              <Search size={16} /> Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── CONTROLS ROW ── */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>
              {loading ? "Buscando..." : `${filtered.length} hospedagens encontradas`}
              {destination && <span style={{ color: C.textMid, fontWeight: 400 }}> em {destination}</span>}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: C.textLight }}>Dados demonstrativos — protótipo HospedAqui</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 border cursor-pointer" style={{ borderColor: C.border, backgroundColor: C.card }}>
              <span className="text-xs" style={{ color: C.textMid, fontWeight: 500 }}>Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs outline-none bg-transparent cursor-pointer"
                style={{ color: C.textDark, fontWeight: 600 }}
              >
                <option value="recomendado">Recomendados</option>
                <option value="menor_preco">Menor preço</option>
                <option value="melhor_avaliacao">Melhor avaliação</option>
                <option value="maior_preco">Maior preço</option>
              </select>
            </div>
            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs border transition-colors"
              style={{ borderColor: filterOpen ? C.primary : C.border, backgroundColor: filterOpen ? C.primaryLight : C.card, color: filterOpen ? C.primary : C.textMid, fontWeight: 600 }}
            >
              <SlidersHorizontal size={14} /> Filtros {hasFilters && <span className="ml-1 px-1.5 py-0.5 rounded-full text-white text-[10px]" style={{ backgroundColor: C.coral }}>!</span>}
            </button>
            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: C.border }}>
              {(([["list","Lista"],["map","Mapa"]] as const)).map(([v,l]) => (
                <button key={v} onClick={() => setView(v as any)} className="px-3 py-2 text-xs transition-colors" style={{ backgroundColor: view === v ? C.primary : C.card, color: view === v ? "white" : C.textMid, fontWeight: 600 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {selectedTypes.map((t) => (
              <button key={t} onClick={() => toggleType(t)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 600 }}>
                {t} <X size={11} />
              </button>
            ))}
            {minStars > 0 && <button onClick={() => setMinStars(0)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 600 }}>{minStars}+ estrelas <X size={11} /></button>}
            <button onClick={clearFilters} className="text-xs px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: C.coral, fontWeight: 600 }}>Limpar filtros</button>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── FILTER SIDEBAR ── */}
          {filterOpen && (
            <aside className="w-72 shrink-0 space-y-5 hidden md:block">
              <div className="rounded-2xl p-5 border" style={{ backgroundColor: C.card, borderColor: C.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: C.textDark }}>Filtros</h3>
                  <button onClick={clearFilters} className="text-xs" style={{ color: C.coral, fontWeight: 600 }}>Limpar tudo</button>
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Preço por noite</h4>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-xs" style={{ color: C.textLight }}>De</label>
                      <input type="number" value={priceMin} onChange={(e) => setPriceMin(+e.target.value)} className="w-full mt-1 rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: C.border, color: C.textDark, backgroundColor: C.bg }} placeholder="R$ 0" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs" style={{ color: C.textLight }}>Até</label>
                      <input type="number" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} className="w-full mt-1 rounded-lg px-2 py-1.5 text-sm border outline-none" style={{ borderColor: C.border, color: C.textDark, backgroundColor: C.bg }} placeholder="R$ 2000" />
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="mb-5">
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Tipo de acomodação</h4>
                  <div className="space-y-2">
                    {PROPERTY_TYPES.map((t) => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} className="rounded" style={{ accentColor: C.primary }} />
                        <span className="text-sm" style={{ color: C.textMid }}>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-5">
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Categoria (estrelas)</h4>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setMinStars(minStars === n ? 0 : n)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-colors" style={{ borderColor: minStars === n ? C.primary : C.border, backgroundColor: minStars === n ? C.primaryLight : C.bg, color: minStars === n ? C.primary : C.textMid, fontWeight: 600 }}>
                        {n}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score */}
                <div className="mb-5">
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Nota mínima</h4>
                  <div className="flex gap-2 flex-wrap">
                    {[0,7,8,9].map((n) => (
                      <button key={n} onClick={() => setMinScore(n)} className="px-3 py-1.5 rounded-lg text-xs border transition-colors" style={{ borderColor: minScore === n ? C.primary : C.border, backgroundColor: minScore === n ? C.primaryLight : C.bg, color: minScore === n ? C.primary : C.textMid, fontWeight: 600 }}>
                        {n === 0 ? "Qualquer" : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Comodidades</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {AMENITY_LIST.slice(0, 10).map((a) => (
                      <label key={a} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ accentColor: C.teal }} />
                        <span className="text-xs" style={{ color: C.textMid }}>{a}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* ── RESULTS ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner size={32} />
                <p style={{ color: C.textMid }}>Buscando as melhores opções...</p>
              </div>
            ) : view === "map" ? (
              <div className="rounded-2xl border overflow-hidden flex items-center justify-center" style={{ borderColor: C.border, backgroundColor: C.card, height: 500 }}>
                <div className="text-center p-8">
                  <div className="text-4xl mb-3">🗺️</div>
                  <h3 style={{ fontWeight: 700, color: C.textDark, fontSize: 16 }}>Visualização em mapa</h3>
                  <p className="text-sm mt-1" style={{ color: C.textMid }}>Integração com mapa interativo disponível na versão completa</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {filtered.map((p) => (
                      <button key={p.id} onClick={() => navigate("property", { propertyId: p.id })} className="text-left p-2 rounded-xl border hover:border-blue-300 transition-colors" style={{ borderColor: C.border, backgroundColor: C.bg }}>
                        <div className="text-xs font-semibold" style={{ color: C.textDark }}>{p.name}</div>
                        <div className="text-xs" style={{ color: C.primary, fontWeight: 700 }}>R$ {p.pricePerNight}/noite</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="text-5xl">🔍</div>
                <h3 style={{ fontWeight: 700, color: C.textDark, fontSize: 18 }}>Nenhuma hospedagem encontrada</h3>
                <p style={{ color: C.textMid, fontSize: 14, maxWidth: 380 }}>Tente ajustar os filtros ou buscar por outro destino.</p>
                <button onClick={clearFilters} className="mt-2 px-5 py-2.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 600 }}>Limpar filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} navigate={navigate} favorites={favorites} onToggleFav={onToggleFav} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}