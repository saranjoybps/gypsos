export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
export type KycStatus = "not_submitted" | "submitted" | "verified" | "rejected";
export type RequestStatus = "pending" | "approved" | "rejected" | "sent";

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  active: boolean;
}

export interface VendorKyc {
  status: KycStatus;
  remarks: string;
  submittedAt?: string;
  verifiedAt?: string;
  data: KycData;
}

export interface KycData {
  legalName: string;
  businessType: string;
  panNumber: string;
  gstin: string;
  signatoryName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  ifsc: string;
  bankName: string;
  bankBranch: string;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  status: VendorStatus;
  statusNote: string;
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  address: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  deliveryAddress: string;
  kyc: VendorKyc;
  createdAt: string;
}

export interface StockRow {
  productId: string;
  name: string;
  unit: string;
  qty: number;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  vendorId: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  qty: number;
  balanceAfter: number;
  source: "invoice" | "vendor" | "admin";
  refId: string;
  note: string;
  at: string;
}

export interface RequestItem {
  productId: string;
  name: string;
  unit: string;
  qty: number;
}

export interface StockRequest {
  id: string;
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  items: RequestItem[];
  note: string;
  status: RequestStatus;
  adminNote: string;
  invoiceId: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  unit: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  requestId: string;
  vendorId: string;
  vendorCode: string;
  date: string;
  billTo: { name: string; contact: string; phone: string; email: string; gstin: string; pan: string; address: string };
  deliveryAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
}
