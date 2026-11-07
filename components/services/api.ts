// ─── HospedAqui API Service Layer ───────────────────────────────────────────
// Todas as operações de dados passam por aqui.
// Quando Supabase está configurado E modo protótipo está desativado → banco real.
// Caso contrário → dados mock com delays simulados.

import { supabase, IS_CONFIGURED, getIsPrototypeMode } from './client'
import { PROPERTIES, ROOMS, MOCK_RESERVATIONS, MOCK_DRIVERS, MOCK_CARS, MOCK_TAXI_BOOKINGS, MOCK_DRIVER_REVIEWS, MOCK_GUEST_REVIEWS } from '../data'

const delay = (ms = 700) => new Promise<void>((r) => setTimeout(r, ms))
const PAYMENT_HOLD_MS = 48 * 60 * 60 * 1000
const newPaymentDueAt = () => new Date(Date.now() + PAYMENT_HOLD_MS).toISOString()

/** true quando deve usar dados simulados (sem Supabase ou modo protótipo ativo) */
const mock = () => !IS_CONFIGURED || getIsPrototypeMode()

const ptDate = (d: string) => {
  if (!d) return ''
  if (d.includes('/')) return d
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('pt-BR')
}

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
export const authService = {
  async getSession(): Promise<any | null> {
    if (mock()) return null
    try {
      const { data } = await supabase!.auth.getSession()
      if (!data.session?.user) return null
      const profile = await _getProfile(data.session.user.id)
      return { ...profile, email: data.session.user.email }
    } catch {
      return null
    }
  },

  async signIn(credential: string, password: string): Promise<{ user: any; error: string | null }> {
    if (mock()) {
      await delay(1000)
      return {
        user: {
          id: 'demo_user',
          name: 'Usuário Demo',
          email: credential,
          phone: '+55 (11) 98765-4321',
          cpf: '***.***.***-**',
          createdAt: 'outubro de 2026',
          preferences: { language: 'pt-BR', currency: 'BRL', notifications: true },
        },
        error: null,
      }
    }
    const email = credential.includes('@')
      ? credential
      : `${credential.replace(/\D/g, '')}@hospedaaqui.app`
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: _mapAuthError(error.message) }
    const profile = await _getProfile(data.user.id)
    return { user: { ...profile, email: data.user.email }, error: null }
  },

  async signUp(name: string, email: string, phone: string, password: string): Promise<{ user: any; error: string | null }> {
    if (mock()) {
      await delay(1400)
      return {
        user: {
          id: 'demo_new_user',
          name, email, phone,
          cpf: '***.***.***-**',
          createdAt: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          preferences: { language: 'pt-BR', currency: 'BRL', notifications: true },
        },
        error: null,
      }
    }
    const { data, error } = await supabase!.auth.signUp({
      email, password,
      options: { data: { name, phone } },
    })
    if (error) return { user: null, error: _mapAuthError(error.message) }
    if (!data.user) return { user: null, error: 'Erro ao criar conta. Tente novamente.' }
    await delay(600)
    const profile = await _getProfile(data.user.id)
    return { user: { ...profile, email }, error: null }
  },

  async signOut(): Promise<void> {
    if (IS_CONFIGURED && !getIsPrototypeMode()) await supabase!.auth.signOut()
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(1000); return { error: null } }
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?page=forgot-password&step=newpass`,
    })
    return { error: error ? _mapAuthError(error.message) : null }
  },

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(800); return { error: null } }
    const { error } = await supabase!.auth.updateUser({ password: newPassword })
    return { error: error ? _mapAuthError(error.message) : null }
  },

  onAuthChange(callback: (user: any | null) => void): () => void {
    if (mock()) return () => {}
    const { data } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await _getProfile(session.user.id)
        callback({ ...profile, email: session.user.email })
      } else {
        callback(null)
      }
    })
    return () => data.subscription.unsubscribe()
  },

  async updateProfile(userId: string, updates: { name?: string; phone?: string; preferences?: any; avatar_url?: string }): Promise<{ error: string | null }> {
    if (mock()) { await delay(700); return { error: null } }
    const { error } = await supabase!.from('profiles')
      .update({ ...updates })
      .eq('id', userId)
    return { error: error?.message || null }
  },
}

// ─── PROPERTY SERVICE ─────────────────────────────────────────────────────────
export const propertyService = {
  async search(filters: {
    city?: string; type?: string; minScore?: number; minStars?: number;
    priceMin?: number; priceMax?: number; amenities?: string[]
  } = {}): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(600)
      let list = [...PROPERTIES]
      if (filters.city) list = list.filter((p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()) || p.name.toLowerCase().includes(filters.city!.toLowerCase()))
      if (filters.type && filters.type !== 'todos') list = list.filter((p) => p.type === filters.type)
      if (filters.minScore) list = list.filter((p) => p.score >= filters.minScore!)
      if (filters.minStars) list = list.filter((p) => p.stars >= filters.minStars!)
      if (filters.priceMax) list = list.filter((p) => p.pricePerNight <= filters.priceMax!)
      if (filters.priceMin) list = list.filter((p) => p.pricePerNight >= filters.priceMin!)
      if (filters.amenities?.length) list = list.filter((p) => filters.amenities!.every((a) => p.amenities.includes(a)))
      return { data: list, error: null }
    }
    let q = supabase!.from('properties').select('*').eq('active', true)
    if (filters.city) q = q.or(`city.ilike.%${filters.city}%,name.ilike.%${filters.city}%`)
    if (filters.type && filters.type !== 'todos') q = q.eq('type', filters.type)
    if (filters.minScore) q = q.gte('score', filters.minScore)
    if (filters.minStars) q = q.gte('stars', filters.minStars)
    if (filters.priceMax) q = q.lte('price_per_night', filters.priceMax)
    if (filters.priceMin) q = q.gte('price_per_night', filters.priceMin)
    const { data, error } = await q.order('score', { ascending: false })
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapProperty), error: null }
  },

  async getById(id: string): Promise<{ data: any | null; error: string | null }> {
    if (mock()) {
      await delay(300)
      return { data: PROPERTIES.find((p) => p.id === id) || PROPERTIES[0], error: null }
    }
    const { data, error } = await supabase!.from('properties').select('*').eq('id', id).single()
    if (error) return { data: null, error: error.message }
    return { data: _mapProperty(data), error: null }
  },

  async getRooms(propertyId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(300)
      return { data: ROOMS.filter((r) => r.propertyId === propertyId), error: null }
    }
    const { data, error } = await supabase!.from('rooms').select('*').eq('property_id', propertyId).order('price_per_night')
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapRoom), error: null }
  },

  async getReviews(propertyId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(200)
      return {
        data: [
          { id: '1', reviewer_name: 'Marcos A.', score: 9.5, text: 'Hotel excelente! Vista incrível para o mar, atendimento impecável.', created_at: '2026-09-15' },
          { id: '2', reviewer_name: 'Fernanda C.', score: 8.8, text: 'Ótima localização, quarto confortável e limpo. Recomendo!', created_at: '2026-08-20' },
          { id: '3', reviewer_name: 'Ricardo B.', score: 9.2, text: 'Perfeito para descansar. Equipe muito atenciosa.', created_at: '2026-07-10' },
        ],
        error: null,
      }
    }
    const { data, error } = await supabase!.from('reviews').select('*').eq('property_id', propertyId).order('created_at', { ascending: false }).limit(10)
    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  },

  async submitReview(propertyId: string, userId: string, reviewerName: string, score: number, text: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(700); return { error: null } }
    const { error } = await supabase!.from('reviews').insert([{
      property_id: propertyId, user_id: userId, reviewer_name: reviewerName, score, text,
    }])
    return { error: error?.message || null }
  },
}

// ─── RESERVATION SERVICE ──────────────────────────────────────────────────────
export const reservationService = {
  async getByUser(userId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(500)
      return { data: MOCK_RESERVATIONS, error: null }
    }
    await supabase!.from('reservations').update({
      status: 'cancelled',
      cancellation_reason: 'Pagamento não realizado no prazo de 48 horas',
    }).eq('user_id', userId).eq('status', 'pending_payment').eq('payment_status', 'pending')
      .lte('payment_due_at', new Date().toISOString())
    const { data, error } = await supabase!.from('reservations')
      .select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapReservation), error: null }
  },

  async create(payload: {
    code: string; propertyId: string; propertyName: string; propertyImage: string;
    city: string; roomId?: string; roomName: string; checkIn: string; checkOut: string;
    nights: number; adults: number; children: number; totalValue: number;
    paymentMethod?: string; extras: string[]; guestName: string;
    guestEmail: string; guestPhone: string; specialRequests?: string;
    pricePerNight?: number; fixedCharges?: number;
  }, userId: string): Promise<{ data: any | null; error: string | null }> {
    if (mock()) {
      await delay(1500)
      return {
        data: {
          id: `res_${Date.now()}`, code: payload.code, propertyId: payload.propertyId,
          propertyName: payload.propertyName, propertyImage: payload.propertyImage,
          city: payload.city, roomName: payload.roomName,
          checkIn: ptDate(payload.checkIn), checkOut: ptDate(payload.checkOut),
          nights: payload.nights, guests: payload.adults + payload.children,
          status: 'confirmed', totalValue: payload.totalValue,
          paymentMethod: payload.paymentMethod, paymentStatus: 'Pago (simulação)',
          paymentDueAt: newPaymentDueAt(), pricePerNight: payload.pricePerNight || 0,
          fixedCharges: payload.fixedCharges || 0,
          checkInISO: payload.checkIn, checkOutISO: payload.checkOut,
          adults: payload.adults, children: payload.children,
          specialRequests: payload.specialRequests || '',
          extras: payload.extras,
          createdAt: new Date().toLocaleDateString('pt-BR'),
        },
        error: null,
      }
    }
    const { data, error } = await supabase!.from('reservations').insert([{
      code: payload.code,
      user_id: userId,
      property_id: payload.propertyId,
      property_name: payload.propertyName,
      property_image: payload.propertyImage,
      property_city: payload.city,
      room_id: payload.roomId || null,
      room_name: payload.roomName,
      check_in: payload.checkIn,
      check_out: payload.checkOut,
      nights: payload.nights,
      adults: payload.adults,
      children: payload.children,
      status: 'pending_payment',
      total_value: payload.totalValue,
      price_per_night: payload.pricePerNight || 0,
      fixed_charges: payload.fixedCharges || 0,
      payment_method: payload.paymentMethod,
      payment_status: 'pending',
      payment_due_at: newPaymentDueAt(),
      extras: payload.extras,
      guest_name: payload.guestName,
      guest_email: payload.guestEmail,
      guest_phone: payload.guestPhone,
      special_requests: payload.specialRequests || '',
    }]).select().single()
    if (error) return { data: null, error: error.message }
    return { data: _mapReservation(data), error: null }
  },

  async update(id: string, updates: Record<string, any>, userId: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(500); return { error: null } }
    const fieldMap: Record<string, string> = {
      status: 'status', cancellationReason: 'cancellation_reason',
      checkIn: 'check_in', checkOut: 'check_out', nights: 'nights',
      adults: 'adults', children: 'children', specialRequests: 'special_requests',
      totalValue: 'total_value',
    }
    const dbUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key]) dbUpdates[fieldMap[key]] = value
    }
    const isEdit = ['checkIn', 'checkOut', 'nights', 'adults', 'children', 'specialRequests'].some((key) => key in updates)
    if (isEdit) dbUpdates.payment_due_at = newPaymentDueAt()
    if (Object.keys(dbUpdates).length === 0) return { error: 'Nenhuma alteração permitida foi informada.' }
    let query = supabase!.from('reservations').update(dbUpdates).eq('id', id).eq('user_id', userId)
    if (isEdit) query = query.eq('status', 'pending_payment').eq('payment_status', 'pending')
      .gt('payment_due_at', new Date().toISOString())
    const { data, error } = await query.select('id').maybeSingle()
    if (error) return { error: error.message }
    if (!data) return { error: 'A reserva não está mais editável ou o prazo de pagamento expirou.' }
    return { error: null }
  },

  async cancel(id: string, reason: string, userId: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(400); return { error: null } }
    const { data, error } = await supabase!.from('reservations').update({
      status: 'cancelled', cancellation_reason: reason,
    }).eq('id', id).eq('user_id', userId).eq('status', 'pending_payment')
      .eq('payment_status', 'pending').select('id').maybeSingle()
    if (error) return { error: error.message }
    if (!data) return { error: 'A reserva não está mais pendente ou não pertence a esta conta.' }
    return { error: null }
  },
}

// ─── FAVORITE SERVICE ─────────────────────────────────────────────────────────
export const favoriteService = {
  async getByUser(userId: string): Promise<{ data: string[]; error: string | null }> {
    if (mock()) { await delay(300); return { data: ['p1', 'p3'], error: null } }
    const { data, error } = await supabase!.from('favorites')
      .select('property_id').eq('user_id', userId)
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map((f: any) => f.property_id), error: null }
  },

  async toggle(userId: string, propertyId: string, currentlyFavorited: boolean): Promise<{ data: boolean; error: string | null }> {
    if (mock()) { await delay(200); return { data: !currentlyFavorited, error: null } }
    if (currentlyFavorited) {
      const { error } = await supabase!.from('favorites')
        .delete().eq('user_id', userId).eq('property_id', propertyId)
      return { data: false, error: error?.message || null }
    } else {
      const { error } = await supabase!.from('favorites')
        .insert([{ user_id: userId, property_id: propertyId }])
      return { data: true, error: error?.message || null }
    }
  },
}

// ─── DRIVER SERVICE ───────────────────────────────────────────────────────────
export const driverService = {
  async getByUserId(userId: string): Promise<{ data: any | null; error: string | null }> {
    if (mock()) { await delay(300); return { data: null, error: null } }
    const { data, error } = await supabase!.from('drivers').select('*').eq('user_id', userId).maybeSingle()
    if (error) return { data: null, error: error.message }
    return { data: data ? _mapDriver(data) : null, error: null }
  },

  async listActive(): Promise<{ data: any[]; error: string | null }> {
    if (mock()) { await delay(400); return { data: MOCK_DRIVERS, error: null } }
    const { data, error } = await supabase!.from('drivers').select('*').eq('status', 'active')
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapDriver), error: null }
  },

  async create(userId: string, payload: {
    cpf: string; cnpj?: string; pixKey: string; licenseNumber: string; licenseExpiry: string;
  }): Promise<{ data: any | null; error: string | null }> {
    if (mock()) {
      await delay(800)
      return {
        data: {
          id: `drv_${Date.now()}`, userId,
          cpf: payload.cpf, cnpj: payload.cnpj, pixKey: payload.pixKey,
          licenseNumber: payload.licenseNumber, licenseExpiry: payload.licenseExpiry,
          bio: '', status: 'active', rating: 0, totalRatings: 0, totalTrips: 0,
          createdAt: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        },
        error: null,
      }
    }
    const { data, error } = await supabase!.from('drivers').insert([{
      user_id: userId, cpf: payload.cpf, cnpj: payload.cnpj || null,
      pix_key: payload.pixKey, license_number: payload.licenseNumber,
      license_expiry: payload.licenseExpiry,
    }]).select().single()
    if (error) return { data: null, error: error.message }
    return { data: _mapDriver(data), error: null }
  },

  async update(driverId: string, updates: { bio?: string }): Promise<{ error: string | null }> {
    if (mock()) { await delay(500); return { error: null } }
    const { error } = await supabase!.from('drivers').update(updates).eq('id', driverId)
    return { error: error?.message || null }
  },
}

// ─── CAR SERVICE ──────────────────────────────────────────────────────────────
export const carService = {
  async listByDriver(driverId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(300)
      return { data: MOCK_CARS.filter((c) => c.driverId === driverId), error: null }
    }
    const { data, error } = await supabase!.from('cars').select('*').eq('driver_id', driverId).order('created_at')
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapCar), error: null }
  },

  async listActive(): Promise<{ data: any[]; error: string | null }> {
    if (mock()) { await delay(300); return { data: MOCK_CARS, error: null } }
    const { data, error } = await supabase!.from('cars').select('*, drivers(*)').eq('active', true)
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapCar), error: null }
  },

  async create(driverId: string, payload: {
    brand: string; model: string; year: number; plate: string; color: string;
    category: string; capacity: number; features: string[]; images: string[];
    pricePerKm: number; minFare: number;
  }): Promise<{ data: any | null; error: string | null }> {
    if (mock()) {
      await delay(700)
      return {
        data: { id: `car_${Date.now()}`, driverId, ...payload, active: true },
        error: null,
      }
    }
    const { data, error } = await supabase!.from('cars').insert([{
      driver_id: driverId, brand: payload.brand, model: payload.model, year: payload.year,
      plate: payload.plate, color: payload.color, category: payload.category,
      capacity: payload.capacity, features: payload.features, images: payload.images,
      price_per_km: payload.pricePerKm, min_fare: payload.minFare,
    }]).select().single()
    if (error) return { data: null, error: error.message }
    return { data: _mapCar(data), error: null }
  },

  async update(carId: string, driverId: string, updates: Partial<{
    brand: string; model: string; year: number; plate: string; color: string;
    category: string; capacity: number; features: string[]; images: string[];
    pricePerKm: number; minFare: number; active: boolean;
  }>): Promise<{ error: string | null }> {
    if (mock()) { await delay(500); return { error: null } }
    const dbUpdates: Record<string, any> = {}
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand
    if (updates.model !== undefined) dbUpdates.model = updates.model
    if (updates.year !== undefined) dbUpdates.year = updates.year
    if (updates.plate !== undefined) dbUpdates.plate = updates.plate
    if (updates.color !== undefined) dbUpdates.color = updates.color
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity
    if (updates.features !== undefined) dbUpdates.features = updates.features
    if (updates.images !== undefined) dbUpdates.images = updates.images
    if (updates.pricePerKm !== undefined) dbUpdates.price_per_km = updates.pricePerKm
    if (updates.minFare !== undefined) dbUpdates.min_fare = updates.minFare
    if (updates.active !== undefined) dbUpdates.active = updates.active
    const { error } = await supabase!.from('cars').update(dbUpdates).eq('id', carId).eq('driver_id', driverId)
    return { error: error?.message || null }
  },

  async delete(carId: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(400); return { error: null } }
    const { error } = await supabase!.from('cars').delete().eq('id', carId)
    return { error: error?.message || null }
  },
}

// ─── TAXI SERVICE ─────────────────────────────────────────────────────────────
export const taxiService = {
  async getByGuest(guestId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(400)
      return { data: MOCK_TAXI_BOOKINGS.filter((tb) => tb.guestId === guestId || guestId === 'demo_user' || guestId.startsWith('proto_')), error: null }
    }
    await supabase!.from('taxi_bookings').update({
      status: 'cancelled',
      cancellation_reason: 'Pagamento não realizado no prazo de 48 horas',
    }).eq('guest_id', guestId).eq('status', 'pending_payment').eq('payment_status', 'pending')
      .lte('payment_due_at', new Date().toISOString())
    const { data, error } = await supabase!.from('taxi_bookings').select('*')
      .eq('guest_id', guestId).order('created_at', { ascending: false })
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapTaxiBooking), error: null }
  },

  async getByDriver(driverId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(400)
      return { data: MOCK_TAXI_BOOKINGS.filter((tb) => tb.driverId === driverId), error: null }
    }
    const { data, error } = await supabase!.from('taxi_bookings').select('*')
      .eq('driver_id', driverId).order('created_at', { ascending: false })
    if (error) return { data: [], error: error.message }
    return { data: (data || []).map(_mapTaxiBooking), error: null }
  },

  async create(payload: {
    guestId: string; guestName: string; driverId: string; driverName: string;
    carId: string; carInfo: string; origin: string; destination: string;
    scheduledDate: string; scheduledTime: string; passengers: number;
    estimatedKm: number; totalValue: number; paymentMethod: string; notes?: string;
  }): Promise<{ data: any | null; error: string | null }> {
    const code = `TX-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`
    if (mock()) {
      await delay(1200)
      return {
        data: {
          id: `tb_${Date.now()}`, code, ...payload,
          scheduledDate: payload.scheduledDate.includes('/') ? payload.scheduledDate
            : new Date(payload.scheduledDate + 'T12:00:00').toLocaleDateString('pt-BR'),
          status: 'confirmed', paymentStatus: 'Pago (simulação)', paymentDueAt: newPaymentDueAt(),
          scheduledDateISO: payload.scheduledDate, createdAt: new Date().toLocaleDateString('pt-BR'),
        },
        error: null,
      }
    }
    const { data, error } = await supabase!.from('taxi_bookings').insert([{
      code, guest_id: payload.guestId, guest_name: payload.guestName,
      driver_id: payload.driverId, car_id: payload.carId,
      origin: payload.origin, destination: payload.destination,
      scheduled_date: payload.scheduledDate, scheduled_time: payload.scheduledTime,
      passengers: payload.passengers, estimated_km: payload.estimatedKm,
      total_value: payload.totalValue, payment_method: payload.paymentMethod,
      status: 'pending_payment', payment_status: 'pending',
      payment_due_at: newPaymentDueAt(),
      notes: payload.notes || '',
    }]).select().single()
    if (error) return { data: null, error: error.message }
    return { data: _mapTaxiBooking({ ...data, driver_name: payload.driverName, car_info: payload.carInfo }), error: null }
  },

  async updateStatus(id: string, status: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(400); return { error: null } }
    const { error } = await supabase!.from('taxi_bookings').update({ status }).eq('id', id)
    return { error: error?.message || null }
  },

  async updateByGuest(id: string, updates: Record<string, any>, guestId: string): Promise<{ data: any | null; error: string | null }> {
    if (mock()) { await delay(400); return { data: null, error: null } }
    const fieldMap: Record<string, string> = {
      origin: 'origin', destination: 'destination', scheduledDate: 'scheduled_date',
      scheduledTime: 'scheduled_time', passengers: 'passengers', notes: 'notes',
    }
    const dbUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key]) dbUpdates[fieldMap[key]] = value
    }
    if (Object.keys(dbUpdates).length === 0) return { data: null, error: 'Nenhuma alteração permitida foi informada.' }
    dbUpdates.payment_due_at = newPaymentDueAt()
    const { data, error } = await supabase!.from('taxi_bookings').update(dbUpdates)
      .eq('id', id).eq('guest_id', guestId).eq('status', 'pending_payment')
      .eq('payment_status', 'pending').gt('payment_due_at', new Date().toISOString())
      .select('*').single()
    if (error) return { data: null, error: error.message }
    return { data: _mapTaxiBooking(data), error: null }
  },

  async cancelByGuest(id: string, reason: string, guestId: string): Promise<{ error: string | null }> {
    if (mock()) { await delay(400); return { error: null } }
    const { data, error } = await supabase!.from('taxi_bookings').update({
      status: 'cancelled', cancellation_reason: reason,
    }).eq('id', id).eq('guest_id', guestId).eq('status', 'pending_payment')
      .eq('payment_status', 'pending').select('id').maybeSingle()
    if (error) return { error: error.message }
    if (!data) return { error: 'O pedido não está mais pendente ou não pertence a esta conta.' }
    return { error: null }
  },
}

// ─── DRIVER REVIEW SERVICE ────────────────────────────────────────────────────
export const driverReviewService = {
  async create(payload: {
    taxiBookingId: string; reviewerId: string; reviewerName: string;
    driverId: string; carId?: string; stars: number; text: string;
  }): Promise<{ error: string | null }> {
    if (mock()) { await delay(600); return { error: null } }
    const { error } = await supabase!.from('driver_reviews').insert([{
      taxi_booking_id: payload.taxiBookingId, reviewer_id: payload.reviewerId,
      driver_id: payload.driverId, car_id: payload.carId || null,
      stars: payload.stars, text: payload.text,
    }])
    return { error: error?.message || null }
  },

  async getByDriver(driverId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(300)
      return { data: MOCK_DRIVER_REVIEWS.filter((r) => r.driverId === driverId), error: null }
    }
    const { data, error } = await supabase!.from('driver_reviews').select('*')
      .eq('driver_id', driverId).order('created_at', { ascending: false })
    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  },

  async hasReviewed(taxiBookingId: string, reviewerId: string): Promise<boolean> {
    if (mock()) return false
    const { data } = await supabase!.from('driver_reviews').select('id')
      .eq('taxi_booking_id', taxiBookingId).eq('reviewer_id', reviewerId).maybeSingle()
    return !!data
  },
}

// ─── GUEST REVIEW SERVICE ─────────────────────────────────────────────────────
export const guestReviewService = {
  async create(payload: {
    taxiBookingId: string; reviewerId: string;
    guestId: string; stars: number; text: string;
  }): Promise<{ error: string | null }> {
    if (mock()) { await delay(600); return { error: null } }
    const { error } = await supabase!.from('guest_reviews').insert([{
      taxi_booking_id: payload.taxiBookingId, reviewer_id: payload.reviewerId,
      guest_id: payload.guestId, stars: payload.stars, text: payload.text,
    }])
    return { error: error?.message || null }
  },

  async getByDriver(driverId: string): Promise<{ data: any[]; error: string | null }> {
    if (mock()) {
      await delay(300)
      return { data: MOCK_GUEST_REVIEWS.filter((r) => r.reviewerId === driverId), error: null }
    }
    const { data, error } = await supabase!.from('guest_reviews').select('*')
      .eq('reviewer_id', driverId).order('created_at', { ascending: false })
    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  },

  async hasReviewed(taxiBookingId: string, reviewerId: string): Promise<boolean> {
    if (mock()) return false
    const { data } = await supabase!.from('guest_reviews').select('id')
      .eq('taxi_booking_id', taxiBookingId).eq('reviewer_id', reviewerId).maybeSingle()
    return !!data
  },
}

// ─── STORAGE SERVICE ──────────────────────────────────────────────────────────
export const storageService = {
  async upload(file: File, folder: string = 'uploads'): Promise<string | null> {
    if (mock()) {
      // Modo simulado: converte para base64 para preview local
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve((e.target?.result as string) ?? null)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    }
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase!.storage.from('hospedaqui').upload(safeName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })
      if (error || !data) return null
      const { data: urlData } = supabase!.storage.from('hospedaqui').getPublicUrl(data.path)
      return urlData.publicUrl || null
    } catch {
      return null
    }
  },

  async remove(publicUrl: string): Promise<void> {
    if (mock()) return
    try {
      const path = publicUrl.split('/hospedaqui/')[1]
      if (path) await supabase!.storage.from('hospedaqui').remove([path])
    } catch {}
  },
}

// ─── Mappers (Supabase → app format) ─────────────────────────────────────────
function _mapProperty(p: any) {
  return {
    id: p.id, name: p.name, type: p.type, location: p.location,
    city: p.city, state: p.state, stars: p.stars,
    score: parseFloat(p.score), reviews: p.reviews_count, scoreLabel: p.score_label,
    pricePerNight: parseFloat(p.price_per_night),
    originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
    images: p.images || [], amenities: p.amenities || [],
    description: p.description || '',
    checkIn: p.check_in_time, checkOut: p.check_out_time,
    cancellation: p.cancellation_policy || '', policies: p.payment_policy || '',
    badge: p.badge, highlight: p.highlight,
  }
}

function _mapRoom(r: any) {
  return {
    id: r.id, propertyId: r.property_id, name: r.name,
    capacity: r.capacity, beds: r.beds, size: r.size_sqm,
    pricePerNight: parseFloat(r.price_per_night),
    amenities: r.amenities || [], available: r.available,
    image: r.image_url || '', cancellable: r.cancellable,
  }
}

function _mapReservation(r: any) {
  const totalValue = parseFloat(r.total_value || '0')
  const nights = Number(r.nights || 1)
  const fixedCharges = Number(r.fixed_charges || 0)
  const storedRate = Number(r.price_per_night || 0)
  const pricePerNight = storedRate > 0
    ? storedRate
    : Math.max(0, (totalValue - fixedCharges) / (nights * 1.12))
  return {
    id: r.id, code: r.code, propertyId: r.property_id,
    propertyName: r.property_name, propertyImage: r.property_image || '',
    city: r.property_city, roomName: r.room_name,
    checkIn: ptDate(r.check_in), checkOut: ptDate(r.check_out),
    checkInISO: r.check_in, checkOutISO: r.check_out,
    nights, adults: r.adults || 2, children: r.children || 0,
    guests: (r.adults || 2) + (r.children || 0),
    status: r.status, totalValue,
    paymentMethod: r.payment_method || '', paymentStatus: r.payment_status || '',
    paymentDueAt: r.payment_due_at, pricePerNight, fixedCharges,
    extras: r.extras || [],
    createdAt: ptDate(r.created_at),
    specialRequests: r.special_requests || '',
    cancellationReason: r.cancellation_reason,
  }
}

async function _getProfile(userId: string) {
  if (!supabase) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!data) return { id: userId, name: '', phone: '', cpf: '***.***.***-**', preferences: {}, createdAt: '' }
  return {
    id: data.id, name: data.name || '', phone: data.phone || '',
    cpf: '***.***.***-**', avatar: data.avatar_url,
    preferences: data.preferences || {},
    createdAt: new Date(data.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  }
}

function _mapAuthError(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
    'User already registered': 'Este e-mail já está cadastrado. Tente entrar.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Formato de e-mail inválido.',
    'signup is disabled': 'Cadastros desabilitados temporariamente.',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  }
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val
  }
  return msg
}

function _mapDriver(d: any) {
  return {
    id: d.id, userId: d.user_id, cpf: d.cpf || '***.***.***-**',
    cnpj: d.cnpj, pixKey: d.pix_key, licenseNumber: d.license_number,
    licenseExpiry: d.license_expiry, bio: d.bio || '',
    status: d.status || 'active', rating: parseFloat(d.rating || '0'),
    totalRatings: d.total_ratings || 0, totalTrips: d.total_trips || 0,
    createdAt: d.created_at ? new Date(d.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '',
  }
}

function _mapCar(c: any) {
  return {
    id: c.id, driverId: c.driver_id, brand: c.brand, model: c.model, year: c.year,
    plate: c.plate, color: c.color, category: c.category || 'economy',
    capacity: c.capacity || 4, features: c.features || [], images: c.images || [],
    pricePerKm: parseFloat(c.price_per_km || '2.50'),
    minFare: parseFloat(c.min_fare || '15.00'), active: c.active !== false,
  }
}

function _mapTaxiBooking(tb: any) {
  return {
    id: tb.id, code: tb.code, guestId: tb.guest_id, guestName: tb.guest_name || '',
    driverId: tb.driver_id, driverName: tb.driver_name || '',
    carId: tb.car_id, carInfo: tb.car_info || '',
    origin: tb.origin, destination: tb.destination,
    scheduledDate: tb.scheduled_date?.includes('/') ? tb.scheduled_date : ptDate(tb.scheduled_date),
    scheduledDateISO: tb.scheduled_date?.includes('/') ? undefined : tb.scheduled_date,
    scheduledTime: tb.scheduled_time?.substring(0, 5) || '',
    passengers: tb.passengers || 1, estimatedKm: parseFloat(tb.estimated_km || '10'),
    totalValue: parseFloat(tb.total_value || '0'), status: tb.status || 'confirmed',
    paymentMethod: tb.payment_method || '', paymentStatus: tb.payment_status || 'pending',
    paymentDueAt: tb.payment_due_at, cancellationReason: tb.cancellation_reason, notes: tb.notes,
    createdAt: tb.created_at ? ptDate(tb.created_at) : new Date().toLocaleDateString('pt-BR'),
  }
}
