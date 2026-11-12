import type { KycData } from "@/lib/portal/types";

export type Errors<T> = Partial<Record<keyof T, string>>;

const clean = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  businessName: string;
  address: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  deliveryAddress: string;
}

export function readRegister(raw: Record<string, unknown>): RegisterInput {
  return {
    fullName: clean(raw.fullName, 100),
    phone: clean(raw.phone, 20).replace(/[\s-]/g, ""),
    email: clean(raw.email, 150).toLowerCase(),
    password: typeof raw.password === "string" ? raw.password.slice(0, 128) : "",
    businessName: clean(raw.businessName, 150),
    address: clean(raw.address, 400),
    location: clean(raw.location, 100),
    district: clean(raw.district, 100),
    state: clean(raw.state, 100),
    pincode: clean(raw.pincode, 10),
    deliveryAddress: clean(raw.deliveryAddress, 400),
  };
}

export function validateRegister(v: RegisterInput): Errors<RegisterInput> {
  const e: Errors<RegisterInput> = {};
  if (v.fullName.length < 2) e.fullName = "Enter your full name.";
  if (!/^(\+?91)?[6-9]\d{9}$/.test(v.phone)) e.phone = "Enter a valid 10-digit mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = "Enter a valid email address.";
  if (v.password.length < 8) e.password = "Use at least 8 characters.";
  if (v.businessName.length < 2) e.businessName = "Enter your business / shop name.";
  if (v.address.length < 8) e.address = "Enter the full business address.";
  if (v.location.length < 2) e.location = "Enter your location (city / town).";
  if (v.district.length < 2) e.district = "Enter your district.";
  if (v.state.length < 2) e.state = "Enter your state.";
  if (!/^\d{6}$/.test(v.pincode)) e.pincode = "Enter a 6-digit pincode.";
  return e;
}

export const EMPTY_KYC: KycData = {
  legalName: "",
  businessType: "",
  panNumber: "",
  gstin: "",
  signatoryName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  ifsc: "",
  bankName: "",
  bankBranch: "",
};

export const BUSINESS_TYPES = ["Proprietorship", "Partnership", "Private Limited", "LLP", "Individual"];

export function readKyc(raw: Record<string, unknown>): KycData {
  return {
    legalName: clean(raw.legalName, 150),
    businessType: clean(raw.businessType, 50),
    panNumber: clean(raw.panNumber, 10).toUpperCase(),
    gstin: clean(raw.gstin, 15).toUpperCase(),
    signatoryName: clean(raw.signatoryName, 100),
    bankAccountName: clean(raw.bankAccountName, 100),
    bankAccountNumber: clean(raw.bankAccountNumber, 20).replace(/\s/g, ""),
    ifsc: clean(raw.ifsc, 11).toUpperCase(),
    bankName: clean(raw.bankName, 100),
    bankBranch: clean(raw.bankBranch, 100),
  };
}

export function validateKyc(k: KycData): Errors<KycData> {
  const e: Errors<KycData> = {};
  if (k.legalName.length < 2) e.legalName = "Enter the legal business name.";
  if (!BUSINESS_TYPES.includes(k.businessType)) e.businessType = "Select the business type.";
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(k.panNumber)) e.panNumber = "Enter a valid 10-character PAN, e.g. ABCDE1234F.";
  if (k.gstin !== "" && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(k.gstin)) e.gstin = "Enter a valid 15-character GSTIN or leave it blank.";
  if (k.signatoryName.length < 2) e.signatoryName = "Enter the authorised signatory name.";
  if (k.bankAccountName.length < 2) e.bankAccountName = "Enter the account holder name.";
  if (!/^\d{9,18}$/.test(k.bankAccountNumber)) e.bankAccountNumber = "Enter a valid account number (9 to 18 digits).";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(k.ifsc)) e.ifsc = "Enter a valid 11-character IFSC, e.g. HDFC0001234.";
  if (k.bankName.length < 2) e.bankName = "Enter the bank name.";
  if (k.bankBranch.length < 2) e.bankBranch = "Enter the branch.";
  return e;
}
