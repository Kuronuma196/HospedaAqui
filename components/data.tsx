// ─── Mock Data Layer ───────────────────────────────────────────────────────
// Todos os dados são fictícios para fins de demonstração (protótipo).

export const IMGS = {
  hotelExterior: "https://images.unsplash.com/photo-1593349480374-01bb7d5782d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  hotelRoom: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  beachResort: "https://images.unsplash.com/photo-1612900631807-6e32af134ff7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  poolTerrace: "https://images.unsplash.com/photo-1649825420262-f765e1c602c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  apartment: "https://images.unsplash.com/photo-1774716926071-fc03e73d0806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  chalet: "https://images.unsplash.com/photo-1740906574432-4195b969ef24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  infinityPool: "https://images.unsplash.com/photo-1769149255670-aa0ad6428dd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  gramado: "https://images.unsplash.com/photo-1621693247912-767f47a3c382?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  fortaleza: "https://images.unsplash.com/photo-1560971923-16c232d1ee89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  bathroom: "https://images.unsplash.com/photo-1651513825857-9fda9d5729fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  airplane: "https://images.unsplash.com/photo-1543797414-a0c3ad076f7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  rio: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  salvador: "https://images.unsplash.com/photo-1569556420157-6030491766d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  floripa: "https://images.unsplash.com/photo-1771195816882-63c48edeed96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  saopaulo: "https://images.unsplash.com/photo-1583788758158-7a28a8c989ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  manaus: "https://images.unsplash.com/photo-1600753822622-f37337da2d19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
};

export type Property = {
  id: string; name: string; type: string; location: string; city: string; state: string;
  stars: number; score: number; reviews: number; scoreLabel: string;
  pricePerNight: number; originalPrice?: number; images: string[];
  amenities: string[]; lat: number; lng: number; description: string;
  checkIn: string; checkOut: string; policies: string; cancellation: string;
  badge?: string; highlight?: string;
};

export type Room = {
  id: string; propertyId: string; name: string; capacity: number;
  beds: string; size: number; pricePerNight: number; amenities: string[];
  available: boolean; image: string; cancellable: boolean;
};

export const PROPERTIES: Property[] = [
  {
    id: "p1", name: "Grand Blue Hotel", type: "Hotel", location: "Av. Atlântica, 2000, Copacabana",
    city: "Rio de Janeiro", state: "RJ", stars: 5, score: 9.2, reviews: 1423, scoreLabel: "Excepcional",
    pricePerNight: 520, originalPrice: 680, images: [IMGS.hotelExterior, IMGS.hotelRoom, IMGS.bathroom, IMGS.infinityPool],
    amenities: ["Wi-Fi grátis","Piscina","Academia","Spa","Restaurante","Estacionamento","Ar-condicionado","Recepção 24h","Café da manhã","Vista para o mar","Pet friendly","Acessibilidade"],
    lat: -22.97, lng: -43.18, description: "O Grand Blue Hotel oferece uma experiência cinco estrelas no coração de Copacabana. Com vista privilegiada para o Atlântico, quartos espaçosos e serviços de alto padrão, é a escolha ideal para viajantes que buscam conforto e sofisticação.",
    checkIn: "14:00", checkOut: "12:00", policies: "Pagamento na chegada aceito. Cartão de crédito obrigatório para garantia.",
    cancellation: "Cancelamento gratuito até 48h antes do check-in.", badge: "Mais popular",
  },
  {
    id: "p2", name: "Pousada Mar Azul", type: "Pousada", location: "Rua das Flores, 45, Porto da Barra",
    city: "Salvador", state: "BA", stars: 4, score: 8.7, reviews: 876, scoreLabel: "Ótimo",
    pricePerNight: 290, images: [IMGS.beachResort, IMGS.poolTerrace, IMGS.hotelRoom, IMGS.bathroom],
    amenities: ["Wi-Fi grátis","Piscina","Café da manhã","Estacionamento","Ar-condicionado","Vista para o mar"],
    lat: -12.97, lng: -38.51, description: "Pousada charmosa na Porto da Barra com café da manhã tropical incluído e vista deslumbrante para o Atlântico.",
    checkIn: "14:00", checkOut: "11:00", policies: "Pagamento antecipado de 50% na reserva.",
    cancellation: "Cancelamento sem custo até 72h antes.", highlight: "Café da manhã incluso",
  },
  {
    id: "p3", name: "Chalé da Serra Premium", type: "Chalé", location: "Estrada da Uva, Km 5",
    city: "Gramado", state: "RS", stars: 4, score: 9.5, reviews: 642, scoreLabel: "Excepcional",
    pricePerNight: 380, originalPrice: 450, images: [IMGS.chalet, IMGS.apartment, IMGS.bathroom, IMGS.hotelRoom],
    amenities: ["Wi-Fi grátis","Lareira","Hidromassagem","Café da manhã","Estacionamento","Vista para montanha","Aquecimento"],
    lat: -29.37, lng: -50.87, description: "Chalé romântico na Serra Gaúcha com lareira, hidromassagem e café da manhã colonial. Ideal para casais.",
    checkIn: "15:00", checkOut: "12:00", policies: "Pagamento 100% antecipado.",
    cancellation: "Não reembolsável.", badge: "Avaliação 9.5",
  },
  {
    id: "p4", name: "Resort Praia de Iracema", type: "Resort", location: "Av. Beira Mar, 4500",
    city: "Fortaleza", state: "CE", stars: 5, score: 8.9, reviews: 1102, scoreLabel: "Ótimo",
    pricePerNight: 680, images: [IMGS.infinityPool, IMGS.beachResort, IMGS.hotelRoom, IMGS.bathroom],
    amenities: ["Wi-Fi grátis","Piscina","Academia","Spa","Restaurante","All inclusive","Praia privativa","Animação","Quadra esportiva"],
    lat: -3.73, lng: -38.52, description: "Resort all-inclusive premium em Fortaleza com acesso direto à praia, piscinas externas e entretenimento diário.",
    checkIn: "14:00", checkOut: "12:00", policies: "All-inclusive inclui refeições, bebidas e atividades.",
    cancellation: "Cancelamento gratuito até 7 dias antes.", highlight: "All-inclusive",
  },
  {
    id: "p5", name: "Flat Moderno Paulista", type: "Flat", location: "Rua Augusta, 1200, Jardins",
    city: "São Paulo", state: "SP", stars: 3, score: 8.3, reviews: 534, scoreLabel: "Muito bom",
    pricePerNight: 210, images: [IMGS.apartment, IMGS.hotelRoom, IMGS.bathroom, IMGS.poolTerrace],
    amenities: ["Wi-Fi grátis","Academia","Lavanderia","Cozinha","Ar-condicionado","Recepção 24h","Área de trabalho"],
    lat: -23.56, lng: -46.65, description: "Flat moderno e funcional no coração de São Paulo. Ideal para viagens corporativas e estadias prolongadas.",
    checkIn: "14:00", checkOut: "11:00", policies: "Depósito de segurança de R$ 200.",
    cancellation: "Cancelamento gratuito até 24h antes.",
  },
  {
    id: "p6", name: "Eco Pousada Floripa", type: "Pousada", location: "Rua Lauro Linhares, 500, Trindade",
    city: "Florianópolis", state: "SC", stars: 3, score: 8.6, reviews: 388, scoreLabel: "Ótimo",
    pricePerNight: 245, images: [IMGS.floripa, IMGS.beachResort, IMGS.hotelRoom, IMGS.bathroom],
    amenities: ["Wi-Fi grátis","Café da manhã","Estacionamento","Bicicleta","Área verde"],
    lat: -27.60, lng: -48.54, description: "Pousada ecológica perto das melhores praias de Florianópolis com café da manhã artesanal.",
    checkIn: "13:00", checkOut: "11:00", policies: "Apenas cartão de débito ou pix.",
    cancellation: "Cancelamento sem custo até 48h antes.",
  },
];

export const ROOMS: Room[] = [
  { id: "r1", propertyId: "p1", name: "Standard Vista Mar", capacity: 2, beds: "1 cama king", size: 28, pricePerNight: 520, amenities: ["TV","Ar-condicionado","Frigobar","Cofre"], available: true, image: IMGS.hotelRoom, cancellable: true },
  { id: "r2", propertyId: "p1", name: "Superior Deluxe", capacity: 2, beds: "1 cama king + sofá", size: 36, pricePerNight: 680, amenities: ["TV","Ar-condicionado","Frigobar","Cofre","Banheira"], available: true, image: IMGS.bathroom, cancellable: true },
  { id: "r3", propertyId: "p1", name: "Suite Presidencial", capacity: 4, beds: "2 camas queen", size: 55, pricePerNight: 1100, amenities: ["TV","Ar-condicionado","Frigobar","Cofre","Jacuzzi","Sala de estar"], available: false, image: IMGS.infinityPool, cancellable: false },
  { id: "r4", propertyId: "p2", name: "Quarto Casal Vista Mar", capacity: 2, beds: "1 cama casal", size: 22, pricePerNight: 290, amenities: ["TV","Ar-condicionado","Varanda"], available: true, image: IMGS.hotelRoom, cancellable: true },
  { id: "r5", propertyId: "p3", name: "Chalé Completo", capacity: 4, beds: "1 king + 2 solteiros", size: 45, pricePerNight: 380, amenities: ["Lareira","TV","Hidromassagem","Cozinha"], available: true, image: IMGS.chalet, cancellable: false },
  { id: "r6", propertyId: "p4", name: "Suíte Beira-Mar", capacity: 2, beds: "1 king", size: 32, pricePerNight: 680, amenities: ["TV","Ar-condicionado","Varanda","Vista mar"], available: true, image: IMGS.beachResort, cancellable: true },
];

export const DESTINATIONS = [
  { id: "d1", name: "Rio de Janeiro", state: "RJ", count: 4821, image: IMGS.rio },
  { id: "d2", name: "Salvador", state: "BA", count: 2347, image: IMGS.salvador },
  { id: "d3", name: "Florianópolis", state: "SC", count: 1932, image: IMGS.floripa },
  { id: "d4", name: "São Paulo", state: "SP", count: 6105, image: IMGS.saopaulo },
  { id: "d5", name: "Fortaleza", state: "CE", count: 1550, image: IMGS.fortaleza },
  { id: "d6", name: "Gramado", state: "RS", count: 987, image: IMGS.gramado },
];

export type Reservation = {
  id: string; code: string; propertyId: string; propertyName: string; propertyImage: string;
  city: string; roomName: string; checkIn: string; checkOut: string; nights: number;
  guests: number; status: "pending_payment"|"awaiting_confirmation"|"confirmed"|"cancelled"|"completed";
  totalValue: number; paymentMethod: string; paymentStatus: string; createdAt: string;
  extras: string[]; cancellationReason?: string; paymentDueAt?: string;
  checkInISO?: string; checkOutISO?: string; adults?: number; children?: number;
  pricePerNight?: number; fixedCharges?: number; specialRequests?: string;
};

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "res1", code: "HSP-2026-00412", propertyId: "p1", propertyName: "Grand Blue Hotel",
    propertyImage: IMGS.hotelExterior, city: "Rio de Janeiro, RJ",
    roomName: "Standard Vista Mar", checkIn: "15/11/2026", checkOut: "18/11/2026",
    nights: 3, guests: 2, status: "confirmed", totalValue: 1620,
    paymentMethod: "Cartão de crédito (final 4521)", paymentStatus: "Pago",
    createdAt: "01/10/2026", extras: ["Café da manhã", "Traslado aeroporto"],
  },
  {
    id: "res2", code: "HSP-2026-00398", propertyId: "p3", propertyName: "Chalé da Serra Premium",
    propertyImage: IMGS.chalet, city: "Gramado, RS",
    roomName: "Chalé Completo", checkIn: "20/12/2026", checkOut: "25/12/2026",
    nights: 5, guests: 2, status: "pending_payment", totalValue: 1950,
    paymentMethod: "Pendente", paymentStatus: "A pagar",
    createdAt: "28/09/2026", extras: [],
  },
  {
    id: "res3", code: "HSP-2026-00312", propertyId: "p2", propertyName: "Pousada Mar Azul",
    propertyImage: IMGS.beachResort, city: "Salvador, BA",
    roomName: "Quarto Casal Vista Mar", checkIn: "10/08/2026", checkOut: "14/08/2026",
    nights: 4, guests: 2, status: "completed", totalValue: 1200,
    paymentMethod: "PIX", paymentStatus: "Pago",
    createdAt: "15/07/2026", extras: ["Café da manhã"],
  },
  {
    id: "res4", code: "HSP-2026-00289", propertyId: "p4", propertyName: "Resort Praia de Iracema",
    propertyImage: IMGS.infinityPool, city: "Fortaleza, CE",
    roomName: "Suíte Beira-Mar", checkIn: "05/07/2026", checkOut: "07/07/2026",
    nights: 2, guests: 2, status: "cancelled", totalValue: 1400,
    paymentMethod: "Cartão de crédito", paymentStatus: "Estornado",
    createdAt: "01/06/2026", extras: [], cancellationReason: "Solicitado pelo hóspede",
  },
];

export type Flight = {
  id: string; airline: string; from: string; to: string; fromCity: string; toCity: string;
  departure: string; arrival: string; duration: string; stops: number; price: number;
  baggage: string; seats: number;
};

export const MOCK_FLIGHTS: Flight[] = [
  { id: "f1", airline: "LATAM", from: "GRU", to: "SDU", fromCity: "São Paulo", toCity: "Rio de Janeiro", departure: "07:00", arrival: "08:05", duration: "1h05m", stops: 0, price: 380, baggage: "23kg", seats: 8 },
  { id: "f2", airline: "Gol", from: "GRU", to: "SDU", fromCity: "São Paulo", toCity: "Rio de Janeiro", departure: "10:30", arrival: "11:50", duration: "1h20m", stops: 0, price: 295, baggage: "10kg", seats: 14 },
  { id: "f3", airline: "Azul", from: "GRU", to: "CNF", fromCity: "São Paulo", toCity: "Belo Horizonte", departure: "06:15", arrival: "07:30", duration: "1h15m", stops: 0, price: 265, baggage: "23kg", seats: 3 },
  { id: "f4", airline: "LATAM", from: "GRU", to: "FOR", fromCity: "São Paulo", toCity: "Fortaleza", departure: "08:00", arrival: "11:40", duration: "3h40m", stops: 0, price: 620, baggage: "23kg", seats: 5 },
];

export const DEMO_USER = {
  id: "u1", name: "Ana Carolina Silva", email: "ana.carolina@email.com.br",
  phone: "+55 (11) 98765-4321", cpf: "***.***.***-**",
  avatar: null, createdAt: "março de 2024",
  preferences: { language: "Português (BR)", currency: "BRL", notifications: true },
};

export const PROPERTY_TYPES = ["Hotel","Pousada","Apartamento","Chalé","Resort","Flat","Hostel","Casa"];
export const AMENITY_LIST = ["Wi-Fi grátis","Piscina","Academia","Spa","Restaurante","Estacionamento","Ar-condicionado","Café da manhã","Pet friendly","Acessibilidade","Recepção 24h","Lavanderia","Vista para o mar","Cozinha"];

// ─── MOTORISTAS ───────────────────────────────────────────────────────────────

export type DriverProfile = {
  id: string; userId: string; name: string; email: string; phone: string;
  cpf: string; cnpj?: string; pixKey: string; licenseNumber: string; licenseExpiry: string;
  bio: string; status: 'active' | 'pending' | 'suspended';
  rating: number; totalRatings: number; totalTrips: number; createdAt: string;
};

export type Car = {
  id: string; driverId: string; brand: string; model: string; year: number;
  plate: string; color: string;
  category: 'economy' | 'comfort' | 'suv' | 'van' | 'luxury';
  capacity: number; features: string[]; images: string[];
  pricePerKm: number; minFare: number; active: boolean;
};

export type TaxiBooking = {
  id: string; code: string; guestId: string; guestName: string;
  driverId: string; driverName: string; carId: string; carInfo: string;
  origin: string; destination: string; scheduledDate: string; scheduledTime: string;
  passengers: number; estimatedKm: number; totalValue: number;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentMethod: string; notes?: string; createdAt: string;
};

export type DriverReview = {
  id: string; taxiBookingId: string; reviewerId: string; reviewerName: string;
  driverId: string; carId?: string; stars: number; text: string; createdAt: string;
};

export type GuestReview = {
  id: string; taxiBookingId: string; reviewerId: string; // driverId
  driverName: string; guestId: string; stars: number; text: string; createdAt: string;
};

export const CAR_CATEGORIES: Record<string, { label: string; desc: string; icon: string }> = {
  economy: { label: 'Econômico', desc: 'Ideal para trajetos curtos', icon: '🚗' },
  comfort: { label: 'Conforto', desc: 'Veículo mais espaçoso e confortável', icon: '🚙' },
  suv:     { label: 'SUV', desc: 'Espaço extra para bagagens e grupo', icon: '🚐' },
  van:     { label: 'Van', desc: 'Até 7 passageiros', icon: '🚌' },
  luxury:  { label: 'Luxo', desc: 'Experiência premium', icon: '🏎️' },
};

export const MOCK_DRIVERS: DriverProfile[] = [
  {
    id: 'drv1', userId: 'drv_user1', name: 'Carlos Eduardo Silva',
    email: 'carlos.silva@email.com', phone: '(11) 98877-6655',
    cpf: '***.***.***-**', cnpj: '12.345.678/0001-99',
    pixKey: 'carlos.silva@email.com', licenseNumber: 'AB123456789', licenseExpiry: '2028-03-15',
    bio: 'Motorista profissional há 8 anos. Pontual, educado e conforto garantido em todos os trajetos.',
    status: 'active', rating: 4.9, totalRatings: 234, totalTrips: 867, createdAt: 'março de 2024',
  },
  {
    id: 'drv2', userId: 'drv_user2', name: 'Ana Paula Ferreira',
    email: 'ana.ferreira@email.com', phone: '(21) 97766-5544',
    cpf: '***.***.***-**', cnpj: undefined,
    pixKey: '(21) 97766-5544', licenseNumber: 'CD987654321', licenseExpiry: '2027-08-20',
    bio: 'Motorista certificada com foco em segurança e bem-estar dos passageiros.',
    status: 'active', rating: 4.7, totalRatings: 128, totalTrips: 412, createdAt: 'julho de 2024',
  },
  {
    id: 'drv3', userId: 'drv_user3', name: 'Roberto Nascimento',
    email: 'roberto.nasc@email.com', phone: '(41) 99988-7766',
    cpf: '***.***.***-**', cnpj: '98.765.432/0001-11',
    pixKey: '123.456.789-00', licenseNumber: 'EF246810121', licenseExpiry: '2029-11-30',
    bio: 'Especialista em traslados aeroporto e turismo. Falo inglês e espanhol.',
    status: 'active', rating: 4.8, totalRatings: 311, totalTrips: 623, createdAt: 'janeiro de 2024',
  },
];

export const MOCK_CARS: Car[] = [
  {
    id: 'car1', driverId: 'drv1', brand: 'Toyota', model: 'Corolla', year: 2023,
    plate: 'BRA-2E19', color: 'Prata', category: 'comfort', capacity: 4,
    features: ['Ar-condicionado', 'Wi-Fi', 'Carregador USB', 'Água mineral'],
    images: ['https://images.unsplash.com/photo-1587350811536-a8b462a5c081?w=800'],
    pricePerKm: 3.20, minFare: 25.00, active: true,
  },
  {
    id: 'car2', driverId: 'drv2', brand: 'Hyundai', model: 'HB20', year: 2022,
    plate: 'MNO-5K44', color: 'Branco', category: 'economy', capacity: 4,
    features: ['Ar-condicionado', 'Carregador USB'],
    images: ['https://images.unsplash.com/photo-1763268265028-1631360c07dd?w=800'],
    pricePerKm: 2.50, minFare: 18.00, active: true,
  },
  {
    id: 'car3', driverId: 'drv3', brand: 'Chevrolet', model: 'TrailBlazer', year: 2023,
    plate: 'XYZ-7J88', color: 'Preto', category: 'suv', capacity: 7,
    features: ['Ar-condicionado', 'Wi-Fi', 'Carregador USB', 'Água mineral', 'Porta-malas amplo'],
    images: ['https://images.unsplash.com/photo-1735620731955-b047a7122892?w=800'],
    pricePerKm: 4.50, minFare: 35.00, active: true,
  },
];

export const MOCK_TAXI_BOOKINGS: TaxiBooking[] = [
  {
    id: 'tb1', code: 'TX-2026-00451', guestId: 'demo_user', guestName: 'Usuário Demo',
    driverId: 'drv1', driverName: 'Carlos Eduardo Silva',
    carId: 'car1', carInfo: 'Toyota Corolla 2023 — BRA-2E19 (Prata)',
    origin: 'Aeroporto Internacional de Guarulhos (GRU)', destination: 'Grand Blue Hotel — Copacabana, RJ',
    scheduledDate: '15/11/2026', scheduledTime: '10:30', passengers: 2,
    estimatedKm: 22, totalValue: 95.40, status: 'confirmed',
    paymentMethod: 'PIX', createdAt: '01/11/2026',
  },
  {
    id: 'tb2', code: 'TX-2026-00389', guestId: 'demo_user', guestName: 'Usuário Demo',
    driverId: 'drv2', driverName: 'Ana Paula Ferreira',
    carId: 'car2', carInfo: 'Hyundai HB20 2022 — MNO-5K44 (Branco)',
    origin: 'Chalé da Serra Premium', destination: 'Aeroporto Salgado Filho (POA)',
    scheduledDate: '25/12/2026', scheduledTime: '08:00', passengers: 1,
    estimatedKm: 115, totalValue: 305.00, status: 'confirmed',
    paymentMethod: 'Cartão de crédito', createdAt: '28/10/2026',
  },
];

export const MOCK_DRIVER_REVIEWS: DriverReview[] = [
  {
    id: 'dr1', taxiBookingId: 'tb_old1', reviewerId: 'u_guest1', reviewerName: 'Mariana S.',
    driverId: 'drv1', carId: 'car1', stars: 5,
    text: 'Motorista muito educado e pontual. Carro limpo e confortável!', createdAt: '10/10/2026',
  },
  {
    id: 'dr2', taxiBookingId: 'tb_old2', reviewerId: 'u_guest2', reviewerName: 'Felipe A.',
    driverId: 'drv1', carId: 'car1', stars: 5,
    text: 'Excelente. Wi-Fi no carro foi um diferencial. Super recomendo!', createdAt: '05/10/2026',
  },
];

export const MOCK_GUEST_REVIEWS: GuestReview[] = [
  {
    id: 'gr1', taxiBookingId: 'tb_old1', reviewerId: 'drv1', driverName: 'Carlos Eduardo Silva',
    guestId: 'u_guest1', stars: 5, text: 'Passageiro educado e pontual. Ótima corrida!', createdAt: '10/10/2026',
  },
];

// ─── Service → Amenity mapping (used to convert admin services to Property amenities) ──
const SERVICE_TO_AMENITY: Record<string, string> = {
  wifi: "Wi-Fi grátis",
  breakfast: "Café da manhã",
  ac: "Ar-condicionado",
  pet: "Pet friendly",
  kids: "Área Infantil",
  car: "Estacionamento",
  pool: "Piscina",
  parking: "Estacionamento",
  gym: "Academia",
  spa: "Spa",
  restaurant: "Restaurante",
  reception24h: "Recepção 24h",
};

/** Converts a ManagedProperty (admin) → Property (standard) format */
export function managedToProperty(mp: any): Property {
  const serviceAmenities = (mp.services || []).map((s: string) => SERVICE_TO_AMENITY[s] || s).filter(Boolean);
  const benefitList = Array.isArray(mp.benefits) ? mp.benefits : [];
  const amenities = [...new Set([...serviceAmenities, ...benefitList])] as string[];
  const coverImage = (mp.photos && mp.photos.length > 0) ? mp.photos[0] : IMGS.hotelExterior;
  return {
    id: mp.id,
    name: mp.name,
    type: mp.type || "Hotel",
    location: mp.address || "",
    city: mp.city || "",
    state: mp.state || "",
    stars: 3,
    score: 8.0,
    reviews: mp.reservations || 0,
    scoreLabel: (mp.reservations || 0) > 10 ? "Muito bom" : "Novo",
    pricePerNight: Number(mp.pricePerNight) || 0,
    images: (mp.photos && mp.photos.length > 0) ? mp.photos : [IMGS.hotelExterior, IMGS.hotelRoom],
    amenities,
    lat: 0,
    lng: 0,
    description: mp.description || "",
    checkIn: "14:00",
    checkOut: "12:00",
    policies: "Consulte o estabelecimento para detalhes de pagamento.",
    cancellation: "Consulte o estabelecimento sobre política de cancelamento.",
    badge: mp.hasFlightPackage ? "Voo+Hotel" : undefined,
    highlight: mp.flightInfo || undefined,
  };
}

/** Creates a virtual default room for a ManagedProperty (when no rooms exist) */
export function managedToRoom(mp: any): Room {
  const hasAC = (mp.services || []).includes("ac");
  return {
    id: `vroom_${mp.id}`,
    propertyId: mp.id,
    name: "Quarto Padrão",
    capacity: 2,
    beds: "1 cama casal",
    size: 20,
    pricePerNight: Number(mp.pricePerNight) || 0,
    amenities: hasAC ? ["TV", "Ar-condicionado"] : ["TV"],
    available: true,
    image: (mp.photos && mp.photos[0]) || IMGS.hotelRoom,
    cancellable: true,
  };
}
