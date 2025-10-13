export interface ServiceDate {
  id: string
  date: string
  displayDate: string
  liturgist?: Liturgist
  isAvailable: boolean
  notes?: string
}

export interface Liturgist {
  id: string
  name: string
  email: string
  phone?: string
  preferredContact: 'email' | 'phone'
}

export interface SignupRequest {
  serviceId: string
  liturgistName: string
  liturgistEmail: string
  liturgistPhone?: string
  preferredContact: 'email' | 'phone'
  notes?: string
}