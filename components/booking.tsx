import { useState } from "react";
import { MapPin, Calendar, Users, ChevronRight, CheckCircle, Plane, Car, Shield, AlertCircle, CreditCard, Grid3X3 } from "lucide-react";
import { C, ImageWithFallback, ProgressSteps, Alert, Card, Spinner, Badge } from "./ds";
import { PROPERTIES, ROOMS, MOCK_FLIGHTS, managedToProperty, managedToRoom } from "./data";
import { getIsPrototypeMode, IS_CONFIGURED } from "./services/client";

type Props = {
  navigate: (p: string, params?: any) => void;
  params?: any;
  user: any;
  onAddReservation: (r: any) => Promise<{ data: any; error: any }>;
  managedProperties?: any[];
};

const STEP_LABELS = ["Datas","Quarto","Hóspede","Extras","Resumo","Pagamento","Confirmação"];

function formatDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR");
}

export function BookingPage({ navigate, params = {}, user, onAddReservation, managedProperties = [] }: Props) {
  const managedProp = managedProperties.find((p) => p.id === params.propertyId);
  const property = PROPERTIES.find((p) => p.id === params.propertyId)
    || (managedProp ? managedToProperty(managedProp) : null)
    || PROPERTIES[0];
  const staticRooms = ROOMS.filter((r) => r.propertyId === property.id && r.available);
  const availableRooms = staticRooms.length > 0 ? staticRooms : (managedProp ? [managedToRoom(managedProp)] : []);

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(params.checkIn || "");
  const [checkOut, setCheckOut] = useState(params.checkOut || "");
  const [adults, setAdults] = useState(params.guests || 2);
  const [children, setChildren] = useState(0);
  const [rooms, setRoomsCount] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(params.roomId || (availableRooms[0]?.id || ""));
  const [arrivalTime, setArrivalTime] = useState("14:00");
  const [extras, setExtras] = useState<string[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<any>(null);
  const [bookingError, setBookingError] = useState("");
  const [reservationCode] = useState(`HSP-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`);

  const nights = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : (params.nights || 1);
  const roomObj = availableRooms.find((r) => r.id === selectedRoom) || availableRooms[0];
  const pricePerNight = roomObj?.pricePerNight || property.pricePerNight;
  const subtotal = pricePerNight * nights;
  const flightObj = MOCK_FLIGHTS.find((f) => f.id === selectedFlight);
  const flightCost = flightObj ? flightObj.price * (adults + children) : 0;
  const extrasList = [
    { id: "breakfast", label: "Café da manhã incluído", price: 45, unit: "por pessoa/dia" },
    { id: "transfer", label: "Traslado aeroporto ↔ hotel", price: 120, unit: "por percurso" },
    { id: "insurance", label: "Seguro-viagem básico", price: 35, unit: "por pessoa" },
    { id: "parking", label: "Estacionamento", price: 30, unit: "por dia" },
  ];
  const extrasCost = extras.reduce((acc, id) => { const e = extrasList.find((x) => x.id === id); return acc + (e?.price || 0); }, 0);
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes + flightCost + extrasCost;
  const isSimulatedPayment = !IS_CONFIGURED || getIsPrototypeMode();

  const toggleExtra = (id: string) => setExtras((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleConfirm = async () => {
    setBookingError("");
    setLoading(true);
    const payload = {
      code: reservationCode,
      propertyId: property.id,
      propertyName: property.name,
      propertyImage: property.images[0],
      city: `${property.city}, ${property.state}`,
      roomId: roomObj?.id || undefined,
      roomName: roomObj?.name || "Quarto padrão",
      checkIn: checkIn || new Date().toISOString().split("T")[0],
      checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      nights,
      adults,
      children,
      totalValue: total,
      pricePerNight,
      fixedCharges: flightCost + extrasCost,
      paymentMethod: isSimulatedPayment ? (paymentMethod === "credit" ? "Cartão de crédito" : paymentMethod === "pix" ? "PIX" : "Boleto") : undefined,
      extras: extras.map((id) => extrasList.find((x) => x.id === id)?.label || ""),
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    };
    try {
      const result = await onAddReservation(payload);
      if (result?.error) {
        setBookingError("Não foi possível registrar a reserva. Verifique a conexão e a configuração do banco.");
      } else {
        setCreatedReservation(result?.data || null);
        setStep(7);
      }
    } catch {
      setBookingError("Ocorreu um erro ao registrar a reserva. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Summary sidebar
  const Summary = () => (
    <div className="rounded-2xl p-4 space-y-3 sticky top-20" style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
      <div className="flex gap-3">
        <ImageWithFallback src={property.images[0]} alt={property.name} className="w-16 h-16 rounded-xl object-cover" />
        <div>
          <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{property.name}</p>
          <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{property.city}, {property.state}</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="px-1.5 py-0.5 rounded text-xs text-white" style={{ backgroundColor: C.primary, fontWeight: 700 }}>{property.score}</div>
            <span className="text-xs" style={{ color: C.textLight }}>{property.scoreLabel}</span>
          </div>
        </div>
      </div>
      <div className="border-t pt-3 space-y-1.5" style={{ borderColor: C.border }}>
        <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Entrada</span><span style={{ color: C.textDark, fontWeight: 600 }}>{formatDate(checkIn) || "—"}</span></div>
        <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Saída</span><span style={{ color: C.textDark, fontWeight: 600 }}>{formatDate(checkOut) || "—"}</span></div>
        <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Noites</span><span style={{ color: C.textDark, fontWeight: 600 }}>{nights}</span></div>
        <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Hóspedes</span><span style={{ color: C.textDark, fontWeight: 600 }}>{adults + children} pessoa{adults + children > 1 ? "s" : ""}</span></div>
        {roomObj && <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Quarto</span><span style={{ color: C.textDark, fontWeight: 600 }}>{roomObj.name}</span></div>}
      </div>
      <div className="border-t pt-3 space-y-1" style={{ borderColor: C.border }}>
        <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Hospedagem ({nights}n)</span><span style={{ color: C.textDark }}>R$ {subtotal.toLocaleString("pt-BR")}</span></div>
        {flightCost > 0 && <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Voo</span><span style={{ color: C.textDark }}>R$ {flightCost.toLocaleString("pt-BR")}</span></div>}
        {extrasCost > 0 && <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Extras</span><span style={{ color: C.textDark }}>R$ {extrasCost.toLocaleString("pt-BR")}</span></div>}
        <div className="flex justify-between text-xs"><span style={{ color: C.textLight }}>Taxas (~12%)</span><span style={{ color: C.textDark }}>R$ {taxes.toLocaleString("pt-BR")}</span></div>
        <div className="flex justify-between text-sm border-t pt-2 mt-1" style={{ borderColor: C.border, fontWeight: 800, color: C.textDark }}>
          <span>Total</span><span style={{ color: C.primary }}>R$ {total.toLocaleString("pt-BR")}</span>
        </div>
      </div>
      <Alert type="warning">Valores demonstrativos. Esta não é uma reserva real.</Alert>
    </div>
  );

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate("property", { propertyId: property.id })} className="text-sm flex items-center gap-1 mb-3" style={{ color: C.primary }}>
            ← Voltar à hospedagem
          </button>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: C.textDark }}>Reservar — {property.name}</h1>
        </div>

        {step < 7 && (
          <div className="mb-7">
            <ProgressSteps steps={STEP_LABELS.slice(0, 6)} current={step - 1} />
          </div>
        )}

        {step === 7 ? (
          /* ── CONFIRMATION ── */
          <div className="max-w-xl mx-auto text-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: createdReservation?.paymentStatus === "Pago (simulação)" ? C.successLight : C.warningLight }}>
              {createdReservation?.paymentStatus === "Pago (simulação)"
                ? <CheckCircle size={40} style={{ color: C.success }} />
                : <AlertCircle size={40} style={{ color: C.warning }} />}
            </div>
            <Badge color={createdReservation?.paymentStatus === "Pago (simulação)" ? "green" : "yellow"} size="md">
              {createdReservation?.paymentStatus === "Pago (simulação)" ? "Reserva de demonstração" : "Pagamento pendente"}
            </Badge>
            <h2 className="mt-3 mb-2" style={{ fontWeight: 800, fontSize: 24, color: C.textDark }}>
              {createdReservation?.paymentStatus === "Pago (simulação)" ? "Reserva demonstrativa criada" : "Reserva registrada; pagamento pendente"}
            </h2>
            <p className="text-sm mb-6" style={{ color: C.textMid }}>
              {createdReservation?.paymentStatus === "Pago (simulação)"
                ? "Esta é uma simulação local. Nenhum pagamento real foi enviado ou cobrado."
                : `A solicitação foi salva e ficará pendente por até 48 horas. Nenhum pagamento foi processado; a hospedagem só será confirmada após a confirmação do pagamento e da disponibilidade.${createdReservation?.paymentDueAt ? ` Prazo: ${new Date(createdReservation.paymentDueAt).toLocaleString("pt-BR")}.` : ""}`}
            </p>
            <div className="rounded-2xl p-6 mb-6 text-left" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <div className="text-center mb-4">
                <p className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>CÓDIGO DA RESERVA</p>
                <p style={{ fontWeight: 900, fontSize: 22, color: C.primary, letterSpacing: 2 }}>{reservationCode}</p>
              </div>
              <div className="space-y-2 text-sm">
                {[[property.name, "Hospedagem"],[`${formatDate(checkIn)} → ${formatDate(checkOut)}`, "Período"],[`${adults + children} hóspede${adults + children > 1 ? "s" : ""}`, "Hóspedes"],[(roomObj?.name || "Padrão"), "Quarto"],[ `R$ ${total.toLocaleString("pt-BR")}`, "Total"]].map(([v, l]) => (
                  <div key={l} className="flex justify-between"><span style={{ color: C.textLight }}>{l}</span><span style={{ fontWeight: 600, color: C.textDark }}>{v}</span></div>
                ))}
              </div>
            </div>
            <Alert type="warning">
              {createdReservation?.paymentStatus === "Pago (simulação)"
                ? "Simulação: nenhum pagamento real foi processado; não há QR Pix nesta tela."
                : "Pagamento pendente: nenhum gateway Pix/cartão está configurado e nenhum QR ou código de cobrança foi gerado."}
            </Alert>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate("reservations")} className="flex-1 py-3 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                Ver Minhas Reservas
              </button>
              <button onClick={() => navigate("home")} className="flex-1 py-3 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>
                Início
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">

              {/* ── STEP 1: Dates ── */}
              {step === 1 && (
                <Card>
                  <h2 className="mb-5" style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>1. Selecione as datas e hóspedes</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>Check-in *</label>
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }} />
                      </div>
                      <div>
                        <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>Check-out *</label>
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>Horário previsto de chegada</label>
                      <select value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }}>
                        {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00","Não sei ainda"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[["Adultos", adults, setAdults, 1],["Crianças", children, setChildren, 0],["Quartos", rooms, setRoomsCount, 1]].map(([l,v,s,min]) => (
                        <div key={l as string}>
                          <label className="text-xs block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>{l as string}</label>
                          <div className="flex items-center gap-2 border rounded-xl px-2 py-1.5" style={{ borderColor: C.border }}>
                            <button onClick={() => (s as Function)(Math.max(min as number, (v as number) - 1))} className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: C.bg, color: C.textDark }}>−</button>
                            <span className="flex-1 text-center text-sm" style={{ fontWeight: 600, color: C.textDark }}>{v as number}</span>
                            <button onClick={() => (s as Function)((v as number) + 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: C.bg, color: C.textDark }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {checkIn && checkOut && nights > 0 && (
                      <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 600 }}>
                        📅 {nights} noite{nights > 1 ? "s" : ""} selecionada{nights > 1 ? "s" : ""} · {formatDate(checkIn)} até {formatDate(checkOut)}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* ── STEP 2: Room ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="mb-1" style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>2. Escolha o tipo de quarto</h2>
                  <p className="text-sm mb-4" style={{ color: C.textMid }}>Selecione o quarto que melhor atende às suas necessidades.</p>
                  {availableRooms.map((room) => (
                    <div key={room.id} onClick={() => setSelectedRoom(room.id)} className="rounded-2xl border-2 cursor-pointer transition-colors overflow-hidden" style={{ borderColor: selectedRoom === room.id ? C.primary : C.border }}>
                      <div className="flex">
                        <ImageWithFallback src={room.image} alt={room.name} className="w-32 object-cover" style={{ height: 110 }} />
                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between">
                            <h4 style={{ fontWeight: 700, fontSize: 13, color: C.textDark }}>{room.name}</h4>
                            {selectedRoom === room.id && <CheckCircle size={16} style={{ color: C.primary }} />}
                          </div>
                          <p className="text-xs mt-1" style={{ color: C.textMid }}>👥 {room.capacity} hóspedes · 🛏 {room.beds} · 📐 {room.size}m²</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0,3).map((a) => <span key={a} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: C.bg, color: C.textLight }}>{a}</span>)}
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 14, color: C.primary }}>R$ {room.pricePerNight}/noite</span>
                          </div>
                          {room.cancellable && <span className="text-[10px]" style={{ color: C.teal, fontWeight: 600 }}>✓ Cancelamento grátis</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {availableRooms.length === 0 && <Alert type="warning">Nenhum quarto disponível para esta hospedagem no protótipo. Prosseguindo com valores estimados.</Alert>}
                </div>
              )}

              {/* ── STEP 3: Guest ── */}
              {step === 3 && (
                <Card>
                  <h2 className="mb-4" style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>3. Dados do hóspede responsável</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: C.primaryLight }}>
                      <CheckCircle size={16} style={{ color: C.primary }} />
                      <p className="text-sm" style={{ color: C.primary, fontWeight: 500 }}>Dados pré-preenchidos da sua conta. Verifique e edite se necessário.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>Nome completo *</label>
                        <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }} />
                      </div>
                      <div>
                        <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>E-mail *</label>
                        <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }} />
                      </div>
                      <div>
                        <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>Telefone *</label>
                        <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm block mb-1" style={{ fontWeight: 600, color: C.textDark }}>Pedidos especiais (opcional)</label>
                      <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} placeholder="Ex: andar alto, berço para bebê, quarto silencioso..." className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm resize-none" style={{ borderColor: C.border, color: C.textDark }} />
                    </div>
                    <Alert type="info">🔒 Seus dados são protegidos conforme a LGPD e usados exclusivamente para sua reserva.</Alert>
                  </div>
                </Card>
              )}

              {/* ── STEP 4: Extras ── */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>4. Serviços extras (opcional)</h2>
                  <p className="text-sm" style={{ color: C.textMid }}>Adicione serviços complementares à sua viagem.</p>

                  {/* Extras */}
                  <Card>
                    <h3 className="mb-3 text-sm" style={{ fontWeight: 700, color: C.textDark }}>Serviços da hospedagem</h3>
                    <div className="space-y-3">
                      {extrasList.map((e) => (
                        <label key={e.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors" style={{ borderColor: extras.includes(e.id) ? C.teal : C.border, backgroundColor: extras.includes(e.id) ? C.tealLight : "transparent" }}>
                          <input type="checkbox" checked={extras.includes(e.id)} onChange={() => toggleExtra(e.id)} style={{ accentColor: C.teal }} />
                          <div className="flex-1">
                            <p className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>{e.label}</p>
                            <p className="text-xs" style={{ color: C.textLight }}>{e.unit}</p>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>+R$ {e.price}</span>
                        </label>
                      ))}
                    </div>
                  </Card>

                  {/* Flights */}
                  <Card>
                    <h3 className="mb-1 text-sm" style={{ fontWeight: 700, color: C.textDark }}>Adicionar voo (opcional)</h3>
                    <p className="text-xs mb-3" style={{ color: C.textLight }}>Opções demonstrativas — não são voos reais disponíveis para compra.</p>
                    <div className="space-y-2">
                      {MOCK_FLIGHTS.slice(0,3).map((f) => (
                        <div key={f.id} onClick={() => setSelectedFlight(f.id === selectedFlight ? null : f.id)} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors" style={{ borderColor: selectedFlight === f.id ? C.primary : C.border, backgroundColor: selectedFlight === f.id ? C.primaryLight : "transparent" }}>
                          <Plane size={16} style={{ color: C.primary }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span style={{ fontWeight: 700, color: C.textDark }}>{f.airline}</span>
                              <span style={{ color: C.textLight }}>{f.from} → {f.to}</span>
                              <span style={{ color: C.textLight }}>{f.departure}–{f.arrival}</span>
                              <span style={{ color: C.textLight }}>{f.duration}</span>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: C.textLight }}>{f.stops === 0 ? "Direto" : `${f.stops} escala`} · Bagagem: {f.baggage}</p>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: C.primary }}>R$ {f.price}/pessoa</span>
                          {selectedFlight === f.id && <CheckCircle size={14} style={{ color: C.primary }} />}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ── STEP 5: Summary ── */}
              {step === 5 && (
                <Card>
                  <h2 className="mb-4" style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>5. Revisão da reserva</h2>
                  <div className="space-y-4">
                    {[
                      { title: "Hospedagem", items: [[property.name,""],[ `${property.city}, ${property.state}`,""],[ `${nights} noites · ${formatDate(checkIn)} → ${formatDate(checkOut)}`,""],[ (roomObj?.name || "Padrão"),""]] },
                      { title: "Hóspede", items: [[guestName,""],[ guestEmail,""],[ guestPhone,""]] },
                    ].map((section) => (
                      <div key={section.title}>
                        <h3 className="text-sm mb-2" style={{ fontWeight: 700, color: C.textDark }}>{section.title}</h3>
                        <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: C.bg }}>
                          {section.items.map(([v]) => <p key={v} className="text-sm" style={{ color: C.textMid }}>{v}</p>)}
                        </div>
                      </div>
                    ))}
                    {extras.length > 0 && (
                      <div>
                        <h3 className="text-sm mb-2" style={{ fontWeight: 700, color: C.textDark }}>Extras</h3>
                        <div className="rounded-xl p-3" style={{ backgroundColor: C.bg }}>
                          {extras.map((id) => {
                            const e = extrasList.find((x) => x.id === id);
                            return <p key={id} className="text-sm" style={{ color: C.textMid }}>✓ {e?.label}</p>;
                          })}
                        </div>
                      </div>
                    )}
                    <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: C.primaryLight }}>
                      {[[`Hospedagem (${nights}n)`, `R$ ${subtotal.toLocaleString("pt-BR")}`],[`Taxas (~12%)`, `R$ ${taxes.toLocaleString("pt-BR")}`],flightCost > 0 && [`Voo`, `R$ ${flightCost.toLocaleString("pt-BR")}`],extrasCost > 0 && [`Extras`, `R$ ${extrasCost.toLocaleString("pt-BR")}`]].filter(Boolean).map(([l,v]) => (
                        <div key={l} className="flex justify-between text-sm"><span style={{ color: C.textMid }}>{l}</span><span style={{ color: C.textDark }}>{v}</span></div>
                      ))}
                      <div className="flex justify-between border-t pt-2 mt-1" style={{ borderColor: C.border }}>
                        <span style={{ fontWeight: 800, color: C.textDark }}>Total estimado</span>
                        <span style={{ fontWeight: 900, fontSize: 18, color: C.primary }}>R$ {total.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                    <Alert type="warning">Valores estimados para demonstração. Cancelamento e políticas conforme indicado na hospedagem.</Alert>
                  </div>
                </Card>
              )}

              {/* ── STEP 6: Payment ── */}
              {step === 6 && (
                <Card>
                  <h2 className="mb-4" style={{ fontWeight: 700, fontSize: 17, color: C.textDark }}>6. Forma de pagamento</h2>
                  <div className="space-y-3">
                    {[
                      { id: "credit", label: "Cartão de crédito", desc: isSimulatedPayment ? "Demonstração; nenhuma cobrança será processada" : "Indisponível até configurar o gateway" , icon: <CreditCard size={20} /> },
                      { id: "pix", label: "PIX", desc: isSimulatedPayment ? "Demonstração; sem código ou cobrança Pix real" : "Indisponível até configurar o gateway", icon: <Grid3X3 size={20} /> },
                      { id: "boleto", label: "Boleto bancário", desc: isSimulatedPayment ? "Demonstração; nenhum boleto será emitido" : "Indisponível até configurar o gateway", icon: <AlertCircle size={20} /> },
                    ].map((m) => (
                      <label key={m.id} className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors" style={{ borderColor: paymentMethod === m.id ? C.primary : C.border, backgroundColor: paymentMethod === m.id ? C.primaryLight : "transparent" }}>
                        <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} disabled={!isSimulatedPayment} style={{ accentColor: C.primary }} />
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: paymentMethod === m.id ? C.primary : C.bg, color: paymentMethod === m.id ? "white" : C.textMid }}>{m.icon}</div>
                        <div className="flex-1">
                          <p style={{ fontWeight: 700, fontSize: 13, color: C.textDark }}>{m.label}</p>
                          <p className="text-xs" style={{ color: C.textLight }}>{m.desc}</p>
                        </div>
                        {paymentMethod === m.id && <CheckCircle size={16} style={{ color: C.primary }} />}
                      </label>
                    ))}
                  </div>
                  {bookingError && (
                    <Alert type="error" className="mt-4">{bookingError}</Alert>
                  )}
                  <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: C.bg }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: C.textMid }}>Total a pagar</span>
                      <span style={{ fontWeight: 900, fontSize: 18, color: C.primary }}>R$ {total.toLocaleString("pt-BR")}</span>
                    </div>
                    <p className="text-xs" style={{ color: C.textLight }}>Ao confirmar, você concorda com os termos da HospedAqui</p>
                  </div>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full mt-4 py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: loading ? C.border : C.success, color: "white", fontWeight: 800, fontSize: 15 }}
                  >
                    {loading ? <><Spinner size={18} /> Processando reserva...</> : <><CheckCircle size={18} /> Confirmar reserva</>}
                  </button>
                  <Alert type="warning" className="mt-3">
                    {!IS_CONFIGURED || getIsPrototypeMode()
                      ? "Protótipo: pagamento simulado; nenhum valor real será cobrado."
                      : "Pagamentos reais ainda não estão integrados. A reserva ficará pendente e não será marcada como paga."}
                  </Alert>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-5">
                {step > 1 && (
                  <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>
                    ← Voltar
                  </button>
                )}
                {step < 6 && (
                  <button onClick={() => setStep((s) => s + 1)} className="flex-1 py-3.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                    Continuar →
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 shrink-0">
              <Summary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
