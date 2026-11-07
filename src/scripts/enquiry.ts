// enquiry.ts — shared mailto submission adapter used by the contact form and the
// product quote modal. A hosted provider can replace sendEnquiry() later.

export const COMPANY_EMAIL = 'orientaltradest@gmail.com';
const MAX_MAILTO = 1800; // conservative usable length for mailto URLs

export type EnquiryResult = { kind: 'mailto' } | { kind: 'too-long'; body: string };

export function sendEnquiry(subject: string, lines: (string | false | undefined)[]): EnquiryResult {
  const body = lines.filter((l): l is string => typeof l === 'string').join('\r\n');
  const url = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (url.length > MAX_MAILTO) return { kind: 'too-long', body };
  location.href = url;
  return { kind: 'mailto' };
}
