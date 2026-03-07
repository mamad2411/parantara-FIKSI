// TypeScript interfaces for Masjid Portal
// Designed to match future API response structure

export interface MosqueSummary {
  id: string
  domain: string
  name: string
  location: string
  category: string
  verified: boolean
  imageUrl: string
  totalDonation: number
  jamaahCount: number
}

export interface MosqueProfile {
  name: string
  address: string
  city: string
  province: string
  description: string
  imageUrl: string
  gallery: string[]
  phone: string
  email: string
  established: string
  verified: boolean
  socialMedia: {
    instagram?: string
    website?: string
    facebook?: string
  }
}

export interface FinancialDetail {
  date: string
  description: string
  type: "pemasukan" | "pengeluaran"
  amount: number
  category: string
}

export interface MonthlyFinancial {
  month: string
  saldoAwal: number
  pemasukan: number
  pengeluaran: number
  saldoAkhir: number
  details: FinancialDetail[]
}

export interface FinancialData {
  currentWeek: {
    saldoAwal: number
    pemasukan: number
    pengeluaran: number
    saldoAkhir: number
  }
  monthly: MonthlyFinancial[]
}

export interface Program {
  id: string
  title: string
  description: string
  target: number
  collected: number
  startDate: string
  endDate: string
  status: "active" | "completed" | "upcoming"
  imageUrl: string
}

export interface Schedule {
  id: string
  title: string
  speaker: string
  day: string
  time: string
  topic: string
  recurring: boolean
}

export interface DonationInfo {
  bankAccounts: {
    bank: string
    accountNumber: string
    accountName: string
  }[]
  qrCodeUrl: string
}

export interface MosqueDetail {
  id: string
  domain: string
  cityId: string
  cityName: string
  profile: MosqueProfile
  financial: FinancialData
  programs: Program[]
  schedules: Schedule[]
  donation: DonationInfo
}
