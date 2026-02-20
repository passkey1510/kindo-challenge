export interface Trip {
  id: string;
  name: string;
  date: string;
  location: string;
  cost: string;
  description: string;
  school_id: string;
  activity_id: string;
}

export interface RegistrationRequest {
  student_name: string;
  parent_name: string;
  parent_email: string;
  trip: string;
}

export interface RegistrationResponse {
  id: number;
  student_name: string;
  parent_name: string;
  parent_email: string;
  trip: string;
  created_at: string;
}

export interface PaymentRequest {
  registration_id: number;
  card_number: string;
  expiry_date: string;
  cvv: string;
}

export interface PaymentResponse {
  id: number;
  registration: number;
  amount: string;
  card_last_four: string;
  status: 'pending' | 'success' | 'failed';
  transaction_id: string;
  error_message: string | null;
  attempts: number;
  created_at: string;
}

export interface ApiError {
  error: boolean;
  message: string;
  code: string;
}

export type WizardStep = 'trip' | 'registration' | 'payment' | 'confirmation';

export interface RegistrationFormData {
  student_name: string;
  parent_name: string;
  parent_email: string;
}

export interface PaymentFormData {
  card_number: string;
  expiry_date: string;
  cvv: string;
}
