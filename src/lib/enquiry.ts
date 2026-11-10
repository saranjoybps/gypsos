export const ENQUIRER_TYPES = ["Builder", "Contractor", "Promoter", "Architect", "Dealer", "Construction company", "Individual customer"] as const;

export type EnquiryInput = {
  name: string;
  organisation: string;
  role: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(?:\+?91)?[6-9]\d{9}$/;

/** Shared by the browser form and the API route so both enforce identical rules. */
export function validateEnquiry(input: EnquiryInput): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (input.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!(ENQUIRER_TYPES as readonly string[]).includes(input.role)) errors.role = "Please tell us who you are.";
  const phone = input.phone.replace(/[\s\-()]/g, "");
  if (!PHONE.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!EMAIL.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (input.area.trim() !== "" && !(Number(input.area.replace(/,/g, "")) > 0)) errors.area = "Area must be a positive number.";
  if (input.message.trim().length < 10) errors.message = "Please add a short message (at least 10 characters).";
  if (input.message.length > 2000) errors.message = "Message is too long (2000 characters maximum).";
  for (const key of ["name", "organisation", "city"] as const) {
    if (input[key].length > 120) errors[key] = "That is too long.";
  }
  return errors;
}
