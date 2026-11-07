import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Car, CheckCircle, ChevronRight, CreditCard, Grid3X3, MapPin, Star } from "lucide-react";
import { Alert, Card, C, ImageWithFallback, Input, Spinner } from "./ds";
import { CAR_CATEGORIES } from "./data";
import { driverService, carService, taxiService, driverReviewService } from "./services/api";
import { getIsPrototypeMode, IS_CONFIGURED } from "./services/client";

type Props = {
  navigate: (p: string, params?: any) => void;
  user: any;
  onAddTaxiBooking: (booking: any) => void;
  onUpdateTaxiBooking: (id: string, updates: any) => Promise<{ error: string | null }>;
  taxiBookings?: any[];
};

function taxiDateToInput(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function taxiFormatDue(value?: string) {
  return value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "48 horas após o registro";
}

function TaxiBookingCard({ booking, onUpdate }: { booking: any; onUpdate: Props["onUpdateTaxiBooking"] }) {
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState(booking.origin || "");
  const [destination, setDestination] = useState(booking.destination || "");
  const [scheduledDate, setScheduledDate] = useState(taxiDateToInput(booking.scheduledDateISO || booking.scheduledDate));
  const [scheduledTime, setScheduledTime] = useState(booking.scheduledTime || "");
  const [passengers, setPassengers] = useState(Number(booking.passengers || 1));
  const [notes, setNotes] = useState(booking.notes || "");
  const isRealMode = IS_CONFIGURED && !getIsPrototypeMode();
  const canManage = isRealMode
    ? booking.status === "pending_payment" && booking.paymentStatus === "pending"
    : ["pending_payment", "confirmed"].includes(booking.status);

  const save = async () => {
    setError("");
    if (!origin.trim() || !destination.trim() || !scheduledDate || !scheduledTime || passengers < 1 || passengers > 8) {
      setError("Preencha origem, destino, data, horário e número válido de passageiros.");
      return;
    }
    setSaving(true);
    const result = await onUpdate(booking.id, { origin: origin.trim(), destination: destination.trim(), scheduledDate, scheduledTime, passengers, notes });
    setSaving(false);
    if (result.error) setError(result.error);
    else setEditing(false);
  };

  const cancel = async () => {
    setSaving(true);
    const result = await onUpdate(booking.id, { status: "cancelled", cancellationReason: "Solicitado pelo passageiro" });
    setSaving(false);
    if (result.error) setError(result.error);
    else setConfirmCancel(false);
  };

  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-3">
        <div className="text-xl">🚗</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ fontWeight: 700, color: C.textDark }}>{booking.origin} → {booking.destination}</p>
          <p className="text-xs" style={{ color: C.textLight }}>{booking.scheduledDate} · {booking.scheduledTime} · {booking.driverName}</p>
          {booking.status === "pending_payment" && <p className="text-xs mt-1" style={{ color: C.warning }}>Pedido salvo; pagamento pendente até {taxiFormatDue(booking.paymentDueAt)}. Sem cobrança; cancelamento automático ao vencer.</p>}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{
          backgroundColor: booking.status === "pending_payment" ? `${C.warning}20` : booking.status === "confirmed" ? `${C.teal}20` : booking.status === "completed" ? `${C.success}20` : `${C.error}20`,
          color: booking.status === "pending_payment" ? C.warning : booking.status === "confirmed" ? C.teal : booking.status === "completed" ? C.success : C.error,
          fontWeight: 700,
        }}>
          {booking.status === "pending_payment" ? "Pagamento pendente" : booking.status === "confirmed" ? "Confirmada" : booking.status === "completed" ? "Concluída" : "Cancelada"}
        </span>
      </div>
      {canManage && !editing && !confirmCancel && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => { setError(""); setEditing(true); }} className="flex-1 py-2 rounded-lg border text-xs" style={{ borderColor: C.primary, color: C.primary, fontWeight: 700 }}>Editar pedido</button>
          <button onClick={() => { setError(""); setConfirmCancel(true); }} className="flex-1 py-2 rounded-lg border text-xs" style={{ borderColor: C.error, color: C.error, fontWeight: 700 }}>Cancelar pedido</button>
        </div>
      )}
      {editing && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} maxLength={160} placeholder="Origem" className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: C.border }} />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} maxLength={160} placeholder="Destino" className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: C.border }} />
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: C.border }} />
            <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: C.border }} />
            <input type="number" min={1} max={8} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} aria-label="Passageiros" className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: C.border }} />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Observações" className="rounded-lg px-3 py-2 border text-xs" style={{ borderColor: C.border }} />
          </div>
          <p className="text-xs" style={{ color: C.textLight }}>{isRealMode ? "A edição renova o prazo de 48 horas. A tarifa permanece estimada; alterar a rota não recalcula a distância automaticamente." : "Na demonstração, as alterações ficam apenas em memória e nenhum pagamento real ocorre."}</p>
          {error && <Alert type="error">{error}</Alert>}
          <div className="flex gap-2">
            <button disabled={saving} onClick={save} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>{saving ? "Salvando..." : "Salvar alterações"}</button>
            <button disabled={saving} onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border text-xs" style={{ borderColor: C.border, color: C.textMid }}>Voltar</button>
          </div>
        </div>
      )}
      {confirmCancel && (
        <div className="mt-3 rounded-lg p-3" style={{ backgroundColor: C.errorLight }}>
          <p className="text-xs mb-2" style={{ color: C.error, fontWeight: 700 }}>Cancelar este pedido pendente?</p>
          {error && <Alert type="error">{error}</Alert>}
          <div className="flex gap-2">
            <button disabled={saving} onClick={cancel} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: C.error, color: "white", fontWeight: 700 }}>{saving ? "Cancelando..." : "Confirmar cancelamento"}</button>
            <button disabled={saving} onClick={() => setConfirmCancel(false)} className="px-4 py-2 rounded-lg border text-xs" style={{ borderColor: C.border, color: C.textMid }}>Manter</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Star rating input ─────────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}>
          <Star size={26} fill={i <= value ? C.coral : "none"} stroke={i <= value ? C.coral : C.border} />
        </button>
      ))}
    </div>
  );
}

// ── Review Driver Modal ───────────────────────────────────────────────────────
function ReviewDriverModal({ open, booking, user, onClose, onSubmit }: any) {
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
        <h3 className="mb-1" style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>Avaliar motorista e veículo</h3>
        <p className="text-sm mb-4" style={{ color: C.textMid }}>Corrida {booking.code} · {booking.driverName}</p>
        <StarInput value={stars} onChange={setStars} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full mt-3 rounded-xl px-3 py-2.5 border outline-none text-sm resize-none" style={{ borderColor: C.border, color: C.textDark }} placeholder="Como foi sua experiência? (opcional)" />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!stars || saving} className="flex-1 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: stars ? C.primary : C.border, color: "white", fontWeight: 700 }}>
            {saving ? <><Spinner size={14} /> Enviando...</> : "Enviar avaliação"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Driver Card ───────────────────────────────────────────────────────────────
function DriverCard({ driver, car, selected, onSelect, estimatedKm }: any) {
  const total = Math.max(car.minFare, car.pricePerKm * estimatedKm);
  const cat = CAR_CATEGORIES[car.category];

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-4 border-2 transition-all"
      style={{
        borderColor: selected ? C.primary : C.border,
        backgroundColor: selected ? `${C.primary}08` : C.card,
      }}>
      <div className="flex gap-3">
        {car.images?.[0] && (
          <ImageWithFallback src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-20 h-14 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{car.brand} {car.model} {car.year}</p>
              <p className="text-xs" style={{ color: C.textLight }}>{cat?.label} · {car.plate} · {car.color}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p style={{ fontWeight: 800, fontSize: 15, color: C.primary }}>R$ {total.toFixed(2)}</p>
              <p className="text-xs" style={{ color: C.textLight }}>≈{estimatedKm}km</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0" style={{ backgroundColor: C.teal, fontWeight: 800 }}>
              {driver.name.charAt(0)}
            </div>
            <span className="text-xs truncate" style={{ color: C.textMid }}>{driver.name}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star size={11} fill={C.coral} stroke={C.coral} />
              <span className="text-xs" style={{ color: C.textMid, fontWeight: 600 }}>{driver.rating > 0 ? driver.rating.toFixed(1) : "Novo"}</span>
            </div>
            <span className="text-xs" style={{ color: C.textLight }}>{car.capacity} pax</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {car.features.slice(0, 3).map((f: string) => (
              <span key={f} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${C.teal}12`, color: C.teal }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs" style={{ borderColor: C.border, color: C.primary }}>
          <CheckCircle size={13} /><span style={{ fontWeight: 600 }}>Selecionado</span>
        </div>
      )}
    </button>
  );
}

// ── Main TaxiPage ─────────────────────────────────────────────────────────────
export function TaxiPage({ navigate, user, onAddTaxiBooking, onUpdateTaxiBooking, taxiBookings = [] }: Props) {
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [notes, setNotes] = useState("");
  const [estimatedKm, setEstimatedKm] = useState(15);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  const [drivers, setDrivers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Review
  const [reviewModal, setReviewModal] = useState<{ open: boolean; booking?: any }>({ open: false });

  const today = new Date().toISOString().split("T")[0];

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
  const selectedCar = cars.find((c) => c.id === selectedCarId);
  const total = selectedCar ? Math.max(selectedCar.minFare, selectedCar.pricePerKm * estimatedKm) : 0;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [driversRes, carsRes] = await Promise.all([driverService.listActive(), carService.listActive()]);
      if (driversRes.data) setDrivers(driversRes.data);
      if (carsRes.data) setCars(carsRes.data);
      setLoading(false);
    })();
  }, []);

  const availableCombos = cars
    .filter((c) => c.capacity >= passengers && c.active !== false)
    .map((c) => ({ car: c, driver: drivers.find((d) => d.id === c.driverId) }))
    .filter((item) => item.driver)
    .sort((a, b) => {
      const totalA = Math.max(a.car.minFare, a.car.pricePerKm * estimatedKm);
      const totalB = Math.max(b.car.minFare, b.car.pricePerKm * estimatedKm);
      return totalA - totalB;
    });

  const validate = () => {
    if (step === 1 && (!origin.trim() || !destination.trim())) return false;
    if (step === 2 && (!date || !time)) return false;
    if (step === 3 && (!selectedDriverId || !selectedCarId)) return false;
    return true;
  };

  const next = () => {
    if (validate()) {
      if (step === 1) {
        const km = Math.round(10 + Math.random() * 40);
        setEstimatedKm(km);
      }
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const handleConfirm = async () => {
    if (!user) { navigate("login"); return; }
    setConfirming(true);
    setBookingError("");
    try {
      const { data, error } = await taxiService.create({
      guestId: user.id,
      guestName: user.name,
      driverId: selectedDriverId,
      driverName: selectedDriver?.name || "",
      carId: selectedCarId,
      carInfo: `${selectedCar?.brand} ${selectedCar?.model} ${selectedCar?.year} — ${selectedCar?.plate} (${selectedCar?.color})`,
      origin, destination, scheduledDate: date, scheduledTime: time,
      passengers, estimatedKm, totalValue: total,
      paymentMethod: paymentMethod === "pix" ? "PIX" : paymentMethod === "credit" ? "Cartão de crédito" : "Boleto",
      notes,
      });
      if (error) {
        setBookingError("Não foi possível registrar o pedido. Verifique a conexão e a configuração do banco.");
      } else if (data) {
        onAddTaxiBooking(data);
        setConfirmedBooking(data);
        setStep(5);
      }
    } catch {
      setBookingError("Ocorreu um erro ao registrar o pedido de táxi. Tente novamente.");
    } finally {
      setConfirming(false);
    }
  };

  const handleReviewDriver = async (booking: any, stars: number, text: string) => {
    if (!user) return;
    await driverReviewService.create({
      taxiBookingId: booking.id,
      reviewerId: user.id,
      reviewerName: user.name,
      driverId: booking.driverId,
      carId: booking.carId,
      stars, text,
    });
  };

  const ptDate = (d: string) => {
    if (!d) return "";
    if (d.includes("/")) return d;
    return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
  };

  // ── STEP 5: Success ─────────────────────────────────────────────────────────
  if (step === 5 && confirmedBooking) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: "100vh" }} className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: confirmedBooking.paymentStatus === "Pago (simulação)" ? C.successLight : C.warningLight }}>
              {confirmedBooking.paymentStatus === "Pago (simulação)"
                ? <CheckCircle size={36} style={{ color: C.success }} />
                : <AlertCircle size={36} style={{ color: C.warning }} />}
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: C.textDark }}>
              {confirmedBooking.paymentStatus === "Pago (simulação)" ? "Corrida simulada" : "Pedido registrado — pagamento pendente"}
            </h2>
            <p className="text-sm mt-1 mb-5" style={{ color: C.textMid }}>
              {confirmedBooking.paymentStatus === "Pago (simulação)"
                ? "Demonstração local. Nenhuma cobrança ou contratação real foi feita."
                : `Pedido salvo com pagamento pendente até ${taxiFormatDue(confirmedBooking.paymentDueAt)}. Nenhuma cobrança foi processada; se não for pago, será cancelado automaticamente ao vencer.`}
            </p>
            <div className="rounded-xl p-4 text-left space-y-2 mb-5" style={{ backgroundColor: C.bg }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Código</span>
                <span style={{ fontWeight: 700, color: C.primary }}>{confirmedBooking.code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Motorista</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{confirmedBooking.driverName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Veículo</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{selectedCar?.brand} {selectedCar?.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Data/hora</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{ptDate(confirmedBooking.scheduledDate)} às {confirmedBooking.scheduledTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Total</span>
                <span style={{ fontWeight: 800, color: C.primary }}>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {confirmedBooking.status === "completed" && <button
                onClick={() => setReviewModal({ open: true, booking: confirmedBooking })}
                className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 border"
                style={{ borderColor: C.coral, color: C.coral, fontWeight: 700 }}>
                <Star size={15} /> Avaliar motorista
              </button>}
              <Alert type="warning">
                {confirmedBooking.paymentStatus === "Pago (simulação)"
                  ? "Pagamento fictício de demonstração. Nenhuma cobrança foi enviada."
                  : "Pagamento pendente. Nenhum Pix/cartão foi processado e nenhum código de cobrança foi gerado."}
              </Alert>
              <button onClick={() => { setStep(1); setConfirmedBooking(null); }} className="w-full py-3 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                Ver minhas corridas
              </button>
              <button onClick={() => { setStep(1); setConfirmedBooking(null); setSelectedDriverId(""); setSelectedCarId(""); setOrigin(""); setDestination(""); setDate(""); setTime(""); }} className="w-full py-2 text-sm" style={{ color: C.textLight }}>
                Reservar outro táxi
              </button>
            </div>
          </div>
        </div>
        <ReviewDriverModal
          open={reviewModal.open}
          booking={reviewModal.booking}
          user={user}
          onClose={() => setReviewModal({ open: false })}
          onSubmit={handleReviewDriver}
        />
      </div>
    );
  }

  const stepLabels = ["Rota", "Horário", "Motorista", "Pagamento"];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontWeight: 800, fontSize: 24, color: C.textDark }}>🚗 Reservar Táxi</h1>
          <p className="text-sm mt-1" style={{ color: C.textMid }}>Motoristas verificados para suas viagens</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: i + 1 <= step ? C.primary : C.border }} />
              <span className="text-xs" style={{ color: i + 1 === step ? C.primary : C.textLight, fontWeight: i + 1 === step ? 700 : 400 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── STEP 1: Route ── */}
        {step === 1 && (
          <Card>
            <h2 className="mb-4" style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Qual é a sua rota?</h2>
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-9 w-2 h-2 rounded-full" style={{ backgroundColor: C.success }} />
                <Input label="Partida" placeholder="Ex: Aeroporto de Guarulhos (GRU)" value={origin} onChange={setOrigin} icon={<MapPin size={15} />} />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-9 w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                <Input label="Destino" placeholder="Ex: Hotel em Copacabana, RJ" value={destination} onChange={setDestination} icon={<MapPin size={15} />} />
              </div>
              <div>
                <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Nº de passageiros</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: C.border, color: C.textDark }}>−</button>
                  <span className="w-8 text-center" style={{ fontWeight: 700, color: C.textDark }}>{passengers}</span>
                  <button onClick={() => setPassengers(Math.min(8, passengers + 1))} className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: C.border, color: C.textDark }}>+</button>
                  <span className="text-sm" style={{ color: C.textLight }}>passageiro{passengers !== 1 ? "s" : ""}</span>
                </div>
              </div>
              {(!origin.trim() || !destination.trim()) && (
                <p className="text-xs" style={{ color: C.textLight }}>Preencha a origem e o destino para continuar.</p>
              )}
            </div>
          </Card>
        )}

        {/* ── STEP 2: Schedule ── */}
        {step === 2 && (
          <Card>
            <h2 className="mb-4" style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Quando precisa do táxi?</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Data *</label>
                <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm"
                  style={{ borderColor: C.border, color: C.textDark }} />
              </div>
              <div>
                <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Horário *</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm"
                  style={{ borderColor: C.border, color: C.textDark }} />
              </div>
              <div>
                <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Observações (opcional)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: vou com bagagem grande, preciso de cadeirinha..."
                  className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm resize-none"
                  style={{ borderColor: C.border, color: C.textDark }} />
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: C.bg }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: C.textLight }}>Rota</span>
                  <span style={{ color: C.textDark, fontWeight: 600 }}>{origin.slice(0, 20)}... → {destination.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span style={{ color: C.textLight }}>Passageiros</span>
                  <span style={{ color: C.textDark, fontWeight: 600 }}>{passengers}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 3: Choose driver ── */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Escolha o motorista</h2>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${C.teal}15`, color: C.teal, fontWeight: 600 }}>
                Distância estimada: ~{estimatedKm}km
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Spinner size={28} /></div>
            ) : availableCombos.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <Car size={36} className="mx-auto mb-3" style={{ color: C.textLight }} />
                  <p style={{ fontWeight: 700, color: C.textDark }}>Nenhum motorista disponível</p>
                  <p className="text-sm mt-1" style={{ color: C.textLight }}>Não há veículos com capacidade para {passengers} passageiro{passengers !== 1 ? "s" : ""} no momento.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableCombos.map(({ car, driver }) => (
                  <DriverCard
                    key={car.id}
                    driver={driver}
                    car={car}
                    estimatedKm={estimatedKm}
                    selected={selectedCarId === car.id}
                    onSelect={() => { setSelectedCarId(car.id); setSelectedDriverId(driver.id); }}
                  />
                ))}
                {!selectedCarId && (
                  <p className="text-xs text-center" style={{ color: C.textLight }}>Selecione um motorista para continuar.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Payment ── */}
        {step === 4 && (
          <Card>
            <h2 className="mb-4" style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Confirmar e pagar</h2>

            {/* Summary */}
            <div className="rounded-xl p-4 mb-4 space-y-2" style={{ backgroundColor: C.bg }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Motorista</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{selectedDriver?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Veículo</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{selectedCar?.brand} {selectedCar?.model} {selectedCar?.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Partida</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{ptDate(date)} às {time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Rota</span>
                <span style={{ fontWeight: 600, color: C.textDark, textAlign: "right", maxWidth: "60%" }}>{origin.slice(0, 30)} → {destination.slice(0, 30)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: C.textLight }}>Distância estimada</span>
                <span style={{ fontWeight: 600, color: C.textDark }}>{estimatedKm}km</span>
              </div>
              <div className="border-t pt-2 flex justify-between" style={{ borderColor: C.border }}>
                <span style={{ fontWeight: 700, color: C.textDark }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: C.primary }}>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-2 mb-4">
              {[
                { id: "pix", label: "PIX", desc: "Cobrança real ainda não configurada", icon: <Grid3X3 size={18} /> },
                { id: "credit", label: "Cartão de crédito", desc: "Processamento ainda não configurado", icon: <CreditCard size={18} /> },
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors" style={{ borderColor: paymentMethod === m.id ? C.primary : C.border, backgroundColor: paymentMethod === m.id ? `${C.primary}08` : "transparent" }}>
                  <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ accentColor: C.primary }} />
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: paymentMethod === m.id ? C.primary : C.bg, color: paymentMethod === m.id ? "white" : C.textMid }}>{m.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: C.textDark }}>{m.label}</p>
                    <p className="text-xs" style={{ color: C.textLight }}>{m.desc}</p>
                  </div>
                  {paymentMethod === m.id && <CheckCircle size={15} className="ml-auto" style={{ color: C.primary }} />}
                </label>
              ))}
            </div>

            {!user && <Alert type="warning" className="mb-3">Faça login para confirmar a reserva.</Alert>}
            {bookingError && <Alert type="error" className="mb-3">{bookingError}</Alert>}
            <Alert type="warning">
              {!IS_CONFIGURED || getIsPrototypeMode()
                ? "Protótipo: pedido e pagamento simulados; nenhum valor real será cobrado."
                : "O pedido será salvo como pendente por até 48 horas. Nenhum valor será cobrado; ao vencer sem pagamento, será cancelado automaticamente."}
            </Alert>
          </Card>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="flex gap-3 mt-4">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>
                <ArrowLeft size={15} /> Voltar
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={next}
                disabled={!validate()}
                className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-opacity"
                style={{ backgroundColor: validate() ? C.primary : C.border, color: "white", fontWeight: 700, opacity: validate() ? 1 : 0.7 }}>
                Continuar <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={user ? handleConfirm : () => navigate("login")}
                disabled={confirming}
                className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: C.success, color: "white", fontWeight: 700 }}>
                {confirming ? <><Spinner size={16} /> Confirmando...</> : <><CheckCircle size={16} /> Confirmar reserva</>}
              </button>
            )}
          </div>
        )}

        {/* My taxi bookings list (shown in step 1 if user has bookings) */}
        {step === 1 && taxiBookings.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3" style={{ fontWeight: 700, fontSize: 14, color: C.textDark }}>Minhas corridas</h3>
            <div className="space-y-2">
              {taxiBookings.map((b) => <TaxiBookingCard key={b.id} booking={b} onUpdate={onUpdateTaxiBooking} />)}
            </div>
          </div>
        )}
      </div>

      <ReviewDriverModal
        open={reviewModal.open}
        booking={reviewModal.booking}
        user={user}
        onClose={() => setReviewModal({ open: false })}
        onSubmit={handleReviewDriver}
      />
    </div>
  );
}
