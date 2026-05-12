export interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
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
