export const projectTypes = [
  { value: "new-home", label: "New home" },
  { value: "renovation", label: "Renovation or addition" },
  { value: "interiors", label: "Interiors" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const budgets = [
  "Under $500,000",
  "$500,000 to $1 million",
  "$1 million to $2 million",
  "Over $2 million",
  "I'd rather discuss it",
] as const;

export const timings = ["Within 6 months", "6 to 12 months", "More than a year away", "Just exploring"] as const;

export const meetingPlaces = [
  { value: "site", label: "At my site" },
  { value: "studio", label: "At the studio" },
  { value: "video", label: "Video call" },
] as const;

/** Maps the service anchors used across the site to a preselected project type. */
export const serviceToType: Record<string, string> = {
  architecture: "new-home",
  renovation: "renovation",
  interiors: "interiors",
};

export type EnquiryValues = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  location: string;
  budget: string;
  timing: string;
  meeting: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s-]{8,20}$/;

export function validateEnquiry(v: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (v.name.trim().length < 2) errors.name = "Enter your name.";
  if (!v.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL.test(v.email.trim())) errors.email = "Enter an email address like name@example.com.";
  if (v.phone.trim() && !PHONE.test(v.phone.trim()))
    errors.phone = "Enter a phone number using digits, spaces or a leading +.";
  if (!projectTypes.some((t) => t.value === v.projectType)) errors.projectType = "Choose the kind of project.";
  if (v.message.trim().length < 20)
    errors.message = "Tell us a little about the project (at least 20 characters).";
  return errors;
}

/** Order in which errors are listed and focused, matching the visual order of the form. */
export const fieldOrder: (keyof EnquiryValues)[] = [
  "name",
  "email",
  "phone",
  "projectType",
  "location",
  "budget",
  "timing",
  "meeting",
  "message",
];
