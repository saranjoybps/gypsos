import type { Product } from "@/lib/portal/types";

/**
 * Company block printed on every invoice.
 * Only details supplied by GYPSOS are filled in. Empty fields are simply left off the invoice;
 * fill them in here (address, GSTIN, PAN, bank) before issuing real invoices.
 */
export const COMPANY = {
  name: "GYPSOS Buildtech India Private Limited",
  brand: "GYPSOS",
  tagline: "Premium Grade Gypsum Plaster",
  email: "support@gypsos.in",
  phone: "8489848936",
  address: "",
  gstin: "",
  pan: "",
  bankDetails: "",
  /** GST % pre-filled when the admin sends an invoice (admin can change it per invoice). */
  defaultGstRate: 0,
  invoicePrefix: "GYP",
};

/** Default catalogue. PLACEHOLDER prices: change them in Admin > Products. */
export const DEFAULT_PRODUCTS: Omit<Product, "active">[] = [
  { id: "gypsum-plaster", name: "GYPSOS Gypsum Plaster", unit: "bag", price: 450 },
  { id: "ceiling-bond", name: "GYPSOS Ceiling Bond", unit: "bag", price: 400 },
];
