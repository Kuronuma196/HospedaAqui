import { useState, useEffect, type ReactNode } from "react";
import {
  Building2, ChevronRight, ChevronLeft, X, Plus, Check,
  Wifi, Coffee, Thermometer, PawPrint, Baby, Car, Plane,
  CreditCard, Landmark, QrCode, FileText, Hotel, Home, MapPin,
  Image, Trash2, Star, ToggleLeft, ToggleRight, Edit3, Eye,
  BarChart2, Users, TrendingUp, AlertCircle, Upload, Package,
  AlertTriangle, Save,
} from "lucide-react";
import { C, Card, Modal, Btn, Input, Badge, Spinner, Alert, Divider, ImageWithFallback } from "./ds";
import { ImageUploader } from "./image-uploader";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AdminProfile = {
  cnpj: string;
  razaoSocial: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  paymentMethods: string[];
};

export type ManagedProperty = {
  id: string;
  type: "Hotel" | "Pousada" | "Hospedagem";
  name: string;
  city: string;
  state: string;
  description: string;
  address: string;
  photos: string[];
  services: string[];
  benefits: string[];
  hasFlightPackage: boolean;
  flightInfo?: string;
  pricePerNight: number;
  active: boolean;
  createdAt: string;
  reservations: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all"
              style={{
                backgroundColor: i < current ? C.success : i === current ? C.primary : C.border,
                color: i <= current ? "white" : C.textLight,
                fontWeight: 700,
              }}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className="text-[10px] text-center whitespace-nowrap hidden sm:block"
              style={{ color: i === current ? C.primary : C.textLight, fontWeight: i === current ? 600 : 400 }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 mb-4"
              style={{ backgroundColor: i < current ? C.success : C.border }} />
          )}
        </div>
      ))}
    </div>
  );
}

function CheckOption({ label, checked, onChange, icon }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; icon?: ReactNode;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all w-full text-left"
      style={{
        borderColor: checked ? C.primary : C.border,
        backgroundColor: checked ? C.primaryLight : C.card,
      }}
    >
      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: checked ? C.primary : C.border, backgroundColor: checked ? C.primary : "transparent" }}>
        {checked && <Check size={12} color="white" />}
      </div>
      {icon && <span style={{ color: checked ? C.primary : C.textLight }}>{icon}</span>}
      <span className="text-sm" style={{ fontWeight: 600, color: checked ? C.primary : C.textDark }}>{label}</span>
    </button>
  );
}

// ─── Admin Setup Banner ───────────────────────────────────────────────────────
export function AdminSetupBanner({ onOpen }: { onOpen: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #7A5C3A 0%, #C41230 60%, #8B0D22 100%)`,
      }}
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute rounded-full border border-white/10"
            style={{ width: 100 + i * 80, height: 100 + i * 80, right: -30 + i * 20, top: -20 + i * 10 }} />
        ))}
        <div className="absolute left-0 bottom-0 w-32 h-32 rounded-full"
          style={{ backgroundColor: "rgba(245,197,24,0.1)", transform: "translate(-30%, 30%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(245,197,24,0.2)" }}>
            <Building2 size={22} color="#F5C518" />
          </div>
          <div>
            <p className="text-white text-sm" style={{ fontWeight: 700 }}>
              🏨 Seja um Anfitrião na HospedAqui!
            </p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
              Cadastre seu hotel, pousada ou hospedagem e alcance milhares de viajantes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpen}
            className="px-5 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: "#F5C518", color: "#1A0E00", fontWeight: 700 }}
          >
            Quero ser Anfitrião →
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Setup Modal ────────────────────────────────────────────────────────
export function AdminSetupModal({ open, onClose, onComplete }: {
  open: boolean;
  onClose: () => void;
  onComplete: (profile: AdminProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<AdminProfile>({
    cnpj: "", razaoSocial: "", cep: "", address: "", number: "",
    neighborhood: "", city: "", state: "", paymentMethods: [],
  });

  const steps = ["Empresa", "Endereço", "Pagamento", "Confirmação"];

  const set = (k: keyof AdminProfile, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const togglePayment = (m: string) => {
    setForm((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(m)
        ? f.paymentMethods.filter((x) => x !== m)
        : [...f.paymentMethods, m],
    }));
  };

  const formatCNPJ = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 14);
    return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatCEP = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 8);
    return n.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const handleFinish = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onComplete(form);
    onClose();
    setStep(0);
  };

  const paymentOptions = [
    { id: "credit_card", label: "Cartão de Crédito", icon: <CreditCard size={16} /> },
    { id: "debit_card", label: "Cartão de Débito", icon: <CreditCard size={16} /> },
    { id: "pix", label: "PIX", icon: <QrCode size={16} /> },
    { id: "boleto", label: "Boleto Bancário", icon: <FileText size={16} /> },
    { id: "bank_account", label: "Conta Bancária (TED/DOC)", icon: <Landmark size={16} /> },
  ];

  const canAdvance = [
    form.cnpj.length >= 14 && form.razaoSocial.length > 2,
    form.cep.length >= 8 && form.address.length > 2 && form.city.length > 0,
    form.paymentMethods.length > 0,
    true,
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl w-full overflow-auto max-h-[90vh] relative"
        style={{ backgroundColor: C.card, maxWidth: 560, border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: C.primaryLight }}>
              <Building2 size={20} style={{ color: C.primary }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Cadastro de Anfitrião</h3>
              <p className="text-xs" style={{ color: C.textLight }}>Configure sua conta de parceiro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"
            style={{ color: C.textLight }}><X size={18} /></button>
        </div>

        <div className="p-5">
          <StepIndicator steps={steps} current={step} />

          {/* Step 0: Dados da empresa */}
          {step === 0 && (
            <div className="space-y-4">
              <Alert type="info">
                Você precisará de CNPJ válido para receber pagamentos. Dados fictícios aceitos neste protótipo.
              </Alert>
              <Input
                label="CNPJ" required
                placeholder="00.000.000/0001-00"
                value={form.cnpj}
                onChange={(v) => set("cnpj", formatCNPJ(v))}
              />
              <Input
                label="Razão Social / Nome Fantasia" required
                placeholder="Ex: Pousada do Sol Ltda"
                value={form.razaoSocial}
                onChange={(v) => set("razaoSocial", v)}
              />
              <p className="text-xs text-center mt-2" style={{ color: C.textLight }}>
                Seus dados são protegidos por criptografia e pela LGPD.
              </p>
            </div>
          )}

          {/* Step 1: Endereço */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="CEP" required
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(v) => set("cep", formatCEP(v))}
                  className="col-span-1"
                />
                <Input
                  label="Estado (UF)" required
                  placeholder="SP"
                  value={form.state}
                  onChange={(v) => set("state", v.toUpperCase().slice(0, 2))}
                  className="col-span-1"
                />
              </div>
              <Input
                label="Logradouro (Rua/Avenida)" required
                placeholder="Ex: Rua das Palmeiras"
                value={form.address}
                onChange={(v) => set("address", v)}
                icon={<MapPin size={15} />}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Número" required
                  placeholder="100"
                  value={form.number}
                  onChange={(v) => set("number", v)}
                />
                <Input
                  label="Bairro"
                  placeholder="Centro"
                  value={form.neighborhood}
                  onChange={(v) => set("neighborhood", v)}
                  className="col-span-2"
                />
              </div>
              <Input
                label="Cidade" required
                placeholder="Ex: São Paulo"
                value={form.city}
                onChange={(v) => set("city", v)}
              />
            </div>
          )}

          {/* Step 2: Formas de recebimento */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm mb-4" style={{ color: C.textMid }}>
                Selecione como você quer receber os pagamentos das reservas:
              </p>
              {paymentOptions.map((opt) => (
                <CheckOption
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  checked={form.paymentMethods.includes(opt.id)}
                  onChange={() => togglePayment(opt.id)}
                />
              ))}
              {form.paymentMethods.includes("bank_account") && (
                <div className="p-3 rounded-xl space-y-3" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <p className="text-xs" style={{ fontWeight: 600, color: C.textMid }}>Dados bancários (opcional neste protótipo)</p>
                  <Input placeholder="Banco (ex: Bradesco)" label="Banco" onChange={() => {}} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="0000" label="Agência" onChange={() => {}} />
                    <Input placeholder="00000-0" label="Conta" onChange={() => {}} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: C.successLight }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: C.success }}>
                  <Check size={28} color="white" />
                </div>
                <h4 className="mb-1" style={{ fontWeight: 700, fontSize: 16, color: C.success }}>
                  Tudo pronto!
                </h4>
                <p className="text-sm" style={{ color: C.textMid }}>
                  Confirme seus dados abaixo e ative sua conta de Anfitrião.
                </p>
              </div>

              <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                {[
                  { label: "Razão Social", value: form.razaoSocial },
                  { label: "CNPJ", value: form.cnpj },
                  { label: "Endereço", value: `${form.address}, ${form.number} — ${form.city}/${form.state}` },
                  { label: "Formas de recebimento", value: form.paymentMethods.map((m) => paymentOptions.find((o) => o.id === m)?.label).join(", ") },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start gap-2">
                    <span className="text-xs" style={{ color: C.textLight, fontWeight: 600 }}>{row.label}</span>
                    <span className="text-xs text-right" style={{ color: C.textDark, fontWeight: 600 }}>{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center" style={{ color: C.textLight }}>
                Ao confirmar, você concorda com os <span style={{ color: C.primary, fontWeight: 600 }}>Termos de Parceiro HospedAqui</span>
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: C.border }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-opacity"
              style={{
                color: step === 0 ? C.textLight : C.textMid,
                fontWeight: 600,
                opacity: step === 0 ? 0.4 : 1,
                backgroundColor: "transparent",
                border: `1px solid ${C.border}`,
              }}
            >
              <ChevronLeft size={16} /> Voltar
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance[step]}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: canAdvance[step] ? C.primary : C.border,
                  color: canAdvance[step] ? "white" : C.textLight,
                  fontWeight: 700,
                  cursor: canAdvance[step] ? "pointer" : "not-allowed",
                }}
              >
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: C.success, color: "white", fontWeight: 700 }}
              >
                {loading ? <><Spinner size={15} />Ativando...</> : <><Check size={16} />Ativar conta</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Property Modal ────────────────────────────────────────────────────
const HOTEL_SERVICES = [
  { id: "wifi", label: "Wi-Fi Grátis", icon: <Wifi size={16} /> },
  { id: "breakfast", label: "Café da Manhã", icon: <Coffee size={16} /> },
  { id: "ac", label: "Ar-Condicionado", icon: <Thermometer size={16} /> },
  { id: "pet", label: "Área Pet Friendly", icon: <PawPrint size={16} /> },
  { id: "kids", label: "Área Infantil", icon: <Baby size={16} /> },
  { id: "car", label: "Carro de Viagem / Transfer", icon: <Car size={16} /> },
  { id: "pool", label: "Piscina", icon: <span>🏊</span> },
  { id: "parking", label: "Estacionamento", icon: <span>🅿️</span> },
  { id: "gym", label: "Academia", icon: <span>🏋️</span> },
  { id: "spa", label: "Spa / Sauna", icon: <span>🧖</span> },
  { id: "restaurant", label: "Restaurante", icon: <span>🍽️</span> },
  { id: "reception24h", label: "Recepção 24h", icon: <span>🛎️</span> },
];

export function CreatePropertyModal({ open, onClose, onCreate }: {
  open: boolean;
  onClose: () => void;
  onCreate: (prop: ManagedProperty) => void;
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "Hotel" as "Hotel" | "Pousada" | "Hospedagem",
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    photos: [] as string[],
    services: [] as string[],
    benefits: "",
    hasFlightPackage: false,
    flightInfo: "",
    pricePerNight: "",
  });

  const steps = ["Tipo e Info", "Endereço", "Fotos", "Serviços", "Pacote / Preço"];
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleService = (id: string) => {
    set("services", form.services.includes(id)
      ? form.services.filter((s) => s !== id)
      : [...form.services, id]);
  };

  const canAdvance = [
    form.name.length > 2 && form.description.length > 10,
    form.city.length > 0 && form.address.length > 2,
    form.photos.length > 0, // ao menos 1 foto obrigatória
    true, // services optional
    parseFloat(form.pricePerNight) > 0,
  ];

  const handleCreate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newProp: ManagedProperty = {
      id: `mp_${Date.now()}`,
      type: form.type,
      name: form.name,
      city: form.city,
      state: form.state,
      description: form.description,
      address: form.address,
      photos: form.photos,
      services: form.services,
      benefits: form.benefits ? form.benefits.split(",").map((b) => b.trim()) : [],
      hasFlightPackage: form.hasFlightPackage,
      flightInfo: form.flightInfo,
      pricePerNight: parseFloat(form.pricePerNight) || 0,
      active: true,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      reservations: 0,
    };
    setLoading(false);
    onCreate(newProp);
    onClose();
    setStep(0);
    setForm({
      type: "Hotel", name: "", description: "", address: "", city: "",
      state: "", cep: "", photos: [], services: [], benefits: "",
      hasFlightPackage: false, flightInfo: "", pricePerNight: "",
    });
  };

  if (!open) return null;

  const typeOptions: { id: "Hotel" | "Pousada" | "Hospedagem"; label: string; desc: string; icon: ReactNode }[] = [
    { id: "Hotel", label: "Hotel", desc: "Estabelecimento com quartos, recepção e serviços.", icon: <Hotel size={20} /> },
    { id: "Pousada", label: "Pousada", desc: "Acomodação menor com atmosfera familiar.", icon: <Home size={20} /> },
    { id: "Hospedagem", label: "Hospedagem / Chalé", desc: "Casa, apartamento, chalé ou kitnet.", icon: <Building2 size={20} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl w-full overflow-auto max-h-[90vh]"
        style={{ backgroundColor: C.card, maxWidth: 600, border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10"
          style={{ borderColor: C.border, backgroundColor: C.card }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: C.primaryLight }}>
              <Plus size={20} style={{ color: C.primary }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Nova Hospedagem</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"
            style={{ color: C.textLight }}><X size={18} /></button>
        </div>

        <div className="p-5">
          <StepIndicator steps={steps} current={step} />

          {/* Step 0: Tipo e informações */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Tipo de hospedagem</p>
                <div className="grid grid-cols-1 gap-2">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => set("type", opt.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: form.type === opt.id ? C.primary : C.border,
                        backgroundColor: form.type === opt.id ? C.primaryLight : C.card,
                      }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: form.type === opt.id ? C.primary : C.bg, color: form.type === opt.id ? "white" : C.textMid }}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-sm" style={{ fontWeight: 700, color: form.type === opt.id ? C.primary : C.textDark }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: C.textLight }}>{opt.desc}</p>
                      </div>
                      {form.type === opt.id && <Check size={16} style={{ color: C.primary, marginLeft: "auto" }} />}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Nome da hospedagem" required
                placeholder="Ex: Pousada Brisa do Mar"
                value={form.name}
                onChange={(v) => set("name", v)}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>
                  Descrição <span style={{ color: C.primary }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva sua hospedagem, o ambiente, diferenciais e o que o hóspede pode esperar..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="w-full rounded-xl text-sm outline-none resize-none"
                  style={{
                    padding: "10px 12px",
                    border: `1.5px solid ${C.border}`,
                    backgroundColor: C.card,
                    color: C.textDark,
                    fontWeight: 400,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 1: Endereço */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="CEP"
                placeholder="00000-000"
                value={form.cep}
                onChange={(v) => set("cep", v)}
              />
              <Input
                label="Logradouro (Rua/Avenida)" required
                placeholder="Ex: Av. Atlântica, 1500"
                value={form.address}
                onChange={(v) => set("address", v)}
                icon={<MapPin size={15} />}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Cidade" required className="col-span-2"
                  placeholder="Ex: Rio de Janeiro"
                  value={form.city}
                  onChange={(v) => set("city", v)}
                />
                <Input
                  label="UF" required
                  placeholder="RJ"
                  value={form.state}
                  onChange={(v) => set("state", v.toUpperCase().slice(0, 2))}
                />
              </div>
            </div>
          )}

          {/* Step 2: Fotos */}
          {step === 2 && (
            <div className="space-y-4">
              <ImageUploader
                images={form.photos}
                onChange={(photos) => set("photos", photos)}
                folder="properties"
                maxImages={8}
                required
                label="Fotos da hospedagem"
              />


            </div>
          )}

          {/* Step 3: Serviços e benefícios */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Serviços oferecidos</p>
                <div className="grid grid-cols-2 gap-2">
                  {HOTEL_SERVICES.map((s) => (
                    <CheckOption
                      key={s.id}
                      label={s.label}
                      icon={s.icon}
                      checked={form.services.includes(s.id)}
                      onChange={() => toggleService(s.id)}
                    />
                  ))}
                </div>
              </div>
              <Divider label="Opcional" />
              <div className="flex flex-col gap-1">
                <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>
                  Benefícios adicionais (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vista para o mar, Quarto romântico, Jacuzzi privativa"
                  value={form.benefits}
                  onChange={(e) => set("benefits", e.target.value)}
                  className="w-full rounded-xl text-sm outline-none"
                  style={{
                    padding: "10px 12px",
                    border: `1.5px solid ${C.border}`,
                    backgroundColor: C.card,
                    color: C.textDark,
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 4: Pacote e preço */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Flight package */}
              <div className="p-4 rounded-xl border-2" style={{ borderColor: form.hasFlightPackage ? C.primary : C.border }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Plane size={18} style={{ color: form.hasFlightPackage ? C.primary : C.textLight }} />
                    <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>Pacote Voo + Hotel</p>
                  </div>
                  <button
                    onClick={() => set("hasFlightPackage", !form.hasFlightPackage)}
                    style={{ color: form.hasFlightPackage ? C.primary : C.textLight }}
                  >
                    {form.hasFlightPackage ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
                <p className="text-xs mb-3" style={{ color: C.textLight }}>
                  Ofereça um combo de voo + hospedagem com desconto especial
                </p>
                {form.hasFlightPackage && (
                  <Input
                    label="Detalhes do pacote"
                    placeholder="Ex: Voo + 3 noites a partir de R$ 1.890 p/p"
                    value={form.flightInfo}
                    onChange={(v) => set("flightInfo", v)}
                    icon={<Package size={15} />}
                  />
                )}
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1">
                <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>
                  Preço por noite (R$) <span style={{ color: C.primary }}>*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: C.textMid, fontWeight: 700 }}>R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={form.pricePerNight}
                    onChange={(e) => set("pricePerNight", e.target.value)}
                    min="0"
                    className="w-full rounded-xl text-sm outline-none"
                    style={{
                      padding: "10px 12px 10px 38px",
                      border: `1.5px solid ${C.border}`,
                      backgroundColor: C.card,
                      color: C.textDark,
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>

              {/* Summary */}
              {form.pricePerNight && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                  <p className="text-xs mb-2" style={{ fontWeight: 700, color: C.primary }}>Resumo da hospedagem</p>
                  <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{form.name || "—"}</p>
                  <p className="text-xs" style={{ color: C.textMid }}>{form.type} · {form.city}/{form.state}</p>
                  <p className="text-sm mt-2" style={{ fontWeight: 800, color: C.primary }}>
                    R$ {form.pricePerNight}/noite
                  </p>
                  {form.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.services.slice(0, 4).map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: C.card, color: C.textMid, fontWeight: 600 }}>
                          {HOTEL_SERVICES.find((h) => h.id === s)?.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: C.border }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
              style={{
                color: step === 0 ? C.textLight : C.textMid,
                fontWeight: 600,
                opacity: step === 0 ? 0.4 : 1,
                border: `1px solid ${C.border}`,
                backgroundColor: "transparent",
              }}
            >
              <ChevronLeft size={16} /> Voltar
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance[step]}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm hover:opacity-90"
                style={{
                  backgroundColor: canAdvance[step] ? C.primary : C.border,
                  color: canAdvance[step] ? "white" : C.textLight,
                  fontWeight: 700,
                  cursor: canAdvance[step] ? "pointer" : "not-allowed",
                }}
              >
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading || !canAdvance[step]}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm hover:opacity-90"
                style={{
                  backgroundColor: canAdvance[step] ? C.success : C.border,
                  color: canAdvance[step] ? "white" : C.textLight,
                  fontWeight: 700,
                  cursor: canAdvance[step] ? "pointer" : "not-allowed",
                }}
              >
                {loading ? <><Spinner size={15} />Publicando...</> : <><Check size={16} />Publicar Hospedagem</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Property Modal ──────────────────────────────────────────────────────
export function EditPropertyModal({ open, property, onClose, onSave }: {
  open: boolean;
  property: ManagedProperty | null;
  onClose: () => void;
  onSave: (updates: Partial<ManagedProperty>) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(property?.name || "");
  const [description, setDescription] = useState(property?.description || "");
  const [address, setAddress] = useState(property?.address || "");
  const [city, setCity] = useState(property?.city || "");
  const [state, setState] = useState(property?.state || "");
  const [pricePerNight, setPricePerNight] = useState(property?.pricePerNight?.toString() || "");
  const [active, setActive] = useState(property?.active ?? true);
  const [photos, setPhotos] = useState<string[]>(property?.photos || []);

  // Sync form whenever the property changes (e.g. editing a different card)
  useEffect(() => {
    if (property) {
      setName(property.name);
      setDescription(property.description);
      setAddress(property.address);
      setCity(property.city);
      setState(property.state);
      setPricePerNight(property.pricePerNight.toString());
      setActive(property.active);
      setPhotos(property.photos || []);
    }
  }, [property?.id]);

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onSave({ name, description, address, city, state, pricePerNight: parseFloat(pricePerNight) || 0, active, photos });
    setLoading(false);
    onClose();
  };

  const canSave = name.length > 2 && city.length > 0 && parseFloat(pricePerNight) > 0;

  if (!open || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl w-full overflow-auto max-h-[90vh]"
        style={{ backgroundColor: C.card, maxWidth: 520, border: `1px solid ${C.border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10"
          style={{ borderColor: C.border, backgroundColor: C.card }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: C.primaryLight }}>
              <Edit3 size={18} style={{ color: C.primary }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Editar Hospedagem</h3>
              <p className="text-xs" style={{ color: C.textLight }}>{property.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"
            style={{ color: C.textLight }}><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <Input label="Nome da hospedagem" required placeholder="Ex: Pousada Brisa do Mar"
            value={name} onChange={setName} />

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>
              Descrição
            </label>
            <textarea rows={3} placeholder="Descreva sua hospedagem..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl text-sm outline-none resize-none"
              style={{ padding: "10px 12px", border: `1.5px solid ${C.border}`, backgroundColor: C.card, color: C.textDark, fontFamily: "inherit" }} />
          </div>

          <Input label="Logradouro" required placeholder="Ex: Av. Atlântica, 1500"
            value={address} onChange={setAddress} icon={<MapPin size={15} />} />

          <div className="grid grid-cols-3 gap-3">
            <Input label="Cidade" required className="col-span-2"
              placeholder="Ex: Rio de Janeiro" value={city} onChange={setCity} />
            <Input label="UF" required placeholder="RJ"
              value={state} onChange={(v) => setState(v.toUpperCase().slice(0, 2))} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>
              Preço por noite (R$) <span style={{ color: C.primary }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: C.textMid, fontWeight: 700 }}>R$</span>
              <input type="number" placeholder="0,00" value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)} min="0"
                className="w-full rounded-xl text-sm outline-none"
                style={{ padding: "10px 12px 10px 38px", border: `1.5px solid ${C.border}`, backgroundColor: C.card, color: C.textDark, fontWeight: 600 }} />
            </div>
          </div>

          {/* Photos */}
          <ImageUploader
            images={photos}
            onChange={setPhotos}
            folder="properties"
            maxImages={8}
            required={false}
            label="Fotos da hospedagem"
          />

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
            <div>
              <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>Status da hospedagem</p>
              <p className="text-xs" style={{ color: C.textLight }}>
                {active ? "● Ativa — visível para hóspedes" : "○ Inativa — oculta para hóspedes"}
              </p>
            </div>
            <button onClick={() => setActive(!active)} style={{ color: active ? C.primary : C.textLight }}>
              {active ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={loading || !canSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: canSave ? C.primary : C.border, color: canSave ? "white" : C.textLight, fontWeight: 700, cursor: canSave ? "pointer" : "not-allowed" }}>
              {loading ? <><Spinner size={15} />Salvando...</> : <><Save size={15} />Salvar alterações</>}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm border"
              style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
export function DeleteConfirmModal({ open, propertyName, onClose, onConfirm }: {
  open: boolean;
  propertyName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    onConfirm();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl w-full p-6"
        style={{ backgroundColor: C.card, maxWidth: 420, border: `1px solid ${C.border}` }}>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: C.errorLight }}>
            <AlertTriangle size={28} style={{ color: C.error }} />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 17, color: C.textDark, marginBottom: 6 }}>
            Excluir hospedagem?
          </h3>
          <p className="text-sm" style={{ color: C.textMid }}>
            Tem certeza que deseja excluir{" "}
            <span style={{ fontWeight: 700, color: C.textDark }}>"{propertyName}"</span>?
            <br />Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm border"
            style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm hover:opacity-90"
            style={{ backgroundColor: C.error, color: "white", fontWeight: 700 }}>
            {loading ? <><Spinner size={15} />Excluindo...</> : <><Trash2 size={15} />Excluir</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page (Dashboard) ───────────────────────────────────────────────────
export function AdminPage({ navigate, user, adminProfile, managedProperties, onCreateProperty, onEditProperty, onDeleteProperty, onToggleAdminMode }: {
  navigate: (p: string, params?: any) => void;
  user: any;
  adminProfile: AdminProfile | null;
  managedProperties: ManagedProperty[];
  onCreateProperty: (prop: ManagedProperty) => void;
  onEditProperty: (id: string, updates: Partial<ManagedProperty>) => void;
  onDeleteProperty: (id: string) => void;
  onToggleAdminMode: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editProp, setEditProp] = useState<ManagedProperty | null>(null);
  const [deletePropId, setDeletePropId] = useState<string | null>(null);

  const stats = [
    {
      label: "Hospedagens ativas",
      value: managedProperties.filter((p) => p.active).length,
      icon: <Building2 size={20} />,
      color: C.primary,
      bg: C.primaryLight,
    },
    {
      label: "Reservas no mês",
      value: managedProperties.reduce((a, p) => a + p.reservations, 0) + 12,
      icon: <Users size={20} />,
      color: C.teal,
      bg: C.tealLight,
    },
    {
      label: "Receita estimada (R$)",
      value: `${((managedProperties.reduce((a, p) => a + p.pricePerNight, 0) || 520) * 12).toLocaleString("pt-BR")}`,
      icon: <TrendingUp size={20} />,
      color: C.success,
      bg: C.successLight,
    },
    {
      label: "Avaliação média",
      value: "9.1 ★",
      icon: <Star size={20} />,
      color: C.warning,
      bg: C.warningLight,
    },
  ];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      {/* Admin header bar */}
      <div style={{ background: `linear-gradient(135deg, #C41230 0%, #8B0D22 100%)` }} className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 rounded-md text-xs"
                  style={{ backgroundColor: "#F5C518", color: "#1A0E00", fontWeight: 700 }}>
                  MODO ADMIN
                </div>
              </div>
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: "clamp(1.3rem,3vw,1.8rem)" }}>
                Painel do Anfitrião
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                Bem-vindo, {user?.name?.split(" ")[0]}! Gerencie suas hospedagens aqui.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleAdminMode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
                style={{ color: "white", fontWeight: 600, fontSize: 13 }}
              >
                <Eye size={16} />
                Ver como Hóspede
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#F5C518", color: "#1A0E00", fontWeight: 700, fontSize: 14 }}
              >
                <Plus size={18} />
                Nova Hospedagem
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: s.bg, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p style={{ fontWeight: 800, fontSize: 22, color: C.textDark }}>{s.value}</p>
              <p className="text-xs" style={{ color: C.textLight, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Admin profile summary */}
        {adminProfile && (
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: C.primaryLight }}>
              <Building2 size={22} style={{ color: C.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ fontWeight: 700, color: C.textDark }}>{adminProfile.razaoSocial}</p>
              <p className="text-xs" style={{ color: C.textLight }}>
                CNPJ: {adminProfile.cnpj} · {adminProfile.city}/{adminProfile.state}
              </p>
            </div>
            <div className="flex gap-1 flex-wrap shrink-0">
              {adminProfile.paymentMethods.slice(0, 3).map((m) => (
                <span key={m} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: C.successLight, color: C.success, fontWeight: 600 }}>
                  {m === "pix" ? "PIX" : m === "credit_card" ? "Crédito" : m === "debit_card" ? "Débito" : m === "boleto" ? "Boleto" : "Conta"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Properties */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontWeight: 800, fontSize: 18, color: C.textDark }}>
              Minhas Hospedagens ({managedProperties.length})
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-sm hover:underline"
              style={{ color: C.primary, fontWeight: 600 }}
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {managedProperties.length === 0 ? (
            <div className="rounded-2xl p-10 text-center"
              style={{ backgroundColor: C.card, border: `2px dashed ${C.border}` }}>
              <Building2 size={40} style={{ color: C.border, margin: "0 auto 12px" }} />
              <h3 className="mb-1" style={{ fontWeight: 700, color: C.textMid }}>Nenhuma hospedagem cadastrada</h3>
              <p className="text-sm mb-4" style={{ color: C.textLight }}>
                Crie sua primeira hospedagem e comece a receber reservas!
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-6 py-2.5 rounded-xl text-sm hover:opacity-90"
                style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}
              >
                Criar primeira hospedagem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {managedProperties.map((prop) => (
                <PropertyAdminCard
                  key={prop.id}
                  property={prop}
                  onNavigate={() => navigate("property", { propertyId: prop.id })}
                  onEdit={() => setEditProp(prop)}
                  onDelete={() => setDeletePropId(prop.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="rounded-2xl p-6"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>
            💡 Dicas para aumentar suas reservas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "📸", title: "Fotos de qualidade", desc: "Propriedades com 5+ fotos recebem 3x mais reservas." },
              { emoji: "✅", title: "Complete seu perfil", desc: "Perfis completos aparecem primeiro nas buscas." },
              { emoji: "⭐", title: "Responda avaliações", desc: "Anfitriões ativos têm 40% mais conversões." },
            ].map((tip) => (
              <div key={tip.title} className="p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                <p className="text-lg mb-1">{tip.emoji}</p>
                <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{tip.title}</p>
                <p className="text-xs" style={{ color: C.textLight }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CreatePropertyModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={onCreateProperty}
      />

      <EditPropertyModal
        key={editProp?.id ?? "none"}
        open={!!editProp}
        property={editProp}
        onClose={() => setEditProp(null)}
        onSave={(updates) => {
          if (editProp) onEditProperty(editProp.id, updates);
          setEditProp(null);
        }}
      />

      <DeleteConfirmModal
        open={!!deletePropId}
        propertyName={managedProperties.find((p) => p.id === deletePropId)?.name || ""}
        onClose={() => setDeletePropId(null)}
        onConfirm={() => {
          if (deletePropId) onDeleteProperty(deletePropId);
          setDeletePropId(null);
        }}
      />
    </div>
  );
}

// ─── Property Admin Card ──────────────────────────────────────────────────────
function PropertyAdminCard({ property, onNavigate, onEdit, onDelete }: {
  property: ManagedProperty; onNavigate: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="relative" style={{ height: 140 }}>
        <ImageWithFallback
          src={property.photos[0] || "https://images.unsplash.com/photo-1593349480374-01bb7d5782d5?w=400"}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 rounded-lg text-xs"
            style={{ backgroundColor: property.active ? C.success : C.error, color: "white", fontWeight: 700 }}>
            {property.active ? "● Ativo" : "○ Inativo"}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 rounded-lg text-xs"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white", fontWeight: 600 }}>
            {property.type}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{property.name}</h4>
          <span style={{ fontWeight: 800, fontSize: 15, color: C.primary, whiteSpace: "nowrap" }}>
            R$ {property.pricePerNight}/noite
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: C.textLight }}>
          <MapPin size={11} style={{ display: "inline", marginRight: 3 }} />
          {property.city}/{property.state}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {property.services.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: C.tealLight, color: C.teal, fontWeight: 600 }}>
              {HOTEL_SERVICES.find((h) => h.id === s)?.label || s}
            </span>
          ))}
          {property.hasFlightPackage && (
            <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 600 }}>
              <Plane size={9} /> Voo+Hotel
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNavigate}
            className="flex-1 py-2 rounded-xl text-xs hover:opacity-90 flex items-center justify-center gap-1"
            style={{ backgroundColor: C.primaryLight, color: C.primary, fontWeight: 700 }}
          >
            <Eye size={13} /> Visualizar
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-2 rounded-xl text-xs hover:opacity-90 flex items-center justify-center gap-1"
            style={{ backgroundColor: C.bg, color: C.textMid, fontWeight: 700, border: `1px solid ${C.border}` }}
          >
            <Edit3 size={13} /> Editar
          </button>
          <button
            onClick={onDelete}
            className="w-9 py-2 rounded-xl text-xs hover:opacity-90 flex items-center justify-center"
            style={{ backgroundColor: C.errorLight, color: C.error, border: `1px solid rgba(214,59,48,0.2)` }}
            title="Excluir hospedagem"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
