/** Shapes returned by the API. Kept in one file so screens agree on the data. */

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type Patient = {
  _id: string;
  doctor: { _id: string; name: string; specialization: string; hospital: string };
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  condition: string;
  status: 'active' | 'recovered' | 'critical';
  visitDate: string;
  notes: string;
  createdAt: string;
};

export type DoctorInput = Pick<Doctor, 'name' | 'specialization' | 'hospital' | 'phone' | 'email'>;

export type PatientInput = Omit<Patient, '_id' | 'createdAt' | 'doctor'> & { doctor: string };

export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListResponse<T> = { data: T[]; meta: ListMeta };

export type DashboardData = {
  totals: {
    doctors: number;
    patients: number;
    newDoctorsThisMonth: number;
    newPatientsThisMonth: number;
    avgPatientsPerDoctor: number;
  };
  patientsPerDoctor: { doctorId: string; name: string; specialization: string; patients: number }[];
  monthly: { month: string; label: string; doctors: number; patients: number }[];
  byStatus: { name: string; value: number }[];
  byGender: { name: string; value: number }[];
  topConditions: { name: string; value: number }[];
  recentPatients: Patient[];
};

export type DoctorFilters = { specializations: string[]; hospitals: string[] };
export type PatientFilters = { conditions: string[] };

export const GENDERS = ['male', 'female', 'other'] as const;
export const STATUSES = ['active', 'recovered', 'critical'] as const;
