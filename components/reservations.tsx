import { useState } from "react";
import { MapPin, Calendar, Users, ChevronRight, Download, X, Star, RotateCcw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { C, ImageWithFallback, Badge, Card, Alert, Modal, Tabs, Spinner } from "./ds";
import { STATUS_LABELS } from "./ds";
import type { Reservation } from "./data";
import { IS_CONFIGURED, getIsPrototypeMode } from "./services/client";

type Props = { navigate: (p: string, params?: any) => void; reservations: Reservation[]; user: any; onUpdateReservation: (id: string, updates: Partial<Reservation>) => Promise<{ error: string | null }>; };

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] || { label: status, color: "gray" as const };
  return <Badge color={s.color as any}>{s.label}</Badge>;
}

function dateToInput(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function countNights(checkIn: string, checkOut: string) {
  const parse = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(checkOut) - parse(checkIn)) / 86400000);
}

function formatDue(value?: string) {
  if (!value) return "48 horas após o registro";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function ReservationCard({ res, onOpen }: { res: Reservation; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="rounded-2xl border overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
      style={{ backgroundColor: C.card, borderColor: C.border }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 shrink-0 relative overflow-hidden" style={{ height: 140 }}>
          <ImageWithFallback src={res.propertyImage} alt={res.propertyName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 left-2">
            <StatusBadge status={res.status} />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{res.propertyName}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={12} style={{ color: C.textLight }} />
                <span className="text-xs" style={{ color: C.textLight }}>{res.city}</span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: C.textLight }} className="shrink-0 mt-1" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-xs">
            <div><span style={{ color: C.textLight }}>Entrada</span><div style={{ fontWeight: 600, color: C.textDark }}>{res.checkIn}</div></div>
            <div><span style={{ color: C.textLight }}>Saída</span><div style={{ fontWeight: 600, color: C.textDark }}>{res.checkOut}</div></div>
            <div><span style={{ color: C.textLight }}>Hóspedes</span><div style={{ fontWeight: 600, color: C.textDark }}>{res.guests} pessoa{res.guests > 1 ? "s" : ""}</div></div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs" style={{ color: C.textLight }}>Total</span>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.primary }}>R$ {res.totalValue.toLocaleString("pt-BR")}</div>
            </div>
            <div className="flex gap-2">
              {res.status === "pending_payment" && (
                <span className="px-3 py-1.5 rounded-xl text-xs" style={{ backgroundColor: C.warningLight, color: C.warning, fontWeight: 700 }}>Aguardando pagamento</span>
              )}
              {res.status === "completed" && (
                <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded-xl border text-xs" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>Avaliar</button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="px-3 py-1.5 rounded-xl text-xs" style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 600 }}>
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status info bar */}
      {res.status === "pending_payment" && (
        <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: C.border, backgroundColor: C.warningLight }}>
          <Clock size={13} style={{ color: C.warning }} />
          <span className="text-xs" style={{ color: C.warning, fontWeight: 600 }}>Pedido salvo; pagamento pendente até {formatDue(res.paymentDueAt)}. Sem cobrança; cancelamento automático ao vencer.</span>
        </div>
      )}
      {res.status === "confirmed" && (
        <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: C.border, backgroundColor: C.successLight }}>
          <CheckCircle size={13} style={{ color: C.success }} />
          <span className="text-xs" style={{ color: C.success, fontWeight: 600 }}>Reserva confirmada — código: <strong>{res.code}</strong></span>
        </div>
      )}
      {res.status === "cancelled" && (
        <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: C.border, backgroundColor: C.errorLight }}>
          <X size={13} style={{ color: C.error }} />
          <span className="text-xs" style={{ color: C.error, fontWeight: 600 }}>Cancelada — {res.cancellationReason || "motivo não especificado"}</span>
        </div>
      )}
    </div>
  );
}

function ReservationDetail({ res, onClose, onCancel, onEdit, onSearch }: {
  res: Reservation; onClose: () => void;
  onCancel: (id: string) => Promise<{ error: string | null }>;
  onEdit: (id: string, updates: Partial<Reservation>) => Promise<{ error: string | null }>;
  onSearch: (params: any) => void;
}) {
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionError, setActionError] = useState("");
  const [editCheckIn, setEditCheckIn] = useState(dateToInput(res.checkInISO || res.checkIn));
  const [editCheckOut, setEditCheckOut] = useState(dateToInput(res.checkOutISO || res.checkOut));
  const [editRequests, setEditRequests] = useState(res.specialRequests || "");
  const isRealMode = IS_CONFIGURED && !getIsPrototypeMode();
  const canCancel = isRealMode
    ? res.status === "pending_payment" && res.paymentStatus === "pending"
    : ["pending_payment", "awaiting_confirmation", "confirmed"].includes(res.status);
  const canEdit = isRealMode
    ? res.status === "pending_payment" && res.paymentStatus === "pending"
    : ["pending_payment", "confirmed"].includes(res.status);
  const editNights = editCheckIn && editCheckOut ? countNights(editCheckIn, editCheckOut) : 0;
  const nightly = res.pricePerNight || res.totalValue / Math.max(1, res.nights) / 1.12;
  const editTotal = Math.round(nightly * editNights * 1.12) + (res.fixedCharges || 0);

  const saveEdit = async () => {
    setActionError("");
    if (!editCheckIn || !editCheckOut || editNights < 1) {
      setActionError("Informe datas válidas; a saída precisa ser depois da entrada.");
      return;
    }
    setSavingEdit(true);
    const result = await onEdit(res.id, {
      checkIn: editCheckIn, checkOut: editCheckOut, nights: editNights,
      totalValue: editTotal, specialRequests: editRequests,
    });
    setSavingEdit(false);
    if (result.error) setActionError(result.error);
    else setEditing(false);
  };

  const cancelReservation = async () => {
    setActionError("");
    const result = await onCancel(res.id);
    if (result.error) setActionError(result.error);
    else onClose();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <ImageWithFallback src={res.propertyImage} alt={res.propertyName} className="w-24 h-20 rounded-xl object-cover shrink-0" />
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>{res.propertyName}</h3>
          <p className="text-sm" style={{ color: C.textMid }}>{res.city}</p>
          <div className="mt-1.5 flex gap-2 flex-wrap">
            <StatusBadge status={res.status} />
            {res.status === "confirmed" && <Badge color="teal">✓ Confirmada</Badge>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: C.primaryLight }}>
        <p className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>CÓDIGO DA RESERVA</p>
        <p style={{ fontWeight: 900, fontSize: 20, color: C.primary, letterSpacing: 1 }}>{res.code}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Check-in", res.checkIn],["Check-out", res.checkOut],
          ["Noites", `${res.nights} noite${res.nights > 1 ? "s" : ""}`],
          ["Hóspedes", `${res.guests} pessoa${res.guests > 1 ? "s" : ""}`],
          ["Quarto", res.roomName],["Total da reserva", `R$ ${res.totalValue.toLocaleString("pt-BR")}`],
          ["Pagamento", res.paymentMethod || (isRealMode ? "Não processado" : "Simulação")],
          ["Status pgto.", res.paymentStatus || (isRealMode ? "Pendente" : "Simulado")],
          ["Prazo de pagamento", res.status === "pending_payment" ? formatDue(res.paymentDueAt) : "Não se aplica"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl p-3" style={{ backgroundColor: C.bg }}>
            <p className="text-xs" style={{ color: C.textLight }}>{l}</p>
            <p className="text-sm mt-0.5" style={{ fontWeight: 600, color: C.textDark }}>{v}</p>
          </div>
        ))}
      </div>

      {res.extras.length > 0 && (
        <div>
          <p className="text-sm mb-2" style={{ fontWeight: 600, color: C.textDark }}>Extras incluídos:</p>
          <div className="flex flex-wrap gap-2">
            {res.extras.map((e) => <Badge key={e} color="teal">{e}</Badge>)}
          </div>
        </div>
      )}

      {canEdit && !editing && (
        <button onClick={() => { setActionError(""); setEditing(true); }} className="w-full py-2.5 rounded-xl border text-sm" style={{ borderColor: C.primary, color: C.primary, fontWeight: 700 }}>
          Editar datas e solicitações
        </button>
      )}
      {editing && (
        <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: C.primary, backgroundColor: C.card }}>
          <p className="text-sm" style={{ color: C.textDark, fontWeight: 700 }}>Editar pedido pendente</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs" style={{ color: C.textMid }}>Check-in
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 border text-sm" style={{ borderColor: C.border, color: C.textDark }} />
            </label>
            <label className="text-xs" style={{ color: C.textMid }}>Check-out
              <input type="date" min={editCheckIn || new Date().toISOString().slice(0, 10)} value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} className="mt-1 w-full rounded-xl px-3 py-2 border text-sm" style={{ borderColor: C.border, color: C.textDark }} />
            </label>
          </div>
          <label className="block text-xs" style={{ color: C.textMid }}>Solicitações especiais
            <textarea value={editRequests} onChange={(e) => setEditRequests(e.target.value)} rows={3} maxLength={1000} className="mt-1 w-full rounded-xl px-3 py-2 border text-sm resize-none" style={{ borderColor: C.border, color: C.textDark }} />
          </label>
          <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: C.bg, color: C.textMid }}>
            {editNights > 0 ? `${editNights} noite(s) · novo total estimado: R$ ${editTotal.toLocaleString("pt-BR")}` : "Selecione datas válidas."}
            <br />{isRealMode ? "Ao salvar, o prazo de pagamento será renovado por mais 48 horas." : "Na demonstração, as alterações ficam apenas em memória; nenhuma cobrança real ocorre."}
          </div>
          {actionError && <Alert type="error">{actionError}</Alert>}
          <div className="flex gap-2">
            <button disabled={savingEdit} onClick={saveEdit} className="flex-1 py-2.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>{savingEdit ? "Salvando..." : "Salvar alterações"}</button>
            <button disabled={savingEdit} onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid }}>Voltar</button>
          </div>
        </div>
      )}
      {actionError && !editing && <Alert type="error">{actionError}</Alert>}

      {/* QR code demo */}
      {(res.status === "confirmed" || res.status === "completed") && (
        <div className="rounded-2xl border p-4 flex items-center gap-4" style={{ borderColor: C.border }}>
          <div className="p-2 rounded-xl border" style={{ borderColor: C.border }}>
            <div className="grid grid-cols-5 gap-0.5" style={{ width: 60, height: 60 }}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="rounded-sm" style={{ backgroundColor: [0,1,2,3,4,5,9,10,12,14,15,19,20,21,22,23,24].includes(i) ? C.primary : C.bg }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>Apresente na chegada</p>
            <p className="text-xs" style={{ color: C.textLight }}>QR demonstrativo — não é um documento válido</p>
            <button className="mt-1.5 text-xs flex items-center gap-1" style={{ color: C.primary, fontWeight: 600 }}>
              <Download size={12} /> Baixar comprovante (demo)
            </button>
          </div>
        </div>
      )}

      {/* Review (completed) */}
      {res.status === "completed" && !reviewSent && (
        <div className="rounded-2xl border p-4" style={{ borderColor: C.border }}>
          <p className="text-sm mb-3" style={{ fontWeight: 700, color: C.textDark }}>Avalie sua experiência</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <svg width="28" height="28" viewBox="0 0 12 12" fill={n <= rating ? C.star : C.border}>
                  <path d="M6 1l1.5 3 3.3.4-2.4 2.3.6 3.3L6 8.5l-3 1.5.6-3.3L1.2 4.4l3.3-.4z" />
                </svg>
              </button>
            ))}
          </div>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Conte como foi sua experiência..." rows={3} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm resize-none mb-3" style={{ borderColor: C.border }} />
          <button onClick={() => setReviewSent(true)} className="w-full py-2.5 rounded-xl text-sm" style={{ backgroundColor: C.teal, color: "white", fontWeight: 700 }}>Enviar avaliação (demo)</button>
        </div>
      )}
      {reviewSent && <Alert type="success">Avaliação enviada com sucesso! (Simulação — nenhum dado real enviado)</Alert>}

      {/* Cancel */}
      {canCancel && !cancelConfirm && (
        <button onClick={() => setCancelConfirm(true)} className="w-full py-2.5 rounded-xl border text-sm" style={{ borderColor: C.error, color: C.error, fontWeight: 600 }}>
          Cancelar reserva
        </button>
      )}
      {cancelConfirm && (
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: C.error, backgroundColor: C.errorLight }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} style={{ color: C.error, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm" style={{ fontWeight: 700, color: C.error }}>Confirmar cancelamento</p>
              <p className="text-xs mt-1" style={{ color: C.textMid }}>{isRealMode ? "Este pedido está pendente e sem pagamento. Ao cancelar, nenhuma cobrança será feita." : "Cancelamento simulado no protótipo; nenhum pagamento ou reserva comercial é alterado."}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={cancelReservation} className="flex-1 py-2 rounded-xl text-xs text-white" style={{ backgroundColor: C.error, fontWeight: 700 }}>Confirmar cancelamento</button>
            <button onClick={() => setCancelConfirm(false)} className="flex-1 py-2 rounded-xl border text-xs" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>Manter reserva</button>
          </div>
        </div>
      )}

      {/* Re-book */}
      {(res.status === "completed" || res.status === "cancelled") && (
        <button
          onClick={() => { onSearch({ destination: res.city.split(",")[0] }); onClose(); }}
          className="w-full py-2.5 rounded-xl border text-sm flex items-center justify-center gap-2"
          style={{ borderColor: C.primary, color: C.primary, fontWeight: 600 }}
        >
          <RotateCcw size={14} /> Reservar novamente
        </button>
      )}

      <Alert type="warning">{isRealMode ? "Pedido salvo no banco e aguardando pagamento. Nenhuma cobrança foi processada; a confirmação depende do pagamento e da disponibilidade." : "Modo de demonstração: nenhuma cobrança real foi processada e os dados não alteram reservas comerciais."}</Alert>
    </div>
  );
}

export function ReservationsPage({ navigate, reservations, user, onUpdateReservation }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const tabs = [
    { id: "all", label: "Todas", count: reservations.length },
    { id: "upcoming", label: "Próximas viagens", count: reservations.filter((r) => ["confirmed", "awaiting_confirmation", "pending_payment"].includes(r.status)).length },
    { id: "completed", label: "Concluídas", count: reservations.filter((r) => r.status === "completed").length },
    { id: "cancelled", label: "Canceladas", count: reservations.filter((r) => r.status === "cancelled").length },
  ];

  const filtered = reservations.filter((r) => {
    if (activeTab === "upcoming") return ["confirmed", "awaiting_confirmation", "pending_payment"].includes(r.status);
    if (activeTab === "completed") return r.status === "completed";
    if (activeTab === "cancelled") return r.status === "cancelled";
    return true;
  });

  const handleCancel = async (id: string) => {
    return onUpdateReservation(id, { status: "cancelled", cancellationReason: "Solicitado pelo hóspede" });
  };

  const handleEdit = async (id: string, updates: Partial<Reservation>) => {
    const result = await onUpdateReservation(id, updates);
    if (!result.error) {
      const current = reservations.find((r) => r.id === id);
      if (current) setSelectedRes({
        ...current, ...updates,
        checkIn: updates.checkIn ? new Date(`${updates.checkIn}T00:00:00`).toLocaleDateString("pt-BR") : current.checkIn,
        checkOut: updates.checkOut ? new Date(`${updates.checkOut}T00:00:00`).toLocaleDateString("pt-BR") : current.checkOut,
        checkInISO: updates.checkIn || current.checkInISO,
        checkOutISO: updates.checkOut || current.checkOutISO,
        paymentDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      });
    }
    return result;
  };

  if (!user) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: "100vh" }} className="flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: C.textDark }}>Acesso restrito</h2>
          <p className="text-sm mt-2 mb-5" style={{ color: C.textMid }}>Faça login para visualizar suas reservas.</p>
          <button onClick={() => navigate("login")} className="w-full py-3.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Entrar na conta</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontWeight: 800, fontSize: 24, color: C.textDark }}>Minhas Reservas</h1>
          <p className="text-sm mt-1" style={{ color: C.textMid }}>Gerencie todas as suas hospedagens</p>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-3 mb-5">
          {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: C.textMid }}>
              <Badge color={color as any}>{label}</Badge>
            </div>
          ))}
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="mt-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Nenhuma reserva {activeTab !== "all" ? "nesta categoria" : "ainda"}</h3>
              <p className="text-sm mt-2 mb-5" style={{ color: C.textMid }}>
                {activeTab === "all" ? "Explore destinos incríveis e faça sua primeira reserva." : "Tente outra aba de filtro."}
              </p>
              {activeTab === "all" && (
                <button onClick={() => navigate("search")} className="px-6 py-3 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Explorar hospedagens</button>
              )}
            </div>
          ) : (
            filtered.map((res) => (
              <ReservationCard key={res.id} res={res} onOpen={() => setSelectedRes(res)} />
            ))
          )}
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={!!selectedRes} onClose={() => setSelectedRes(null)} title={`Reserva — ${selectedRes?.propertyName || ""}`} size="lg">
        {selectedRes && (
          <ReservationDetail
            key={selectedRes.id}
            res={selectedRes}
            onClose={() => setSelectedRes(null)}
            onCancel={handleCancel}
            onEdit={handleEdit}
            onSearch={(p) => navigate("search", p)}
          />
        )}
      </Modal>
    </div>
  );
}
