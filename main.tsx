import { useState, useEffect, useCallback } from "react";
import { defineProperties } from "figma:react";
import { Header, Footer } from "./components/layout";
import { HomePage } from "./components/home";
import { SearchPage } from "./components/search";
import { PropertyPage } from "./components/property";
import { PackagesPage } from "./components/packages";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./components/auth";
import { BookingPage } from "./components/booking";
import { ReservationsPage } from "./components/reservations";
import { ProfilePage } from "./components/profile";
import { AdminPage, AdminSetupModal } from "./components/admin";
import type { AdminProfile, ManagedProperty } from "./components/admin";
import { TaxiPage } from "./components/taxi";
import { DriverPage } from "./components/driver";
import { AccessibilityWidget } from "./components/accessibility";
import { PrototypeModeWidget } from "./components/prototype-widget";
import { authService, reservationService, favoriteService, driverService, taxiService } from "./components/services/api";
import { IS_CONFIGURED, getIsPrototypeMode, setPrototypeMode } from "./components/services/client";
import { C, Spinner, ThemeProvider } from "./components/ds";
import { MOCK_RESERVATIONS } from "./components/data";

type AppPage =
  | "home" | "search" | "property" | "packages"
  | "login" | "register" | "forgot-password"
  | "booking" | "reservations" | "profile" | "admin"
  | "taxi" | "driver";

// ── Main App ──────────────────────────────────────────────────────────────────
export default function HospedAquiApp({
  startPage = "home",
}: {
  startPage?: string;
}) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [page, setPage] = useState<AppPage>(startPage as AppPage);
  const [pageParams, setPageParams] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [taxiBookings, setTaxiBookings] = useState<any[]>([]);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);

  // ── Admin state ─────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (getIsPrototypeMode()) return false;
    try { return localStorage.getItem("hospedaqui-is-admin") === "true"; } catch { return false; }
  });
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(() => {
    if (getIsPrototypeMode()) return null;
    try {
      const s = localStorage.getItem("hospedaqui-admin-profile");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [managedProperties, setManagedProperties] = useState<ManagedProperty[]>(() => {
    if (getIsPrototypeMode()) return [];
    try {
      const s = localStorage.getItem("hospedaqui-managed-props");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  // ── Prototype mode ──────────────────────────────────────────────────────────
  const [isPrototypeMode, setIsPrototypeMode] = useState<boolean>(() => getIsPrototypeMode());

  const isDriver = !!driverProfile;

  // ── Navigation — declarado cedo para uso nos handlers abaixo ────────────────
  const navigate = useCallback((p: string, params: any = {}) => {
    setPage(p as AppPage);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Load user data ──────────────────────────────────────────────────────────
  const loadUserData = useCallback(async (loggedUser: any) => {
    if (!loggedUser) {
      setReservations([]); setFavorites([]); setTaxiBookings([]); setDriverProfile(null);
      return;
    }
    const [resResult, favResult, taxiResult, driverResult] = await Promise.all([
      reservationService.getByUser(loggedUser.id),
      favoriteService.getByUser(loggedUser.id),
      taxiService.getByGuest(loggedUser.id),
      driverService.getByUserId(loggedUser.id),
    ]);
    if (resResult.data) setReservations(resResult.data);
    if (favResult.data) setFavorites(favResult.data);
    if (taxiResult.data) setTaxiBookings(taxiResult.data);
    setDriverProfile(driverResult.data || null);
  }, []);

  // ── Auth handlers — declarados antes de handleTogglePrototype ───────────────
  const handleLogin = async (loggedUser: any) => {
    setUser(loggedUser);
    await loadUserData(loggedUser);
  };

  const handleLogout = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setReservations([]);
    setFavorites([]);
    setTaxiBookings([]);
    setDriverProfile(null);
    setAdminMode(false);
    navigate("home");
  }, [navigate]);

  // ── Prototype mode handlers ─────────────────────────────────────────────────
  const handleTogglePrototype = useCallback(async () => {
    const next = !isPrototypeMode;
    if (next) {
      try { await authService.signOut(); } catch (error) { console.error("Sign-out during mode switch failed:", error); }
    }
    setPrototypeMode(next);
    setIsPrototypeMode(next);
    setUser(null);
    setReservations([]);
    setFavorites([]);
    setTaxiBookings([]);
    setDriverProfile(null);
    setAdminMode(false);
    setIsAdmin(false);
    setAdminProfile(null);
    setManagedProperties([]);
    setShowAdminSetup(false);
    navigate("home");
    if (!next) {
      try {
        setIsAdmin(localStorage.getItem("hospedaqui-is-admin") === "true");
        const profile = localStorage.getItem("hospedaqui-admin-profile");
        const properties = localStorage.getItem("hospedaqui-managed-props");
        setAdminProfile(profile ? JSON.parse(profile) : null);
        setManagedProperties(properties ? JSON.parse(properties) : []);
      } catch { /* Corrupted or unavailable local data is ignored. */ }
    }
  }, [isPrototypeMode, navigate]);

  /** Login rápido para testes — cria usuário simulado sem chamar Supabase */
  const handleQuickLogin = useCallback((type: "guest" | "admin" | "driver") => {
    const names: Record<string, string> = {
      guest: "Ana Demo",
      admin: "Carlos Admin",
      driver: "João Motorista",
    };
    const mockUser = {
      id: `proto_${type}`,
      name: names[type],
      email: `${type}@prototipo.hospedaqui`,
      phone: "(11) 99999-0000",
      cpf: "***.***.***-**",
      createdAt: "novembro de 2026",
      preferences: { language: "pt-BR", currency: "BRL", notifications: true },
    };

    setUser(mockUser);
    setFavorites(["p1", "p3"]);
    setReservations(MOCK_RESERVATIONS);
    setTaxiBookings([]);

    if (type === "admin") {
      setIsAdmin(true);
      setAdminMode(true);
      const mockAdmin: AdminProfile = {
        cnpj: "12.345.678/0001-99",
        razaoSocial: "HospedAqui Protótipo Ltda",
        cep: "01310-100",
        address: "Av. Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        paymentMethods: ["pix", "credit_card"],
      };
      if (!adminProfile) {
        setAdminProfile(mockAdmin);
        if (!getIsPrototypeMode()) try {
          localStorage.setItem("hospedaqui-is-admin", "true");
          localStorage.setItem("hospedaqui-admin-profile", JSON.stringify(mockAdmin));
        } catch {}
      }
      navigate("admin");
    } else if (type === "driver") {
      setDriverProfile({
        id: "drv1",
        userId: "proto_driver",
        name: "João Motorista",
        email: "driver@prototipo.hospedaqui",
        phone: "(11) 99999-1111",
        cpf: "***.***.***-**",
        pixKey: "(11) 99999-1111",
        licenseNumber: "AB123456789",
        licenseExpiry: "2028-01-01",
        bio: "Motorista do modo protótipo. Sempre disponível.",
        status: "active",
        rating: 4.9,
        totalRatings: 42,
        totalTrips: 150,
        createdAt: "novembro de 2026",
      });
      navigate("driver");
    } else {
      navigate("home");
    }
  }, [adminProfile, navigate]);

  // ── Other handlers ──────────────────────────────────────────────────────────
  const handleUpdateUser = async (updates: any) => {
    if (!user) return;
    setUser({ ...user, ...updates });
    if (IS_CONFIGURED && !getIsPrototypeMode()) {
      await authService.updateProfile(user.id, {
        name: updates.name,
        phone: updates.phone,
        preferences: updates.preferences,
      });
    }
  };

  const handleToggleFav = async (propertyId: string) => {
    const isFav = favorites.includes(propertyId);
    setFavorites((prev) => isFav ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]);
    if (user) {
      const { error } = await favoriteService.toggle(user.id, propertyId, isFav);
      if (error) {
        setFavorites((prev) => isFav ? [...prev, propertyId] : prev.filter((id) => id !== propertyId));
      }
    }
  };

  const handleAddReservation = async (payload: any, userId: string) => {
    const { data, error } = await reservationService.create(payload, userId);
    if (data) setReservations((prev) => [data, ...prev]);
    return { data, error };
  };

  const handleUpdateReservation = async (id: string, updates: any): Promise<{ error: string | null }> => {
    if (!user) return { error: "Entre na sua conta para alterar a reserva." };
    const result = updates.status === "cancelled"
      ? await reservationService.cancel(id, updates.cancellationReason || "Solicitado pelo hóspede", user.id)
      : await reservationService.update(id, updates, user.id);
    if (result.error) return result;
    const dueAt = updates.status === "cancelled" || !IS_CONFIGURED || getIsPrototypeMode()
      ? undefined
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    setReservations((prev) => prev.map((r) => r.id === id ? {
      ...r, ...updates,
      checkIn: updates.checkIn ? new Date(`${updates.checkIn}T00:00:00`).toLocaleDateString("pt-BR") : r.checkIn,
      checkOut: updates.checkOut ? new Date(`${updates.checkOut}T00:00:00`).toLocaleDateString("pt-BR") : r.checkOut,
      checkInISO: updates.checkIn || r.checkInISO,
      checkOutISO: updates.checkOut || r.checkOutISO,
      paymentDueAt: dueAt || r.paymentDueAt,
    } : r));
    return { error: null };
  };

  // ── Admin handlers ──────────────────────────────────────────────────────────
  const handleAdminSetup = (profile: AdminProfile) => {
    setIsAdmin(true);
    setAdminProfile(profile);
    setAdminMode(true);
    if (!getIsPrototypeMode()) try {
      localStorage.setItem("hospedaqui-is-admin", "true");
      localStorage.setItem("hospedaqui-admin-profile", JSON.stringify(profile));
    } catch {}
    navigate("admin");
  };

  const handleToggleAdminMode = () => {
    setAdminMode((prev) => {
      const next = !prev;
      if (next) navigate("admin");
      else navigate("home");
      return next;
    });
  };

  const handleCreateProperty = (prop: ManagedProperty) => {
    setManagedProperties((prev) => {
      const next = [prop, ...prev];
      if (!getIsPrototypeMode()) try { localStorage.setItem("hospedaqui-managed-props", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleEditProperty = (id: string, updates: Partial<ManagedProperty>) => {
    setManagedProperties((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, ...updates } : p);
      if (!getIsPrototypeMode()) try { localStorage.setItem("hospedaqui-managed-props", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleDeleteProperty = (id: string) => {
    setManagedProperties((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (!getIsPrototypeMode()) try { localStorage.setItem("hospedaqui-managed-props", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleAddTaxiBooking = (booking: any) => {
    setTaxiBookings((prev) => [booking, ...prev]);
  };

  const handleUpdateTaxiBooking = async (id: string, updates: any): Promise<{ error: string | null }> => {
    if (!user) return { error: "Entre na sua conta para alterar o pedido de táxi." };
    let resultData: any = null;
    let resultError: string | null = null;
    if (updates.status === "cancelled") {
      const result = await taxiService.cancelByGuest(id, updates.cancellationReason || "Solicitado pelo passageiro", user.id);
      resultError = result.error;
    } else {
      const result = await taxiService.updateByGuest(id, updates, user.id);
      resultError = result.error;
      resultData = result.data;
    }
    if (resultError) return { error: resultError };
    setTaxiBookings((prev) => prev.map((b) => b.id === id ? {
      ...b, ...updates, ...(resultData || {}),
      scheduledDate: resultData?.scheduledDate || (updates.scheduledDate ? new Date(`${updates.scheduledDate}T12:00:00`).toLocaleDateString("pt-BR") : b.scheduledDate),
      scheduledDateISO: resultData?.scheduledDateISO || updates.scheduledDate || b.scheduledDateISO,
      paymentDueAt: updates.status === "cancelled" || !IS_CONFIGURED || getIsPrototypeMode()
        ? b.paymentDueAt
        : (resultData?.paymentDueAt || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()),
    } : b));
    return { error: null };
  };

  // ── Initialize session ──────────────────────────────────────────────────────
  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      setAppLoading(true);
      try {
        const sessionUser = await authService.getSession();
        if (sessionUser) {
          setUser(sessionUser);
          await loadUserData(sessionUser);
        }
        if (IS_CONFIGURED && !getIsPrototypeMode()) {
          unsubscribe = authService.onAuthChange(async (changedUser) => {
            setUser(changedUser);
            await loadUserData(changedUser);
          });
        }
      } catch (e) {
        console.error("Session init error:", e);
      } finally {
        setAppLoading(false);
      }
    })();
    return () => unsubscribe();
  }, [loadUserData]);

  useEffect(() => {
    if (!user || !IS_CONFIGURED || getIsPrototypeMode() || !["reservations", "taxi"].includes(page)) return;
    const timer = window.setInterval(() => { void loadUserData(user); }, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [user, page, loadUserData]);

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (appLoading) {
    return (
      <ThemeProvider>
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-4"
          style={{ backgroundColor: C.bg, fontFamily: "Inter, Segoe UI, system-ui, sans-serif" }}
        >
          <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="10" fill={C.primary} />
            <path d="M22 8L8 20H12V36H20V26H24V36H32V20H36L22 8Z" fill="white" />
            <circle cx="22" cy="28" r="3.5" fill={C.coral} />
          </svg>
          <Spinner size={28} />
          <p className="text-sm" style={{ color: C.textLight }}>Carregando HospedAqui...</p>
        </div>
      </ThemeProvider>
    );
  }

  const noFooterPages = ["login", "register", "forgot-password", "booking"];
  const sharedProps = { navigate, user };
  const favProps = { favorites, onToggleFav: handleToggleFav };

  return (
    <ThemeProvider>
      <div
        style={{
          fontFamily: "Inter, Segoe UI, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: C.bg,
        }}
      >
        <Header
          navigate={navigate}
          user={user}
          onLogout={handleLogout}
          isAdmin={isAdmin}
          adminMode={adminMode}
          onToggleAdminMode={handleToggleAdminMode}
          isDriver={isDriver}
        />

        <main style={{ flex: 1 }}>
          {page === "home" && (
            <HomePage
              {...sharedProps}
              {...favProps}
              isAdmin={isAdmin}
              adminMode={adminMode}
              isDriver={isDriver}
              onOpenAdminSetup={() => setShowAdminSetup(true)}
            />
          )}

          {page === "search" && (
            <SearchPage {...sharedProps} {...favProps} params={pageParams} managedProperties={managedProperties} />
          )}

          {page === "property" && (
            <PropertyPage {...sharedProps} {...favProps} params={pageParams} managedProperties={managedProperties} />
          )}

          {page === "packages" && (
            <PackagesPage {...sharedProps} {...favProps} params={pageParams} />
          )}

          {page === "login" && <LoginPage navigate={navigate} onLogin={handleLogin} />}

          {page === "register" && <RegisterPage navigate={navigate} onLogin={handleLogin} />}

          {page === "forgot-password" && <ForgotPasswordPage navigate={navigate} />}

          {page === "booking" && (
            <BookingPage
              {...sharedProps}
              params={pageParams}
              onAddReservation={(payload: any) => handleAddReservation(payload, user?.id)}
              managedProperties={managedProperties}
            />
          )}

          {page === "reservations" && (
            <ReservationsPage
              {...sharedProps}
              reservations={reservations}
              onUpdateReservation={handleUpdateReservation}
            />
          )}

          {page === "profile" && (
            <ProfilePage
              {...sharedProps}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
              {...favProps}
              reservations={reservations}
              managedProperties={managedProperties}
            />
          )}

          {page === "admin" && (
            <AdminPage
              navigate={navigate}
              user={user}
              adminProfile={adminProfile}
              managedProperties={managedProperties}
              onCreateProperty={handleCreateProperty}
              onEditProperty={handleEditProperty}
              onDeleteProperty={handleDeleteProperty}
              onToggleAdminMode={handleToggleAdminMode}
            />
          )}

          {page === "taxi" && (
            <TaxiPage
              navigate={navigate}
              user={user}
              onAddTaxiBooking={handleAddTaxiBooking}
              onUpdateTaxiBooking={handleUpdateTaxiBooking}
              taxiBookings={taxiBookings}
            />
          )}

          {page === "driver" && (
            <DriverPage
              navigate={navigate}
              user={user}
              driverProfile={driverProfile}
              onUpdateDriverProfile={(updates) => setDriverProfile((prev: any) => prev ? { ...prev, ...updates } : prev)}
            />
          )}
        </main>

        {!noFooterPages.includes(page) && page !== "admin" && page !== "driver" && (
          <Footer navigate={navigate} />
        )}

        {/* Admin Setup Modal */}
        <AdminSetupModal
          open={showAdminSetup}
          onClose={() => setShowAdminSetup(false)}
          onComplete={handleAdminSetup}
        />

        {/* Prototype Mode Widget — canto inferior esquerdo */}
        <PrototypeModeWidget
          isPrototypeMode={isPrototypeMode}
          onTogglePrototype={handleTogglePrototype}
          user={user}
          isAdmin={isAdmin}
          isDriver={isDriver}
          onQuickLogin={handleQuickLogin}
          onLogout={handleLogout}
          navigate={navigate}
        />

        {/* Accessibility Widget — canto inferior direito */}
        <AccessibilityWidget />
      </div>
    </ThemeProvider>
  );
}

defineProperties(HospedAquiApp, {
  startPage: {
    label: "Página inicial",
    type: "string",
    control: "select",
    options: [
      { value: "home",         label: "Home" },
      { value: "search",       label: "Busca" },
      { value: "property",     label: "Hospedagem" },
      { value: "packages",     label: "Pacotes" },
      { value: "login",        label: "Login" },
      { value: "register",     label: "Cadastro" },
      { value: "booking",      label: "Reserva" },
      { value: "reservations", label: "Minhas Reservas" },
      { value: "profile",      label: "Perfil" },
      { value: "admin",        label: "Painel Admin" },
      { value: "taxi",         label: "Reservar Táxi" },
      { value: "driver",       label: "Painel Motorista" },
    ],
    defaultValue: "home",
  },
});
