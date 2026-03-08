export const APPLICATION_STATUSES = [
  'applied',
  'screening',
  'contacted',
  'hr_interview',
  'technical_interview',
  'final_interview',
  'offer_sent',
  'hired',
  'rejected',
] as const;

export const APPLICATION_SUB_STATUSES = [
  'no_response',
  'responded',
  'tech_challenge',
  'tech_review',
  'offer_pending',
  'offer_accepted',
  'offer_rejected',
  'offer_negotiation',
  'candidate_withdraw',
] as const;

export const NOTE_VISIBILITIES = ['internal', 'shared'] as const;
export const CONTACT_CHANNELS = ['whatsapp', 'email', 'call', 'linkedin'] as const;
export const CONTACT_OUTCOMES = ['no_response', 'responded', 'na'] as const;
export const REJECTION_REASON_CATEGORIES = [
  'we_rejected_them',
  'they_rejected_us',
  'none_specified',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type ApplicationSubStatus = (typeof APPLICATION_SUB_STATUSES)[number];
export type NoteVisibility = (typeof NOTE_VISIBILITIES)[number];
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];
export type ContactOutcome = (typeof CONTACT_OUTCOMES)[number];
export type RejectionReasonCategory =
  (typeof REJECTION_REASON_CATEGORIES)[number];
