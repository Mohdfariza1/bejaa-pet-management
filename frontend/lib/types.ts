export interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface Pet {
  id: number;
  owner_id: number;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
  notes: string | null;
  alert: string | null;
  created_at: string;
}

export interface Cage {
  id: number;
  label: string;
  type: string;
  size: string;
  is_active: boolean;
}

export interface Booking {
  id: number;
  pet_id: number;
  cage_id: number;
  check_in: string;
  check_out: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface MedicalRecord {
  id: number;
  pet_id: number;
  visit_date: string;
  type: string;
  diagnosis: string | null;
  treatment: string | null;
  vet_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface Vaccine {
  id: number;
  pet_id: number;
  name: string;
  administered_date: string;
  next_due_date: string | null;
  administered_by: string | null;
  notes: string | null;
}

export interface StaffMember {
  id: number;
  name: string;
  username: string;
  role: "Boss" | "Staff";
  is_active: boolean;
  created_at: string;
}

export interface TodayStay {
  booking_id: number;
  status: string;
  check_in: string;
  check_out: string;
  notes: string | null;
  cage: string;
  pet_id: number;
  pet: string;
  species: string;
  alert: string | null;
  owner: string;
  phone: string;
  vaccines_overdue: string[];
}

export interface TodayVaccine {
  pet_id: number;
  pet: string;
  species: string;
  owner: string;
  phone: string;
  vaccines: { name: string; due: string }[];
}

export interface Today {
  date: string;
  late_pickup: TodayStay[];
  missed_arrival: TodayStay[];
  arriving: TodayStay[];
  leaving: TodayStay[];
  staying: TodayStay[];
  vaccines_due: TodayVaccine[];
  in_hotel: number;
  pending: number;
  cages: number;
}
