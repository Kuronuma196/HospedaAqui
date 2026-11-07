import { useState } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Mail, Phone, Lock, User, Shield, Car, FileText, CreditCard, Briefcase } from "lucide-react";
import { C, Logo, Input, Btn, Alert, Divider, Spinner } from "./ds";
import { authService, driverService } from "./services/api";
import { getIsPrototypeMode, IS_CONFIGURED } from "./services/client";

type Props = { navigate: (p: string, params?: any) => void; onLogin: (user: any) => void; };

// ── Password strength indicator ──────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Mínimo 8 caracteres", ok: password.length >= 8 },
    { label: "Letra maiúscula", ok: /[A-Z]/.test(password) },
    { label: "Letra minúscula", ok: /[a-z]/.test(password) },
    { label: "Número", ok: /\d/.test(password) },
    { label: "Caractere especial", ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = ["", "Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
  const colors = ["", C.error, C.error, C.warning, C.teal, C.success];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{ backgroundColor: i < score ? colors[score] : C.border }} />
        ))}
      </div>
      {password && <p className="text-xs" style={{ color: colors[score], fontWeight: 600 }}>{levels[score]}</p>}
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-xs" style={{ color: c.ok ? C.success : C.textLight }}>
            {c.ok ? <CheckCircle size={11} /> : <div className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: C.textLight }} />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Auth wrapper ─────────────────────────────────────────────────────────────
function AuthCard({ children, title, subtitle, onBack }: { children: React.ReactNode; title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }} className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="10" fill={C.primary} />
              <path d="M22 8L8 20H12V36H20V26H24V36H32V20H36L22 8Z" fill="white" />
              <circle cx="22" cy="28" r="3.5" fill={C.coral} />
            </svg>
          </div>
          {onBack && (
            <button onClick={onBack} className="absolute left-6 flex items-center gap-1 text-sm" style={{ color: C.textMid }}>
              <ArrowLeft size={16} /> Voltar
            </button>
          )}
          <h1 style={{ fontWeight: 800, fontSize: 24, color: C.textDark }}>{title}</h1>
          {subtitle && <p className="text-sm mt-1" style={{ color: C.textMid }}>{subtitle}</p>}
        </div>
        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
export function LoginPage({ navigate, onLogin }: Props) {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!credential) { setError("Informe seu e-mail ou telefone."); return; }
    if (!password) { setError("Informe sua senha."); return; }
    setLoading(true);
    try {
      const { user, error: err } = await authService.signIn(credential, password);
      if (err) { setError(err); return; }
      onLogin(user);
      navigate("home");
    } catch {
      setError("Não foi possível entrar. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Bem-vindo de volta!" subtitle="Entre na sua conta HospedAqui">
      <div className="space-y-4">
        {(!IS_CONFIGURED || getIsPrototypeMode()) && (
          <Alert type="info">💡 Modo demo: use qualquer e-mail e senha para entrar.</Alert>
        )}
        {error && <Alert type="error">{error}</Alert>}
        <Input label="E-mail ou telefone" placeholder="seu@email.com.br ou (11) 99999-9999" value={credential} onChange={setCredential} icon={<Mail size={16} />} required />
        <div className="relative">
          <Input label="Senha" placeholder="Sua senha" value={password} onChange={setPassword} type={showPass ? "text" : "password"} icon={<Lock size={16} />} required />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3" style={{ top: 36, color: C.textLight }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="flex items-center justify-end">
          <button onClick={() => navigate("forgot-password")} className="text-sm hover:underline" style={{ color: C.primary, fontWeight: 600 }}>
            Esqueci minha senha
          </button>
        </div>
        <button onClick={handleLogin} disabled={loading} className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700, opacity: loading ? 0.8 : 1 }}>
          {loading ? <><Spinner size={16} /> Entrando...</> : "Entrar"}
        </button>
        <div className="text-center text-sm" style={{ color: C.textMid }}>
          Não tem conta?{" "}
          <button onClick={() => navigate("register")} className="hover:underline" style={{ color: C.primary, fontWeight: 700 }}>Cadastre-se grátis</button>
        </div>
      </div>
    </AuthCard>
  );
}

// ── REGISTER ─────────────────────────────────────────────────────────────────
export function RegisterPage({ navigate, onLogin }: Props) {
  const [role, setRole] = useState<'guest' | 'driver' | null>(null);
  const [step, setStep] = useState(1);
  const guestSteps = 4;
  const driverSteps = 6;
  const totalSteps = role === 'driver' ? driverSteps : guestSteps;

  // Guest fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);

  // Driver-only fields
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (step === 1 && !name.trim()) errs.name = "Nome obrigatório";
    if (step === 2) {
      if (!email.includes("@")) errs.email = "E-mail inválido";
      if (!phone.trim()) errs.phone = "Telefone obrigatório";
    }
    if (step === 3) {
      if (password.length < 6) errs.password = "Senha com mínimo 6 caracteres";
      if (password !== confirmPass) errs.confirmPass = "Senhas não coincidem";
    }
    if (step === 4 && !terms) errs.terms = "Aceite os termos para continuar";
    if (step === 5 && role === 'driver') {
      if (!cpf.replace(/\D/g, '').length) errs.cpf = "CPF obrigatório";
      if (!pixKey.trim()) errs.pixKey = "Chave PIX obrigatória";
    }
    if (step === 6 && role === 'driver') {
      if (!licenseNumber.trim()) errs.licenseNumber = "Número da carteira obrigatório";
      if (!licenseExpiry) errs.licenseExpiry = "Validade obrigatória";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, totalSteps)); };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const { user, error } = await authService.signUp(name, email, phone, password);
    if (error) { setErrors({ submit: error }); setLoading(false); return; }
    // Se for motorista, criar perfil de motorista
    if (role === 'driver' && user) {
      await driverService.create(user.id, {
        cpf, cnpj: cnpj || undefined, pixKey,
        licenseNumber, licenseExpiry,
      });
    }
    setLoading(false);
    onLogin(user);
    navigate(role === 'driver' ? 'driver' : 'home');
  };

  // Role selection screen
  if (!role) {
    return (
      <AuthCard title="Criar conta" subtitle="Como você vai usar o HospedAqui?">
        <div className="space-y-3">
          {[
            {
              id: 'guest' as const, icon: '🏖️', label: 'Sou Hóspede',
              desc: 'Busco hospedagens e serviços de transporte para minhas viagens',
            },
            {
              id: 'driver' as const, icon: '🚗', label: 'Sou Motorista',
              desc: 'Quero oferecer serviços de transporte para hóspedes',
            },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRole(opt.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:border-opacity-80"
              style={{ borderColor: C.border, backgroundColor: C.bg }}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <p style={{ fontWeight: 700, color: C.textDark, fontSize: 15 }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: C.textLight }}>{opt.desc}</p>
              </div>
            </button>
          ))}
          <div className="text-center text-sm pt-1" style={{ color: C.textMid }}>
            Já tem conta?{" "}
            <button onClick={() => navigate("login")} className="hover:underline" style={{ color: C.primary, fontWeight: 700 }}>Entrar</button>
          </div>
        </div>
      </AuthCard>
    );
  }

  const stepTitles = role === 'driver'
    ? ["Seu nome", "Contato", "Senha segura", "Confirmar", "Dados profissionais", "Habilitação"]
    : ["Seu nome", "Contato", "Senha segura", "Confirmar"];
  const stepSubtitles = role === 'driver'
    ? ["Como devemos chamá-lo?", "Seus dados de contato", "Crie uma senha forte", "Revise e confirme", "Informações como motorista", "Carteira de motorista"]
    : ["Como devemos chamá-lo?", "Seus dados de contato", "Crie uma senha forte", "Revise e confirme"];

  return (
    <AuthCard title={stepTitles[step - 1]} subtitle={stepSubtitles[step - 1]}
      onBack={step === 1 ? () => setRole(null) : undefined}>
      {/* Role badge */}
      <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl w-fit" style={{ backgroundColor: role === 'driver' ? `${C.warning}20` : `${C.teal}20` }}>
        <span className="text-sm">{role === 'driver' ? '🚗' : '🏖️'}</span>
        <span className="text-xs" style={{ fontWeight: 700, color: role === 'driver' ? C.warning : C.teal }}>
          {role === 'driver' ? 'Cadastro de Motorista' : 'Cadastro de Hóspede'}
        </span>
      </div>

      <div className="flex gap-1 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ backgroundColor: i < step ? C.primary : C.border }} />
        ))}
      </div>
      <p className="text-xs mb-4" style={{ color: C.textLight }}>Etapa {step} de {totalSteps}</p>

      <div className="space-y-4">
        {errors.submit && <Alert type="error">{errors.submit}</Alert>}

        {step === 1 && (
          <Input label="Nome completo" placeholder="Como você se chama?" value={name} onChange={setName} icon={<User size={16} />} required error={errors.name} />
        )}
        {step === 2 && (
          <>
            <Input label="E-mail" placeholder="seu@email.com.br" value={email} onChange={setEmail} icon={<Mail size={16} />} required error={errors.email} type="email" />
            <Input label="Telefone (com DDD)" placeholder="+55 (11) 99999-9999" value={phone} onChange={setPhone} icon={<Phone size={16} />} required error={errors.phone} />
            <Alert type="info">Seus dados são usados somente para comunicação sobre reservas.</Alert>
          </>
        )}
        {step === 3 && (
          <>
            <div className="relative">
              <Input label="Crie sua senha" placeholder="Mínimo 6 caracteres" value={password} onChange={setPassword} type={showPass ? "text" : "password"} icon={<Lock size={16} />} required error={errors.password} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3" style={{ top: 36, color: C.textLight }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && <PasswordStrength password={password} />}
            <Input label="Confirme a senha" placeholder="Repita sua senha" value={confirmPass} onChange={setConfirmPass} type="password" required error={errors.confirmPass} />
          </>
        )}
        {step === 4 && (
          <>
            <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: C.bg }}>
              <h4 className="text-sm" style={{ fontWeight: 700, color: C.textDark }}>Revise seus dados:</h4>
              {[[" Nome", name], ["E-mail", email], ["Telefone", phone]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span style={{ color: C.textLight }}>{l}</span>
                  <span style={{ color: C.textDark, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-2 cursor-pointer text-sm" style={{ color: C.textMid }}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" style={{ accentColor: C.primary }} />
              <span>Aceito os <span className="underline" style={{ color: C.primary }}>Termos de Uso</span> e a <span className="underline" style={{ color: C.primary }}>Política de Privacidade</span>.</span>
            </label>
            {errors.terms && <p className="text-xs" style={{ color: C.error }}>{errors.terms}</p>}
            <Alert type="info">🔒 Dados protegidos conforme a LGPD.</Alert>
          </>
        )}

        {/* Driver-only steps */}
        {step === 5 && role === 'driver' && (
          <>
            <Alert type="info">Estes dados são necessários para habilitar você como motorista na plataforma.</Alert>
            <Input label="CPF" placeholder="000.000.000-00" value={cpf} onChange={setCpf} icon={<FileText size={16} />} required error={errors.cpf} />
            <Input label="CNPJ (opcional)" placeholder="00.000.000/0001-00" value={cnpj} onChange={setCnpj} icon={<Briefcase size={16} />} />
            <Input label="Chave PIX (para recebimento)" placeholder="CPF, e-mail, celular ou chave aleatória" value={pixKey} onChange={setPixKey} icon={<CreditCard size={16} />} required error={errors.pixKey} />
          </>
        )}
        {step === 6 && role === 'driver' && (
          <>
            <Input label="Número da CNH" placeholder="Número da carteira de motorista" value={licenseNumber} onChange={setLicenseNumber} icon={<Car size={16} />} required error={errors.licenseNumber} />
            <div>
              <label className="text-sm block mb-1.5" style={{ fontWeight: 600, color: C.textDark }}>Validade da CNH *</label>
              <input
                type="date" value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 border outline-none text-sm"
                style={{ borderColor: errors.licenseExpiry ? C.error : C.border, color: C.textDark }}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.licenseExpiry && <p className="text-xs mt-1" style={{ color: C.error }}>{errors.licenseExpiry}</p>}
            </div>
            <Alert type="warning">Seus documentos serão verificados antes de você aparecer nas buscas.</Alert>
          </>
        )}

        <div className="flex gap-3 mt-2">
          {step > 1 && (
            <button onClick={prev} className="flex-1 py-3 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.textMid, fontWeight: 600 }}>Voltar</button>
          )}
          {step < totalSteps ? (
            <button onClick={next} className="flex-1 py-3 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Continuar</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.coral, color: "white", fontWeight: 700, opacity: loading ? 0.8 : 1 }}>
              {loading ? <><Spinner size={16} /> Criando conta...</> : role === 'driver' ? '🚗 Cadastrar como Motorista' : 'Criar conta'}
            </button>
          )}
        </div>
        {step === 1 && (
          <div className="text-center text-sm" style={{ color: C.textMid }}>
            Já tem conta? <button onClick={() => navigate("login")} className="hover:underline" style={{ color: C.primary, fontWeight: 700 }}>Entrar</button>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export function ForgotPasswordPage({ navigate }: { navigate: (p: string) => void }) {
  const [step, setStep] = useState<"email" | "code" | "newpass" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!email.includes("@")) { setError("Informe um e-mail válido."); return; }
    setError("");
    setLoading(true);
    const { error: err } = await authService.resetPassword(email);
    setLoading(false);
    if (err) { setError(err); return; }
    setStep("code");
  };

  const handleVerifyCode = () => {
    const codeStr = code.join("");
    if (codeStr.length < 6) { setError("Insira todos os 6 dígitos."); return; }
    setError("");
    // Demo: qualquer código é aceito (Supabase usa links por e-mail)
    setStep("newpass");
  };

  const handleNewPass = async () => {
    if (newPass.length < 6) { setError("Senha muito curta (mínimo 6 caracteres)."); return; }
    if (newPass !== confirmPass) { setError("Senhas não coincidem."); return; }
    setError("");
    setLoading(true);
    const { error: err } = await authService.updatePassword(newPass);
    setLoading(false);
    if (err) { setError(err); return; }
    setStep("success");
  };

  const handleCodeInput = (val: string, idx: number) => {
    if (val.length > 1) return;
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) document.getElementById(`code-${idx + 1}`)?.focus();
  };

  if (step === "success") return (
    <AuthCard title="Senha alterada!" subtitle="Sua senha foi redefinida com sucesso">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: C.successLight }}>
          <CheckCircle size={32} style={{ color: C.success }} />
        </div>
        <p className="text-sm" style={{ color: C.textMid }}>Você já pode entrar com sua nova senha.</p>
        <button onClick={() => navigate("login")} className="w-full py-3.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
          Ir para login
        </button>
      </div>
    </AuthCard>
  );

  const titles: Record<string, string> = { email: "Esqueceu sua senha?", code: "Verifique seu e-mail", newpass: "Nova senha" };
  const subtitles: Record<string, string> = { email: "Enviaremos instruções para redefinir sua senha.", code: `Código enviado para ${email}`, newpass: "Crie uma senha forte e segura." };

  return (
    <AuthCard title={titles[step]} subtitle={subtitles[step]}>
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {step === "email" && (
          <>
            <Input label="E-mail cadastrado" placeholder="seu@email.com.br" value={email} onChange={setEmail} icon={<Mail size={16} />} required />
            <Alert type="info">Por segurança, não informamos se a conta existe. Verifique sua caixa de entrada.</Alert>
            {IS_CONFIGURED && !getIsPrototypeMode() && <Alert type="warning">Um e-mail com link de redefinição será enviado para o endereço informado.</Alert>}
            <button onClick={handleSendCode} disabled={loading} className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>
              {loading ? <><Spinner size={16} /> Enviando...</> : "Enviar código"}
            </button>
          </>
        )}
        {step === "code" && (
          <>
            <p className="text-sm text-center" style={{ color: C.textMid }}>Digite o código de 6 dígitos.</p>
            <div className="flex gap-2 justify-center">
              {code.map((d, i) => (
                <input key={i} id={`code-${i}`} maxLength={1} value={d} onChange={(e) => handleCodeInput(e.target.value, i)}
                  className="w-11 h-12 text-center text-lg rounded-xl border-2 outline-none transition-colors"
                  style={{ borderColor: d ? C.primary : C.border, color: C.textDark, fontWeight: 700 }} />
              ))}
            </div>
            {(!IS_CONFIGURED || getIsPrototypeMode()) && <Alert type="info">Demo: qualquer código de 6 dígitos é aceito.</Alert>}
            <button onClick={handleVerifyCode} className="w-full py-3.5 rounded-xl text-sm" style={{ backgroundColor: C.primary, color: "white", fontWeight: 700 }}>Verificar código</button>
          </>
        )}
        {step === "newpass" && (
          <>
            <div className="relative">
              <Input label="Nova senha" placeholder="Mínimo 6 caracteres" value={newPass} onChange={setNewPass} type={showPass ? "text" : "password"} icon={<Lock size={16} />} required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3" style={{ top: 36, color: C.textLight }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPass && <PasswordStrength password={newPass} />}
            <Input label="Confirmar nova senha" placeholder="Repita a senha" value={confirmPass} onChange={setConfirmPass} type="password" required />
            <button onClick={handleNewPass} disabled={loading} className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2" style={{ backgroundColor: C.teal, color: "white", fontWeight: 700 }}>
              {loading ? <><Spinner size={16} /> Salvando...</> : "Salvar nova senha"}
            </button>
          </>
        )}
        <button onClick={() => navigate("login")} className="w-full text-sm text-center" style={{ color: C.textLight }}>Voltar ao login</button>
      </div>
    </AuthCard>
  );
}
