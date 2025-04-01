/* eslint-disable @typescript-eslint/no-explicit-any */
interface Address {
  id: string;
  street: string;
  number: string;
  extra: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

interface Partner {
  id: string;
  document: string;
  name: string;
  mother_name: string | null;
  birth_date: string | null;
  is_pep: boolean;
  email: string;
  phone: string;
  identity_type: string | null;
  identity_number: string | null;
  identity_issued_at: string | null;
  profession_id: string | null;
  monthly_income: string | null;
  address_id: string | null;
  created_at: string;
  updated_at: string;
  type: string;
  is_master: boolean;
  flow_person_id: string | null;
  incorporation_date: string | null;
  main_cnae: string | null;
  legal_nature: string | null;
  trade_name: string | null;
}

interface Holder {
  id: string;
  legal_name: string;
  legal_nature: string;
  establishment_date: string;
  establishment_type: string;
  main_cnae: string;
  revenue: string;
  address: Array<Address>;
  created_at: string;
  updated_at: string;
  hr_name: string | null;
  hr_phone: string | null;
  hr_email: string | null;
  payroll_day: string | null;
  document: string;
  flow_business_id: string | null;
  partners: Array<Partner>;
}

interface User {
  'id': string;
  'name': string;
  'email': string;
  'username': string;
  'created_at': string;
  'updated_at': string;
  'password_reseted_at': string | null;
  '2fa_verified_at': string | null;
  'status': string;
  'role': string;
  'pin_reset_at': string | null;
  'password_expired': boolean;
  'email_notifications': boolean;
  'has_pin': boolean;
  'has_password': boolean;
}

export interface detailsDTO {
  id: string;
  holder_type: string;
  holder_id: string;
  parent_id: string | null;
  status: string;
  sub_status: string | null;
  alias_status: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  verified: boolean;
  verification_attempts: number;
  printed_card_name: string | null;
  branch_number: string | null;
  branch_digit: string | null;
  account_number: string | null;
  account_digit: string | null;
  account_type: string | null;
  meta: any | null;
  created_at: string;
  updated_at: string;
  email_verified_at: string | null;
  address_id: string;
  plan_id: string | null;
  plan_subscription_at: string | null;
  plan_last_charge_at: string | null;
  plan_next_charge_at: string | null;
  processed_at: string;
  type: string;
  withdrawal_method: string | null;
  last_withdrawal_at: string | null;
  manager_id: string | null;
  bank_number: string | null;
  nickname: string;
  activated_at: string | null;
  description: string | null;
  blocking_reason: string | null;
  shortcode_id: string | null;
  remuneration_started_at: string | null;
  hide: boolean;
  overnight_limit_start_time: number;
  plan_is_paid: boolean;
  address: Address;
  holder: Holder;
  plan: any | null;
  escrows: Array<any>;
  buckets: Array<any>;
  invoices: Array<any>;
  balance: number;
  has_pin: boolean;
  has_password: boolean;
  user: User;
}
