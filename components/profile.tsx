import { useState, useRef } from "react";
import { User, Mail, Phone, Lock, Globe, Bell, Heart, Calendar, Shield, LogOut, Eye, EyeOff, ChevronRight, CheckCircle, Edit3, Camera, Loader2 } from "lucide-react";
import { C, Card, Alert, Input, Badge, Tabs, Spinner, ImageWithFallback } from "./ds";
import { PROPERTIES, managedToProperty } from "./data";
import { authService, storageService } from "./services/api";
import { IS_CONFIGURED } from "./services/client";

type Props = {
  navigate: (p: string, params?: any) => void;
  user: any;
  onLogout: () => void;
  onUpdateUser: (u: any) => void;
  favorites: string[];
  onToggleFav: (id: string) => void;
  reservations: any[];
  managedProperties?: any[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>{title}</h3>
      {children}
    </div>
  );
}

export function ProfilePage({ navigate, user, onLogout, onUpdateUser, favorites, onToggleFav, reservations, managedProperties = [] }: Props) {
  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  // Preferences
  const [lang, setLang] = useState(user?.preferences?.language || "Português (BR)");
  const [currency, setCurrency] = useState(user?.preferences?.currency || "BRL");
  const [notifs, setNotifs] = useState(user?.preferences?.notifications ?? true);
  const [prefSaved, setPrefSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;
    setAvatarUploading(true);
    const url = await storageService.upload(file, "avatars");
    if (url) {
      const updatedUser = { ...user, avatar: url };
      onUpdateUser(updatedUser);
      if (IS_CONFIGURED) await authService.updateProfile(user.id, { avatar_url: url });
    }
    setAvatarUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onUpdateUser({ ...user, name, email, phone });
      setSaving(false);
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handlePassChange = async () => {
    setPassError("");
    if (!currentPass) { setPassError("Informe a senha atual."); return; }
    if (newPass.length < 8) { setPassError("Nova senha muito curta (mínimo 8 caracteres)."); return; }
    if (newPass !== confirmPass) { setPassError("Senhas não coincidem."); return; }
    setPassSaving(true);
    if (IS_CONFIGURED) {
      const { error } = await authService.updatePassword(newPass);
      setPassSaving(false);
      if (error) { setPassError(error); return; }
    } else {
      await new Promise((r) => setTimeout(r, 1000));
      setPassSaving(false);
    }
    setPassSuccess(true);
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(() => setPassSuccess(false), 4000);
  };

  const handleSavePrefs = () => {
    onUpdateUser({ ...user, preferences: { language: lang, currency, notifications: notifs } });
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  // Favoritos: inclui propriedades estáticas + managed properties convertidas
  const allFavProperties = [
    ...PROPERTIES.filter((p) => favorites.includes(p.id)),
    ...managedProperties
      .filter((mp) => mp.active && favorites.includes(mp.id))
      .map(managedToProperty),
  ];
  const totalSpent = reservations.filter((r) => r.status !== "cancelled").reduce((acc: number, r: any) => acc + r.totalValue, 0);

  const tabs = [
    { id: "personal", label: "Dados Pessoais" },
    { id: "security", label: "Segurança" },
    { id: "preferences", label: "Preferências" },
    { id: "favorites", label: "Favoritos" },
    { id: "privacy", label: "Privacidade" },
  ];

  if (!user) {
    return (
      <div style={{ backgroundColor: C.bg, minHeight: "100vh" }} className="flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: C.textDark }}>Acesso restrito</h2>
          <p className="text-sm mt-2 mb-5" style={{ color: C.textMid }}>Faça login para acessar seu perfil.</p>
          <button onClick={() => navigate("login")} className="w-full py-3.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Entrar na conta</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 p-6 rounded-2xl" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          {/* Avatar com upload */}
          <div className="relative shrink-0 group">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0] ?? null)}
            />
            <div className="w-20 h-20 rounded-2xl overflow-hidden" style={{ backgroundColor: C.primary }}>
              {user.avatar ? (
                <ImageWithFallback src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-white" style={{ fontWeight: 900 }}>
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            {/* Overlay de câmera */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              title="Alterar foto de perfil"
            >
              {avatarUploading
                ? <Loader2 size={20} className="animate-spin text-white" />
                : <Camera size={20} className="text-white" />
              }
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 style={{ fontWeight: 800, fontSize: 22, color: C.textDark }}>{user.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: C.textMid }}>{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <Badge color="blue">Membro desde {user.createdAt}</Badge>
              <Badge color="teal">{reservations.length} reserva{reservations.length !== 1 ? "s" : ""}</Badge>
              {totalSpent > 0 && <Badge color="coral">R$ {totalSpent.toLocaleString("pt-BR")} em viagens</Badge>}
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm" style={{ borderColor: C.error, color: C.error, fontWeight: 600 }}>
            <LogOut size={15} /> Sair
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Reservas", value: reservations.length, icon: <Calendar size={18} />, color: C.primary },
            { label: "Favoritos", value: allFavProperties.length, icon: <Heart size={18} />, color: C.coral },
            { label: "Total gasto", value: `R$ ${totalSpent.toLocaleString("pt-BR")}`, icon: <Shield size={18} />, color: C.teal },
            { label: "Pontos Fiel", value: "1.240 pts", icon: <CheckCircle size={18} />, color: C.warning },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>{stat.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: C.textLight }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {/* ── PERSONAL DATA ── */}
          {activeTab === "personal" && (
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Dados pessoais</h3>
                <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 text-sm" style={{ color: C.primary, fontWeight: 600 }}>
                  <Edit3 size={14} /> {editing ? "Cancelar" : "Editar"}
                </button>
              </div>
              {saveSuccess && <Alert type="success">Dados atualizados com sucesso!</Alert>}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nome completo" value={name} onChange={setName} disabled={!editing} icon={<User size={15} />} />
                  <Input label="E-mail" value={email} onChange={setEmail} type="email" disabled={!editing} icon={<Mail size={15} />} />
                  <Input label="Telefone" value={phone} onChange={setPhone} disabled={!editing} icon={<Phone size={15} />} />
                </div>
                {editing && (
                  <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ backgroundColor: C.teal, color: "white", fontWeight: 700 }}>
                    {saving ? <><Spinner size={14} /> Salvando...</> : "Salvar alterações"}
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: C.border }}>
                <h4 className="mb-4 text-sm" style={{ fontWeight: 700, color: C.textDark }}>Documentos (acesso restrito)</h4>
                <Alert type="info">Documentos pessoais como CPF, RG e passaporte são armazenados de forma segura e criptografada. Nunca exibimos documentos completos nesta tela.</Alert>
                <div className="mt-4 space-y-3">
                  {[["CPF", "***.***.***-**"],["RG", "**.***.***-*"],["Passaporte", "Não cadastrado"]].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                      <div>
                        <p className="text-xs" style={{ color: C.textLight }}>{label}</p>
                        <p className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>{value}</p>
                      </div>
                      <button className="text-xs flex items-center gap-1" style={{ color: C.primary, fontWeight: 600 }}>
                        {value === "Não cadastrado" ? "Adicionar" : "Editar"}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs" style={{ color: C.textLight }}>
                  🔒 Dados protegidos conforme a LGPD. Documentos são solicitados apenas quando necessário para a reserva.
                </p>
              </div>
            </Card>
          )}

          {/* ── SECURITY ── */}
          {activeTab === "security" && (
            <Card>
              <h3 className="mb-5" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Segurança da conta</h3>
              {passSuccess && <Alert type="success">Senha alterada com sucesso!</Alert>}
              {passError && <Alert type="error">{passError}</Alert>}
              <div className="space-y-4">
                <div className="relative">
                  <Input label="Senha atual" placeholder="Sua senha atual" value={currentPass} onChange={setCurrentPass} type={showPass ? "text" : "password"} icon={<Lock size={15} />} required />
                </div>
                <Input label="Nova senha" placeholder="Mínimo 8 caracteres" value={newPass} onChange={setNewPass} type={showPass ? "text" : "password"} icon={<Lock size={15} />} required />
                <Input label="Confirmar nova senha" placeholder="Repita a nova senha" value={confirmPass} onChange={setConfirmPass} type={showPass ? "text" : "password"} required />
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: C.textMid }}>
                  <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)} style={{ accentColor: C.primary }} />
                  Mostrar senhas
                </label>
                <button onClick={handlePassChange} disabled={passSaving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm flex items-center gap-2" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
                  {passSaving ? <><Spinner size={14} /> Alterando...</> : "Alterar senha"}
                </button>
              </div>
              <div className="mt-6 pt-6 border-t" style={{ borderColor: C.border }}>
                <h4 className="mb-3 text-sm" style={{ fontWeight: 700, color: C.textDark }}>Autenticação em dois fatores</h4>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: C.bg }}>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 600, color: C.textDark }}>Verificação por SMS / E-mail</p>
                    <p className="text-xs mt-0.5" style={{ color: C.textLight }}>Adicione uma camada extra de segurança</p>
                  </div>
                  <Badge color="gray">Não ativado</Badge>
                </div>
              </div>
              <Alert type="warning" >🔐 Em uma implementação real, senhas são armazenadas com hash seguro (bcrypt). Nunca em texto puro.</Alert>
            </Card>
          )}

          {/* ── PREFERENCES ── */}
          {activeTab === "preferences" && (
            <Card>
              <h3 className="mb-5" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Preferências</h3>
              {prefSaved && <Alert type="success">Preferências salvas!</Alert>}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Idioma</label>
                    <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }}>
                      {["Português (BR)","English","Español","Français"].map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Moeda</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm" style={{ borderColor: C.border, color: C.textDark }}>
                      {["BRL","USD","EUR","GBP"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm mb-3" style={{ fontWeight: 600, color: C.textDark }}>Notificações</h4>
                  <div className="space-y-2">
                    {[["Ofertas e promoções", notifs, setNotifs],["Confirmações de reserva", true, () => {}],["Lembretes de viagem", true, () => {}]].map(([label, val, setter]: any) => (
                      <label key={label} className="flex items-center justify-between p-3 rounded-xl cursor-pointer" style={{ backgroundColor: C.bg }}>
                        <span className="text-sm" style={{ color: C.textMid }}>{label}</span>
                        <div className="relative w-10 h-5 rounded-full transition-colors" style={{ backgroundColor: val ? C.teal : C.border }}>
                          <input type="checkbox" className="sr-only" checked={val} onChange={(e) => setter(e.target.checked)} />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: val ? "translateX(20px)" : "translateX(0)" }} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={handleSavePrefs} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm" style={{ backgroundColor: C.teal, color: "white", fontWeight: 700 }}>
                  Salvar preferências
                </button>
              </div>
            </Card>
          )}

          {/* ── FAVORITES ── */}
          {activeTab === "favorites" && (
            <div>
              <h3 className="mb-4 text-sm" style={{ fontWeight: 700, color: C.textDark }}>Hospedagens salvas ({allFavProperties.length})</h3>
              {allFavProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">❤️</div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: C.textDark }}>Nenhum favorito ainda</h3>
                  <p className="text-sm mt-2 mb-5" style={{ color: C.textMid }}>Explore hospedagens e salve as que mais gostar.</p>
                  <button onClick={() => navigate("search")} className="px-6 py-3 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Explorar</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allFavProperties.map((p) => (
                    <div key={p.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border, backgroundColor: C.card }}>
                      <div className="relative" style={{ height: 140 }}>
                        <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover" style={{ height: 140 }} />
                        <button onClick={() => onToggleFav(p.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow">
                          <Heart size={13} fill={C.coral} stroke={C.coral} />
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{p.name}</p>
                        <p className="text-xs" style={{ color: C.textLight }}>{p.city}, {p.state}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span style={{ fontWeight: 800, fontSize: 14, color: C.primary }}>R$ {p.pricePerNight}/noite</span>
                          <button onClick={() => navigate("property", { propertyId: p.id })} className="text-xs px-3 py-1.5 rounded-xl" style={{ backgroundColor: C.primary, color: "white", fontWeight: 600 }}>Ver oferta</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeTab === "privacy" && (
            <Card>
              <h3 className="mb-4" style={{ fontWeight: 700, fontSize: 15, color: C.textDark }}>Central de privacidade — LGPD</h3>
              <Alert type="info">A HospedAqui está comprometida com a proteção dos seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</Alert>
              <div className="mt-5 space-y-3">
                {[
                  { title: "Dados que coletamos", desc: "Nome, e-mail, telefone e dados de reservas para prestação do serviço.", icon: "📋" },
                  { title: "Como usamos seus dados", desc: "Exclusivamente para gerenciar suas reservas e comunicar-se com você.", icon: "🔒" },
                  { title: "Compartilhamento", desc: "Não vendemos nem compartilhamos seus dados sem seu consentimento.", icon: "🚫" },
                  { title: "Seus direitos", desc: "Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados.", icon: "✅" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-4 rounded-xl" style={{ backgroundColor: C.bg }}>
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>{item.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {[
                  "Solicitar cópia dos meus dados",
                  "Solicitar exclusão da minha conta",
                  "Revogar consentimento de marketing",
                  "Ver política de privacidade completa",
                ].map((action) => (
                  <button key={action} className="w-full flex items-center justify-between p-3 rounded-xl border text-left text-sm hover:bg-gray-50 transition-colors" style={{ borderColor: C.border, color: C.textMid }}>
                    {action}
                    <ChevronRight size={15} style={{ color: C.textLight }} />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs" style={{ color: C.textLight }}>⚠️ Dados demonstrativos — esta é uma simulação do protótipo HospedAqui. Nenhum dado real é coletado ou armazenado.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}