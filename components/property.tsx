import { useState, type CSSProperties } from "react";
import {
  MapPin, Star, Heart, ChevronLeft, ChevronRight, X,
  Wifi, Car, Coffee, Waves, Dumbbell, UtensilsCrossed, Wind, Dog, Accessibility,
  Phone, Clock, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Send, Ban,
} from "lucide-react";
import { C, ImageWithFallback, Stars, ScoreBadge, Badge, Card, Alert, AmenityChip } from "./ds";
import { PROPERTIES, ROOMS, managedToProperty, managedToRoom } from "./data";
import { propertyService } from "./services/api";
import { getIsPrototypeMode, IS_CONFIGURED } from "./services/client";

type Props = {
  navigate: (p: string, params?: any) => void;
  params?: any;
  user: any;
  favorites: string[];
  onToggleFav: (id: string) => void;
  managedProperties?: any[];
};

type Review = {
  id: string;
  name: string;
  date: string;
  stars: number;   // 1–5
  score: number;   // 0–10
  text: string;
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
};

const AMENITY_ICONS: Record<string, any> = {
  "Wi-Fi grátis": <Wifi size={16} />, "Estacionamento": <Car size={16} />, "Café da manhã": <Coffee size={16} />,
  "Piscina": <Waves size={16} />, "Academia": <Dumbbell size={16} />, "Restaurante": <UtensilsCrossed size={16} />,
  "Ar-condicionado": <Wind size={16} />, "Pet friendly": <Dog size={16} />, "Acessibilidade": <Accessibility size={16} />,
};

// ─── Interactive Star Rating ──────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0 }}
        >
          <svg width="30" height="30" viewBox="0 0 12 12" fill={(hover || value) >= star ? C.star : C.starEmpty} style={{ transition: "fill 0.1s ease" }}>
            <path d="M6 1l1.5 3 3.3.4-2.4 2.3.6 3.3L6 8.5l-3 1.5.6-3.3L1.2 4.4l3.3-.4z" />
          </svg>
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="ml-2 text-sm" style={{ color: C.primary, fontWeight: 700 }}>
          {labels[hover || value]}
        </span>
      )}
    </div>
  );
}

export function PropertyPage({ navigate, params = {}, user, favorites, onToggleFav, managedProperties = [] }: Props) {
  const managedProp = managedProperties.find((p) => p.id === params.propertyId);
  const property = PROPERTIES.find((p) => p.id === params.propertyId)
    || (managedProp ? managedToProperty(managedProp) : null)
    || PROPERTIES[0];
  const staticRooms = ROOMS.filter((r) => r.propertyId === property.id);
  const rooms = staticRooms.length > 0 ? staticRooms : (managedProp ? [managedToRoom(managedProp)] : []);
  const isFav = favorites.includes(property.id);

  const [currentImg, setCurrentImg] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState(params.checkIn || "");
  const [checkOut, setCheckOut] = useState(params.checkOut || "");
  const [guests, setGuests] = useState(2);
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "amenities" | "reviews">("overview");

  // ── Review states ──────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([
    { id: "rv1", name: "Marcos A.", date: "set. 2026", stars: 5, score: 9.5, text: "Hotel excelente! Vista incrível para o mar, atendimento impecável e café da manhã farto. Voltarei com certeza.", likes: 24, dislikes: 1, userVote: null },
    { id: "rv2", name: "Fernanda C.", date: "ago. 2026", stars: 4, score: 8.8, text: "Ótima localização, quarto confortável e limpo. Piscina um pouco lotada no fim de semana, mas nada que estrague a experiência.", likes: 18, dislikes: 2, userVote: null },
    { id: "rv3", name: "Ricardo B.", date: "jul. 2026", stars: 5, score: 9.2, text: "Perfeito para descansar. Estrutura impecável, equipe muito atenciosa. Recomendo o quarto deluxe com vista para o mar.", likes: 31, dislikes: 0, userVote: null },
  ]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // ── Ban states ─────────────────────────────────────────────────────────────
  const [banned, setBanned] = useState(() => {
    if (getIsPrototypeMode()) return false;
    try {
      const list = JSON.parse(localStorage.getItem("hospedaqui-banned") || "[]");
      return (list as string[]).includes(property.id);
    } catch { return false; }
  });

  const toggleBan = () => {
    setBanned((prev) => {
      const next = !prev;
      if (!getIsPrototypeMode()) try {
        const list: string[] = JSON.parse(localStorage.getItem("hospedaqui-banned") || "[]");
        const updated = next ? [...list, property.id] : list.filter((id) => id !== property.id);
        localStorage.setItem("hospedaqui-banned", JSON.stringify(updated));
      } catch {}
      return next;
    });
  };

  // ── Review handlers ────────────────────────────────────────────────────────
  const handleVote = (reviewId: string, vote: "like" | "dislike") => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const current = r.userVote;
        if (current === vote) {
          return {
            ...r,
            userVote: null,
            likes: vote === "like" ? r.likes - 1 : r.likes,
            dislikes: vote === "dislike" ? r.dislikes - 1 : r.dislikes,
          };
        }
        return {
          ...r,
          userVote: vote,
          likes: vote === "like" ? r.likes + 1 : current === "like" ? r.likes - 1 : r.likes,
          dislikes: vote === "dislike" ? r.dislikes + 1 : current === "dislike" ? r.dislikes - 1 : r.dislikes,
        };
      })
    );
  };

  const handleSubmitReview = async () => {
    if (!reviewStars || !reviewText.trim() || !user) return;
    const firstName = user.name?.split(" ")[0] || "Usuário";
    const lastInitial = user.name?.split(" ")[1]?.charAt(0) || "";
    const reviewerName = `${firstName} ${lastInitial}.`;
    const newReview: Review = {
      id: `rv_${Date.now()}`,
      name: reviewerName,
      date: new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
      stars: reviewStars,
      score: parseFloat((reviewStars * 2).toFixed(1)),
      text: reviewText,
      likes: 0,
      dislikes: 0,
      userVote: null,
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewFormOpen(false);
    setReviewStars(0);
    setReviewText("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
    // Persiste no Supabase quando configurado
    if (IS_CONFIGURED && user.id) {
      await propertyService.submitReview(
        property.id,
        user.id,
        reviewerName,
        parseFloat((reviewStars * 2).toFixed(1)),
        reviewText,
      );
    }
  };

  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 1;

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoom);
  const totalEstimate = selectedRoomObj ? selectedRoomObj.pricePerNight * nights : property.pricePerNight * nights;

  const handleReserve = () => {
    if (!user) { navigate("login"); return; }
    navigate("booking", { propertyId: property.id, roomId: selectedRoom, checkIn, checkOut, guests, nights });
  };

  const allAmenities = [
    { label: "Wi-Fi grátis", available: property.amenities.includes("Wi-Fi grátis") },
    { label: "Piscina", available: property.amenities.includes("Piscina") },
    { label: "Academia", available: property.amenities.includes("Academia") },
    { label: "Spa", available: property.amenities.includes("Spa") },
    { label: "Restaurante", available: property.amenities.includes("Restaurante") },
    { label: "Estacionamento", available: property.amenities.includes("Estacionamento") },
    { label: "Ar-condicionado", available: property.amenities.includes("Ar-condicionado") },
    { label: "Café da manhã", available: property.amenities.includes("Café da manhã") },
    { label: "Recepção 24h", available: property.amenities.includes("Recepção 24h") },
    { label: "Lavanderia", available: property.amenities.includes("Lavanderia") },
    { label: "Pet friendly", available: property.amenities.includes("Pet friendly") },
    { label: "Acessibilidade", available: property.amenities.includes("Acessibilidade") },
    { label: "Vista para o mar", available: property.amenities.includes("Vista para o mar") },
    { label: "Cozinha equipada", available: property.amenities.includes("Cozinha") },
  ];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs" style={{ color: C.textLight }}>
          <button onClick={() => navigate("home")} className="hover:underline" style={{ color: C.primary }}>Início</button>
          <span>/</span>
          <button onClick={() => navigate("search")} className="hover:underline" style={{ color: C.primary }}>Hospedagens</button>
          <span>/</span>
          <span style={{ color: C.textMid, fontWeight: 500 }}>{property.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge color="blue">{property.type}</Badge>
              <Stars n={property.stars} />
              {property.badge && <Badge color="coral">{property.badge}</Badge>}
              {banned && <Badge color="red">🚫 Banido</Badge>}
            </div>
            <h1 style={{ fontWeight: 800, fontSize: "clamp(1.3rem,3vw,1.8rem)", color: C.textDark }}>{property.name}</h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={14} style={{ color: C.textLight }} />
              <span className="text-sm" style={{ color: C.textMid }}>{property.location} — {property.city}, {property.state}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Favoritar */}
            <button
              onClick={() => onToggleFav(property.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors"
              style={{ borderColor: isFav ? C.coral : C.border, color: isFav ? C.coral : C.textMid, backgroundColor: isFav ? C.coralLight : C.card, fontWeight: 600 }}
            >
              <Heart size={15} fill={isFav ? C.coral : "none"} stroke={isFav ? C.coral : C.textMid} />
              {isFav ? "Salvo" : "Favoritar"}
            </button>
            {/* Banir */}
            <button
              onClick={toggleBan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors"
              style={{
                borderColor: banned ? C.error : C.border,
                color: banned ? C.error : C.textMid,
                backgroundColor: banned ? C.errorLight : C.card,
                fontWeight: 600,
              }}
              title={banned ? "Remover da lista de banidos" : "Banir esta hospedagem"}
            >
              <Ban size={15} />
              {banned ? "Banido" : "Banir"}
            </button>
            <ScoreBadge score={property.score} label={property.scoreLabel} />
          </div>
        </div>

        {/* Ban warning */}
        {banned && (
          <Alert type="error" className="mb-4">
            Esta hospedagem está na sua lista de banidos. Ela não aparecerá nos seus resultados de busca.{" "}
            <button onClick={toggleBan} style={{ fontWeight: 700, color: C.error, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Remover ban
            </button>
          </Alert>
        )}

        {/* ── GALLERY ── */}
        <div className="grid grid-cols-4 gap-2 mb-6 rounded-2xl overflow-hidden" style={{ height: 320 }}>
          <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => { setCurrentImg(0); setGalleryOpen(true); }}>
            <ImageWithFallback src={property.images[0]} alt={property.name} className="w-full h-full object-cover group-hover:brightness-90 transition-all" style={{ height: "100%" }} />
          </div>
          {property.images.slice(1, 4).map((img, i) => (
            <div key={i} className="relative cursor-pointer group" onClick={() => { setCurrentImg(i + 1); setGalleryOpen(true); }}>
              <ImageWithFallback src={img} alt={`${property.name} ${i + 2}`} className="w-full h-full object-cover group-hover:brightness-90 transition-all" style={{ height: "100%" }} />
              {i === 2 && property.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm" style={{ fontWeight: 700 }}>+{property.images.length - 4} fotos</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gallery modal */}
        {galleryOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
            <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/30" onClick={() => setGalleryOpen(false)}><X size={20} /></button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-white/20" onClick={(e) => { e.stopPropagation(); setCurrentImg((c) => (c - 1 + property.images.length) % property.images.length); }}>
              <ChevronLeft size={24} />
            </button>
            <img src={property.images[currentImg]} alt="" className="max-w-full max-h-full rounded-xl" style={{ maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-white/20" onClick={(e) => { e.stopPropagation(); setCurrentImg((c) => (c + 1) % property.images.length); }}>
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{currentImg + 1} / {property.images.length}</div>
          </div>
        )}

        {/* ── CONTENT + BOOKING PANEL ── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left — details */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 border-b mb-5 overflow-x-auto" style={{ borderColor: C.border }}>
              {(["overview", "rooms", "amenities", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2.5 text-sm whitespace-nowrap transition-colors"
                  style={{ fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? C.primary : C.textMid, borderBottom: activeTab === tab ? `2px solid ${C.primary}` : "2px solid transparent" }}
                >
                  {{ overview: "Visão geral", rooms: "Quartos", amenities: "Comodidades", reviews: `Avaliações (${reviews.length})` }[tab]}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-5">
                <Card>
                  <h3 className="mb-2" style={{ fontWeight: 700, color: C.textDark, fontSize: 15 }}>Sobre a hospedagem</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textMid }}>{property.description}</p>
                </Card>
                <Card>
                  <h3 className="mb-3" style={{ fontWeight: 700, color: C.textDark, fontSize: 15 }}>Informações essenciais</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Clock size={15} style={{ color: C.primary }} /><div><div style={{ fontWeight: 600, color: C.textDark }}>Check-in</div><div style={{ color: C.textMid }}>A partir das {property.checkIn}</div></div></div>
                    <div className="flex items-center gap-2"><Clock size={15} style={{ color: C.primary }} /><div><div style={{ fontWeight: 600, color: C.textDark }}>Check-out</div><div style={{ color: C.textMid }}>Até as {property.checkOut}</div></div></div>
                    <div className="flex items-start gap-2 col-span-2"><CheckCircle size={15} style={{ color: C.teal, marginTop: 2 }} /><div><div style={{ fontWeight: 600, color: C.textDark }}>Cancelamento</div><div style={{ color: C.textMid }}>{property.cancellation}</div></div></div>
                    <div className="flex items-start gap-2 col-span-2"><CheckCircle size={15} style={{ color: C.teal, marginTop: 2 }} /><div><div style={{ fontWeight: 600, color: C.textDark }}>Pagamento</div><div style={{ color: C.textMid }}>{property.policies}</div></div></div>
                  </div>
                </Card>
                <Card>
                  <h3 className="mb-3" style={{ fontWeight: 700, color: C.textDark, fontSize: 15 }}>Principais comodidades</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.slice(0, 9).map((a: string) => (
                      <div key={a} className="flex items-center gap-2 text-sm"><span style={{ color: C.teal }}>✓</span><span style={{ color: C.textMid }}>{a}</span></div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 className="mb-3" style={{ fontWeight: 700, color: C.textDark, fontSize: 15 }}>Localização</h3>
                  <div className="rounded-xl flex items-center justify-center" style={{ height: 180, backgroundColor: "var(--c-grayBg)" }}>
                    <div className="text-center p-4">
                      <MapPin size={32} style={{ color: C.primary, margin: "0 auto 8px" }} />
                      <p className="text-sm" style={{ color: C.textMid, fontWeight: 500 }}>{property.location}</p>
                      <p className="text-xs mt-1" style={{ color: C.textLight }}>{property.city}, {property.state}</p>
                      <button className="mt-3 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: C.primary, color: "white", fontWeight: 600 }}>Ver no mapa</button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="space-y-4">
                {rooms.length === 0 && <Alert type="info">Nenhum quarto cadastrado para esta hospedagem neste protótipo.</Alert>}
                {rooms.map((room) => (
                  <div key={room.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: room.id === selectedRoom ? C.primary : C.border, borderWidth: room.id === selectedRoom ? 2 : 1 }}>
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 shrink-0" style={{ height: 140 }}>
                        <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 style={{ fontWeight: 700, color: C.textDark, fontSize: 14 }}>{room.name}</h4>
                            {!room.available && <Badge color="red">Indisponível</Badge>}
                            {room.cancellable && <Badge color="green">Cancelamento grátis</Badge>}
                          </div>
                          <p className="text-xs mb-2" style={{ color: C.textMid }}>👥 {room.capacity} hóspedes · 🛏 {room.beds} · 📐 {room.size}m²</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((a) => <span key={a} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: C.bg, color: C.textMid }}>{a}</span>)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>R$ {room.pricePerNight}</span>
                            <span className="text-xs ml-1" style={{ color: C.textLight }}>/noite</span>
                          </div>
                          <button
                            disabled={!room.available}
                            onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
                            className="px-4 py-2 rounded-xl text-sm transition-colors"
                            style={{ backgroundColor: !room.available ? C.bg : room.id === selectedRoom ? C.teal : C.primary, color: !room.available ? C.textLight : "white", fontWeight: 600, cursor: !room.available ? "not-allowed" : "pointer" }}
                          >
                            {!room.available ? "Indisponível" : room.id === selectedRoom ? "✓ Selecionado" : "Selecionar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "amenities" && (
              <Card>
                <h3 className="mb-4" style={{ fontWeight: 700, color: C.textDark, fontSize: 15 }}>Todas as comodidades</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allAmenities.map((a) => (
                    <div key={a.label} className="flex items-center gap-2 text-sm">
                      {a.available ? <CheckCircle size={14} style={{ color: C.teal }} /> : <XCircle size={14} style={{ color: C.textLight }} />}
                      <span style={{ color: a.available ? C.textMid : C.textLight, textDecoration: a.available ? "none" : "line-through" }}>{a.label}</span>
                    </div>
                  ))}
                </div>
                <Alert type="info" className="mt-4">Comodidades sujeitas a verificação. Dados demonstrativos do protótipo.</Alert>
              </Card>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === "reviews" && (
              <div className="space-y-4">

                {/* Score summary */}
                <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ backgroundColor: C.primaryLight }}>
                  <div className="text-center shrink-0">
                    <div style={{ fontWeight: 900, fontSize: 36, color: C.primary }}>{property.score.toFixed(1)}</div>
                    <Stars n={Math.round(property.score / 2)} />
                    <div className="text-xs mt-1" style={{ color: C.textMid }}>{property.reviews.toLocaleString("pt-BR")} avaliações</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[["Limpeza", "9.4"], ["Localização", "9.6"], ["Atendimento", "9.1"], ["Custo-benefício", "8.8"]].map(([l, v]) => (
                      <div key={l} className="flex items-center gap-2">
                        <span className="text-xs w-28" style={{ color: C.textMid }}>{l}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: C.border }}>
                          <div className="h-full rounded-full" style={{ width: `${(+v / 10) * 100}%`, backgroundColor: C.primary }} />
                        </div>
                        <span className="text-xs w-6" style={{ fontWeight: 700, color: C.textDark }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review submitted success */}
                {reviewSubmitted && (
                  <Alert type="success">✓ Sua avaliação foi publicada com sucesso!</Alert>
                )}

                {/* Write review CTA */}
                {user && !reviewFormOpen && !reviewSubmitted && (
                  <button
                    onClick={() => setReviewFormOpen(true)}
                    className="w-full py-3 rounded-2xl text-sm transition-all"
                    style={{ border: `2px dashed ${C.primary}`, color: C.primary, fontWeight: 600, backgroundColor: "transparent" }}
                  >
                    ✏️ Escrever minha avaliação
                  </button>
                )}

                {/* Not logged in prompt */}
                {!user && (
                  <Alert type="info">
                    <span>
                      <button onClick={() => navigate("login")} style={{ color: C.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                        Entre na sua conta
                      </button>{" "}
                      para avaliar esta hospedagem.
                    </span>
                  </Alert>
                )}

                {/* Review form */}
                {reviewFormOpen && (
                  <Card>
                    <h4 className="mb-4" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Sua avaliação</h4>

                    <div className="mb-4">
                      <p className="text-xs mb-2" style={{ color: C.textLight, fontWeight: 600, letterSpacing: 0.5 }}>NOTA (1 A 5 ESTRELAS) *</p>
                      <StarRating value={reviewStars} onChange={setReviewStars} />
                    </div>

                    <div className="mb-4">
                      <label className="text-xs block mb-1.5" style={{ color: C.textLight, fontWeight: 600, letterSpacing: 0.5 }}>DESCRIÇÃO *</label>
                      <textarea
                        rows={4}
                        placeholder="Conte sua experiência: atendimento, limpeza, localização, café da manhã..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full rounded-xl text-sm outline-none resize-none"
                        style={{
                          padding: "10px 12px",
                          border: `1.5px solid ${C.border}`,
                          backgroundColor: C.card,
                          color: C.textDark,
                          fontFamily: "inherit",
                          fontWeight: 400,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = C.primary; }}
                        onBlur={(e) => { e.target.style.borderColor = C.border; }}
                      />
                      <p className="text-xs mt-1" style={{ color: C.textLight }}>{reviewText.length}/500 caracteres</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitReview}
                        disabled={!reviewStars || !reviewText.trim()}
                        className="flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: reviewStars && reviewText.trim() ? C.primary : C.border,
                          color: reviewStars && reviewText.trim() ? "white" : C.textLight,
                          fontWeight: 700,
                          cursor: reviewStars && reviewText.trim() ? "pointer" : "not-allowed",
                        }}
                      >
                        <Send size={14} /> Publicar avaliação
                      </button>
                      <button
                        onClick={() => { setReviewFormOpen(false); setReviewStars(0); setReviewText(""); }}
                        className="px-4 py-2.5 rounded-xl text-sm border"
                        style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </Card>
                )}

                {/* Reviews list */}
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: C.primary, fontWeight: 700 }}>
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: C.textDark }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.textLight }}>{r.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Star display */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} width="13" height="13" viewBox="0 0 12 12" fill={s <= r.stars ? C.star : C.starEmpty}>
                              <path d="M6 1l1.5 3 3.3.4-2.4 2.3.6 3.3L6 8.5l-3 1.5.6-3.3L1.2 4.4l3.3-.4z" />
                            </svg>
                          ))}
                        </div>
                        <div className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>{r.score}</div>
                      </div>
                    </div>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: C.textMid }}>{r.text}</p>
                    {/* Like / Dislike */}
                    <div className="flex items-center gap-3 pt-2.5 border-t" style={{ borderColor: C.border }}>
                      <span className="text-xs" style={{ color: C.textLight }}>Foi útil?</span>
                      <button
                        onClick={() => handleVote(r.id, "like")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          backgroundColor: r.userVote === "like" ? C.successLight : C.bg,
                          color: r.userVote === "like" ? C.success : C.textMid,
                          border: `1px solid ${r.userVote === "like" ? C.success : C.border}`,
                          fontWeight: 600,
                        }}
                      >
                        <ThumbsUp size={12} /> {r.likes}
                      </button>
                      <button
                        onClick={() => handleVote(r.id, "dislike")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                        style={{
                          backgroundColor: r.userVote === "dislike" ? C.errorLight : C.bg,
                          color: r.userVote === "dislike" ? C.error : C.textMid,
                          border: `1px solid ${r.userVote === "dislike" ? C.error : C.border}`,
                          fontWeight: 600,
                        }}
                      >
                        <ThumbsDown size={12} /> {r.dislikes}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* ── BOOKING PANEL ── */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-20">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span style={{ fontWeight: 900, fontSize: 24, color: C.primary }}>R$ {selectedRoomObj?.pricePerNight || property.pricePerNight}</span>
                    <span className="text-sm ml-1" style={{ color: C.textLight }}>/noite</span>
                  </div>
                  <ScoreBadge score={property.score} label={`${property.reviews} avaliações`} />
                </div>

                <div className="space-y-2 mb-3">
                  <div className="rounded-xl border" style={{ borderColor: C.border }}>
                    <div className="grid grid-cols-2 divide-x" style={{ "--tw-divide-color": C.border } as CSSProperties}>
                      <div className="p-2.5">
                        <label className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>ENTRADA</label>
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full outline-none text-sm bg-transparent mt-0.5" style={{ color: C.textDark, fontWeight: 600 }} />
                      </div>
                      <div className="p-2.5">
                        <label className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>SAÍDA</label>
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full outline-none text-sm bg-transparent mt-0.5" style={{ color: C.textDark, fontWeight: 600 }} />
                      </div>
                    </div>
                    <div className="border-t p-2.5" style={{ borderColor: C.border }}>
                      <label className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>HÓSPEDES</label>
                      <div className="flex items-center gap-3 mt-1">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: C.border, color: C.textDark }}>−</button>
                        <span className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>{guests} hóspede{guests > 1 ? "s" : ""}</span>
                        <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-7 h-7 rounded-full border flex items-center justify-center text-sm" style={{ borderColor: C.border, color: C.textDark }}>+</button>
                      </div>
                    </div>
                  </div>

                  {checkIn && checkOut && nights > 0 && (
                    <div className="text-xs p-3 rounded-xl space-y-1" style={{ backgroundColor: C.bg }}>
                      <div className="flex justify-between" style={{ color: C.textMid }}>
                        <span>R$ {selectedRoomObj?.pricePerNight || property.pricePerNight} × {nights} noite{nights > 1 ? "s" : ""}</span>
                        <span>R$ {((selectedRoomObj?.pricePerNight || property.pricePerNight) * nights).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between" style={{ color: C.textMid }}>
                        <span>Taxas e impostos (est.)</span>
                        <span>R$ {Math.round(totalEstimate * 0.12).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1" style={{ borderColor: C.border, color: C.textDark, fontWeight: 700 }}>
                        <span>Total estimado</span>
                        <span>R$ {Math.round(totalEstimate * 1.12).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleReserve} className="w-full py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: C.coral, color: "white", fontWeight: 700 }}>
                  {user ? "Reservar agora" : "Entrar para reservar"}
                </button>
                <p className="text-center text-xs mt-2" style={{ color: C.textLight }}>Sem cobrança agora · Cancele grátis</p>

                <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}><CheckCircle size={13} style={{ color: C.teal }} /> Cancelamento gratuito disponível</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}><CheckCircle size={13} style={{ color: C.teal }} /> Sem taxas de serviço ocultas</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}><CheckCircle size={13} style={{ color: C.teal }} /> Suporte 24h em português</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
