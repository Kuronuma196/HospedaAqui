import { useState, useEffect } from "react";
import { Car, Plus, Edit3, Trash2, Star, Users, MapPin, CheckCircle, XCircle, Clock, CreditCard, FileText, ChevronRight, Award, TrendingUp, AlertCircle } from "lucide-react";
import { C, Card, Alert, Input, Badge, Tabs, Spinner, ImageWithFallback } from "./ds";
import { CAR_CATEGORIES } from "./data";
import { carService, taxiService, driverReviewService, guestReviewService, driverService } from "./services/api";
import { ImageUploader } from "./image-uploader";

type Props = {
  navigate: (p: string, params?: any) => void;
  user: any;
  driverProfile: any;
  onUpdateDriverProfile?: (updates: any) => void;
};

const FEATURES_OPTIONS = ["Ar-condicionado", "Wi-Fi", "Carregador USB", "Água mineral", "Porta-malas amplo", "Cadeirinha infantil", "Aceita pets", "Mapa GPS"];
const CATEGORY_OPTIONS = ["economy", "comfort", "suv", "van", "luxury"];

// ── Car Form Modal ────────────────────────────────────────────────────────────
function CarFormModal({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (data: any) => void; initial?: any }) {
  const [brand, setBrand] = useState(initial?.brand || "");
  const [model, setModel] = useState(initial?.model || "");
  const [year, setYear] = useState(initial?.year?.toString() || "");
  const [plate, setPlate] = useState(initial?.plate || "");
  const [color, setColor] = useState(initial?.color || "");
  const [category, setCategory] = useState(initial?.category || "economy");
  const [capacity, setCapacity] = useState(initial?.capacity?.toString() || "4");
  const [pricePerKm, setPricePerKm] = useState(initial?.pricePerKm?.toString() || "2.50");
  const [minFare, setMinFare] = useState(initial?.minFare?.toString() || "15.00");
  const [features, setFeatures] = useState<string[]>(initial?.features || []);
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const toggleFeature = (f: string) => setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const handleSave = async () => {
    if (!brand || !model || !year || !plate || !color) { setErr("Preencha todos os campos obrigatórios."); return; }
    if (images.length === 0) { setErr("Adicione pelo menos uma foto do veículo."); return; }
    setSaving(true);
    await onSave({ brand, model, year: parseInt(year), plate, color, category, capacity: parseInt(capacity), pricePerKm: parseFloat(pricePerKm), minFare: parseFloat(minFare), features, images });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ backgroundColor: C.card }}>
        <h3 className="mb-4" style={{ fontWeight: 800, fontSize: 17, color: C.textDark }}>
          {initial ? "Editar veículo" : "Cadastrar novo veículo"}
        </h3>
        {err && <Alert type="error" className="mb-3">{err}</Alert>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca *" placeholder="Toyota, Hyundai..." value={brand} onChange={setBrand} />
            <Input label="Modelo *" placeholder="Corolla, HB20..." value={model} onChange={setModel} />
            <Input label="Ano *" placeholder="2023" value={year} onChange={setYear} type="number" />
            <Input label="Placa *" placeholder="ABC-1234" value={plate} onChange={setPlate} />
            <Input label="Cor *" placeholder="Prata, Branco..." value={color} onChange={setColor} />
            <div>
              <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm"
                style={{ borderColor: C.border, color: C.textDark }}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CAR_CATEGORIES[c]?.label}</option>)}
              </select>
            </div>
            <Input label="Capacidade (passageiros)" placeholder="4" value={capacity} onChange={setCapacity} type="number" />
            <div>
              <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Preço por km (R$)</label>
              <input type="number" step="0.10" value={pricePerKm} onChange={(e) => setPricePerKm(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm"
                style={{ borderColor: C.border, color: C.textDark }} />
            </div>
          </div>
          <Input label="Tarifa mínima (R$)" placeholder="15.00" value={minFare} onChange={setMinFare} type="number" />

          {/* Image upload */}
          <ImageUploader
            images={images}
            onChange={setImages}
            folder="cars"
            maxImages={4}
            required
            label="Fotos do veículo"
          />

          <div>
            <label className="text-sm block mb-2" style={{ fontWeight: 600, color: C.textDark }}>Comodidades</label>
            <div className="flex flex-wrap gap-2">
              {FEATURES_OPTIONS.map((f) => (
                <button key={f} onClick={() => toggleFeature(f)}
                  className="px-3 py-1.5 rounded-xl text-xs border transition-colors"
                  style={{
                    borderColor: features.includes(f) ? C.primary : C.border,
                    backgroundColor: features.includes(f) ? `${C.primary}15` : "transparent",
                    color: features.includes(f) ? C.primary : C.textMid,
                    fontWeight: features.includes(f) ? 700 : 400,
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
            {saving ? <><Spinner size={14} /> Salvando...</> : "Salvar veículo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── StarRow ───────────────────────────────────────────────────────────────────
function StarRow({ stars, size = 14 }: { stars: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= stars ? C.coral : "none"} stroke={i <= stars ? C.coral : C.border} />
      ))}
    </div>
  );
}

// ── Review Modal (motorista avalia hóspede) ───────────────────────────────────
function ReviewGuestModal({ open, booking, driverProfile, onClose, onSubmit }: any) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!stars) return;
    setSaving(true);
    await onSubmit(booking, stars, text);
    setSaving(false);
    onClose();
  };

  if (!open || !booking) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: C.card }}>
        <h3 className="mb-1" style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>Avaliar hóspede</h3>
        <p className="text-sm mb-4" style={{ color: C.textMid }}>Corrida {booking.code} · {booking.guestName}</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setStars(i)}>
              <Star size={28} fill={i <= stars ? C.coral : "none"} stroke={i <= stars ? C.coral : C.border} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          placeholder="Comentário (opcional)..."
          className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm resize-none"
          style={{ borderColor: C.border, color: C.textDark }} />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!stars || saving} className="flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: stars ? C.primary : C.border, color: "white", fontWeight: 700 }}>
            {saving ? <><Spinner size={14} />Enviando...</> : "Enviar avaliação"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Driver Dashboard ─────────────────────────────────────────────────────
export function DriverPage({ navigate, user, driverProfile, onUpdateDriverProfile }: Props) {
  const [activeTab, setActiveTab] = useState("fleet");
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [guestReviews, setGuestReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carModal, setCarModal] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [reviewModal, setReviewModal] = useState<{ open: boolean; booking?: any }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bio, setBio] = useState(driverProfile?.bio || "");
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);
  const [bioError, setBioError] = useState("");

  useEffect(() => {
    if (!driverProfile) return;
    (async () => {
      setLoading(true);
      const [carsRes, bookingsRes, reviewsRes, guestRevRes] = await Promise.all([
        carService.listByDriver(driverProfile.id),
        taxiService.getByDriver(driverProfile.id),
        driverReviewService.getByDriver(driverProfile.id),
        guestReviewService.getByDriver(driverProfile.id),
      ]);
      if (carsRes.data) setCars(carsRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (guestRevRes.data) setGuestReviews(guestRevRes.data);
      setLoading(false);
    })();
  }, [driverProfile]);

  const handleCreateCar = async (data: any) => {
    const { data: created } = await carService.create(driverProfile.id, data);
    if (created) setCars((prev) => [created, ...prev]);
  };

  const handleEditCar = async (data: any) => {
    if (!carModal.editing) return;
    const { error } = await carService.update(carModal.editing.id, driverProfile.id, data);
    if (!error) setCars((prev) => prev.map((c) => c.id === carModal.editing!.id ? { ...c, ...data } : c));
  };

  const handleDeleteCar = async (carId: string) => {
    await carService.delete(carId);
    setCars((prev) => prev.filter((c) => c.id !== carId));
    setDeleteConfirm(null);
  };

  const handleReviewGuest = async (booking: any, stars: number, text: string) => {
    await guestReviewService.create({
      taxiBookingId: booking.id,
      reviewerId: driverProfile.id,
      guestId: booking.guestId,
      stars, text,
    });
    setGuestReviews((prev) => [
      { id: `gr_${Date.now()}`, taxiBookingId: booking.id, driverName: user.name, guestId: booking.guestId, stars, text, createdAt: new Date().toLocaleDateString("pt-BR") },
      ...prev,
    ]);
  };

  const handleSaveBio = async () => {
    setBioSaving(true);
    setBioError("");
    try {
      const { error } = await driverService.update(driverProfile.id, { bio });
      if (error) {
        setBioError("Não foi possível salvar a bio. Verifique sua conexão e tente novamente.");
        return;
      }
      onUpdateDriverProfile?.({ bio });
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 3000);
    } catch {
      setBioError("Ocorreu um erro ao salvar a bio. Tente novamente.");
    } finally {
      setBioSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending_payment: C.warning, confirmed: C.teal, in_progress: C.warning, completed: C.success, cancelled: C.error,
  };
  const statusLabels: Record<string, string> = {
    pending_payment: "Pagamento pendente", confirmed: "Confirmada", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada",
  };

  const tabs = [
    { id: "fleet", label: "🚗 Minha Frota" },
    { id: "rides", label: "📍 Corridas" },
    { id: "reviews", label: "⭐ Avaliações" },
    { id: "profile", label: "👤 Perfil" },
  ];

  if (!driverProfile) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: "100vh" }} className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🚗</div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: C.textDark }}>Perfil de motorista não encontrado</h2>
          <p className="text-sm mt-2" style={{ color: C.textMid }}>Cadastre-se como motorista para acessar este painel.</p>
          <button onClick={() => navigate("register")} className="mt-4 px-6 py-3 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Cadastrar como motorista</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4" style={{ backgroundColor: C.primary }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-white shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.2)", fontWeight: 900 }}>
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 style={{ fontWeight: 800, fontSize: 20, color: "white" }}>{user.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}>Motorista</span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>{user.email}</p>
            <div className="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start">
              <div className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                <Star size={14} fill={C.coral} stroke={C.coral} />
                <span style={{ fontWeight: 700 }}>{driverProfile.rating > 0 ? driverProfile.rating.toFixed(1) : "Novo"}</span>
                {driverProfile.totalRatings > 0 && <span style={{ color: "rgba(255,255,255,0.6)" }}>({driverProfile.totalRatings})</span>}
              </div>
              <div className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                <Car size={14} />
                <span>{cars.length} veículo{cars.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                <TrendingUp size={14} />
                <span>{driverProfile.totalTrips} corridas</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size={28} />
          </div>
        ) : (
          <div className="mt-6">

            {/* ── FROTA ── */}
            {activeTab === "fleet" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Meus veículos ({cars.length})</h3>
                  <button onClick={() => setCarModal({ open: true })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                    <Plus size={15} /> Adicionar veículo
                  </button>
                </div>

                {cars.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                    <Car size={40} className="mx-auto mb-3" style={{ color: C.textLight }} />
                    <h3 style={{ fontWeight: 700, color: C.textDark }}>Nenhum veículo cadastrado</h3>
                    <p className="text-sm mt-1 mb-4" style={{ color: C.textLight }}>Adicione seu veículo para começar a receber corridas.</p>
                    <button onClick={() => setCarModal({ open: true })} className="px-6 py-2.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                      Cadastrar veículo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cars.map((car) => (
                      <Card key={car.id}>
                        <div className="flex gap-4">
                          {car.images?.[0] ? (
                            <ImageWithFallback src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-28 h-20 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-28 h-20 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.bg }}>
                              <Car size={28} style={{ color: C.textLight }} />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: 14, color: C.textDark }}>{car.brand} {car.model} {car.year}</h4>
                                <p className="text-xs mt-0.5" style={{ color: C.textLight }}>{car.plate} · {car.color} · {CAR_CATEGORIES[car.category]?.label}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setCarModal({ open: true, editing: car })} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: C.teal }}>
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={() => setDeleteConfirm(car.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: C.error }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {car.features.slice(0, 4).map((f: string) => (
                                <span key={f} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${C.teal}15`, color: C.teal, fontWeight: 600 }}>{f}</span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm" style={{ color: C.primary, fontWeight: 700 }}>R$ {car.pricePerKm.toFixed(2)}/km</span>
                              <span className="text-xs" style={{ color: C.textLight }}>Mínimo R$ {car.minFare.toFixed(2)}</span>
                              <span className="text-xs" style={{ color: C.textLight }}>{car.capacity} passageiros</span>
                            </div>
                          </div>
                        </div>
                        {/* Delete confirm */}
                        {deleteConfirm === car.id && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-3" style={{ borderColor: C.border }}>
                            <AlertCircle size={15} style={{ color: C.error }} />
                            <span className="text-sm flex-1" style={{ color: C.textMid }}>Confirmar exclusão deste veículo?</span>
                            <button onClick={() => setDeleteConfirm(null)} className="text-sm px-3 py-1 rounded-lg" style={{ color: C.textMid }}>Não</button>
                            <button onClick={() => handleDeleteCar(car.id)} className="text-sm px-3 py-1 rounded-lg" style={{ backgroundColor: C.error, color: "white", fontWeight: 700 }}>Excluir</button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CORRIDAS ── */}
            {activeTab === "rides" && (
              <div>
                <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Minhas corridas ({bookings.length})</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                    <MapPin size={36} className="mx-auto mb-3" style={{ color: C.textLight }} />
                    <h3 style={{ fontWeight: 700, color: C.textDark }}>Nenhuma corrida ainda</h3>
                    <p className="text-sm mt-1" style={{ color: C.textLight }}>Quando hóspedes agendarem com você, as corridas aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => {
                      const alreadyReviewed = guestReviews.some((gr) => gr.taxiBookingId === b.id);
                      return (
                        <Card key={b.id}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>#{b.code}</p>
                              <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{b.guestName}</p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColors[b.status]}20`, color: statusColors[b.status], fontWeight: 700 }}>
                              {statusLabels[b.status]}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.success }} />
                              <span>{b.origin}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                              <span>{b.destination}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
                            <span className="text-xs" style={{ color: C.textLight }}>{b.scheduledDate} às {b.scheduledTime}</span>
                            <span className="text-xs" style={{ color: C.textLight }}>{b.passengers} pax</span>
                            <span className="ml-auto" style={{ fontWeight: 700, color: C.success }}>R$ {b.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          {b.status === "completed" && !alreadyReviewed && (
                            <button
                              onClick={() => setReviewModal({ open: true, booking: b })}
                              className="w-full mt-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border"
                              style={{ borderColor: C.coral, color: C.coral, fontWeight: 700 }}>
                              <Star size={13} /> Avaliar hóspede
                            </button>
                          )}
                          {alreadyReviewed && (
                            <p className="text-xs text-center mt-3" style={{ color: C.success }}><CheckCircle size={12} className="inline mr-1" />Hóspede avaliado</p>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── AVALIAÇÕES ── */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Reviews received (by guests) */}
                <div>
                  <h3 className="mb-3" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>
                    Avaliações que recebi ({reviews.length})
                  </h3>
                  {reviews.length === 0 ? (
                    <Card>
                      <div className="text-center py-6">
                        <Star size={28} className="mx-auto mb-2" style={{ color: C.textLight }} />
                        <p className="text-sm" style={{ color: C.textLight }}>Nenhuma avaliação ainda. Conclua corridas para receber avaliações.</p>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <Card key={r.id}>
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{r.reviewerName || "Hóspede"}</p>
                            <StarRow stars={r.stars} />
                          </div>
                          {r.text && <p className="text-sm" style={{ color: C.textMid }}>{r.text}</p>}
                          <p className="text-xs mt-1" style={{ color: C.textLight }}>{r.createdAt || new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews given (to guests) */}
                <div>
                  <h3 className="mb-3" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>
                    Avaliações que fiz ({guestReviews.length})
                  </h3>
                  {guestReviews.length === 0 ? (
                    <Card>
                      <div className="text-center py-6">
                        <p className="text-sm" style={{ color: C.textLight }}>Você ainda não avaliou nenhum hóspede.</p>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {guestReviews.map((r) => (
                        <Card key={r.id}>
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>Para hóspede da corrida {r.taxiBookingId?.slice(-6)}</p>
                            <StarRow stars={r.stars} />
                          </div>
                          {r.text && <p className="text-sm" style={{ color: C.textMid }}>{r.text}</p>}
                          <p className="text-xs mt-1" style={{ color: C.textLight }}>{r.createdAt}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PERFIL ── */}
            {activeTab === "profile" && (
              <Card>
                <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Dados profissionais</h3>
                {bioSaved && <Alert type="success" className="mb-3">Bio atualizada com sucesso!</Alert>}
                {bioError && <Alert type="error" className="mb-3">{bioError}</Alert>}
                <div className="space-y-3">
                  {[
                    ["CPF", driverProfile.cpf],
                    ["CNPJ", driverProfile.cnpj || "Não informado"],
                    ["Chave PIX", driverProfile.pixKey],
                    ["Nº CNH", driverProfile.licenseNumber],
                    ["Validade CNH", driverProfile.licenseExpiry],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                      <span className="text-xs" style={{ color: C.textLight }}>{label}</span>
                      <span className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>{value}</span>
                    </div>
                  ))}
                  <div>
                    <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Bio (visível para hóspedes)</label>
                    <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você como motorista..."
                      className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm resize-none"
                      style={{ borderColor: C.border, color: C.textDark }} />
                  </div>
                  <button onClick={handleSaveBio} disabled={bioSaving}
                    className="px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"
                    style={{ backgroundColor: C.teal, color: "white", fontWeight: 700 }}>
                    {bioSaving ? <><Spinner size={14} /> Salvando...</> : "Salvar bio"}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CarFormModal
        key={carModal.editing?.id ?? "new"}
        open={carModal.open}
        onClose={() => setCarModal({ open: false })}
        onSave={carModal.editing ? handleEditCar : handleCreateCar}
        initial={carModal.editing}
      />
      <ReviewGuestModal
        open={reviewModal.open}
        booking={reviewModal.booking}
        driverProfile={driverProfile}
        onClose={() => setReviewModal({ open: false })}
        onSubmit={handleReviewGuest}
      />
    </div>
  );
}
