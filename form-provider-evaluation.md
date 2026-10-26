# Form Provider Evaluation — Oriental Equipments Trading Est.

**Date:** 2026-10-22 · **Status:** Information only. **No provider has been selected or activated.** The live form currently uses the mailto fallback only (see Recommendation & Decision).

---

## 1. Scope & constraints applied

- No account creation, no API keys/credentials, no paid plans during this evaluation.
- Only current official sources used (vendor docs/pricing pages). Anything not verifiable from an official source as of today is marked **UNVERIFIED**.
- Site context: static Astro build, no backend, no database, low expected enquiry volume (single-company B2B supplier), email destination is `orientaltradest@gmail.com` (a free Gmail address).

## 2. Options evaluated

### 2.1 Mailto fallback (current default)

| Aspect | Status | Detail |
|---|---|---|
| Cost / account | Verified | None. No third party involved; the visitor's own email app sends the message. |
| Data handling | Verified | Nothing passes through any server we control or a processor; no form data is logged or stored by the site. |
| Reliability | Verified limitation | Depends on the visitor having a configured desktop/mobile mail client. On some machines with no mail client, nothing happens. |
| Length limits | Verified (implemented) | URL length varies by OS/browser; the form caps the encoded mailto at 1,800 chars and offers a copy-to-clipboard textarea for longer submissions — no silent truncation. |
| Spam exposure | Verified limitation | The address is already published in the PDF/site footer, so scraping risk is unchanged by mailto. |
| Attachment / spam filtering / archive | N/A | None available. |

### 2.2 Formspree

Verified from https://formspree.io/plans (fetched 2026-10-22):

- Free tier: **50 submissions/month**, submissions stored/accessible for **30 days**, 1 form endpoint; unlimited email team members. Paid plans (Formspree Starter etc.) start around **US$15/month** (exact current tier list on the plans page).
- Requires an **account** (email signup); endpoint is tied to a form ID.
- Includes basic spam protection ("Formshield"); reCAPTCHA/hCaptcha options available; domain restriction; ability to keep the receiving email private.
- Evaluation: the free 50/month cap is fine for a first release but is a hard ceiling; hitting it silently drops enquiries on the free tier. 30-day archive is short for records-keeping.

### 2.3 Netlify Forms

Verified from https://docs.netlify.com/forms/setup/ (fetched 2026-10-22):

- **Requires the site to be hosted and deployed on Netlify.** Detection works by parsing deployed HTML (form with `data-netlify="true"`), so it is unusable with a static build hosted elsewhere (e.g. plain shared hosting, a local server, or another CDN).
- Usage/billing: https://docs.netlify.com/manage/forms/usage-and-billing/ confirms Forms levels are configured per plan level; the **current** Netlify pricing moved to a credit-based model and the pricing page **no longer states free-tier Forms submission limits** — specific free-tier submission/storage quotas are **UNVERIFIED** as of today. Legacy plan quotas (100 submissions/month on the old free tier) circulate in secondary sources but could not be confirmed from an official page, so treat them as unconfirmed.
- Evaluation: clean integration, but it creates a hosting lock-in that the project has deliberately avoided (no deployment decision has been made). Not usable unless the user chooses Netlify hosting.

### 2.4 Web3Forms

Verified from https://docs.web3forms.com/ (introduction + FAQ, fetched 2026-10-22):

- Setup: create an access key at https://web3forms.com (account required — email-based), then POST to `https://api.web3forms.com/submit`. Works from static sites with no backend.
- **Access key is explicitly public by design**: "You do not need to hide the access key. Access key is public." It acts as an alias to the destination inbox; worst case an attacker can email you.
- Spam protection: built-in firewall + spam-check algorithms; optional hCaptcha / reCAPTCHA / Cloudflare Turnstile. **Domain restriction is a paid (Pro) feature** per the FAQ.
- Privacy: submissions are **not stored** — processed and forwarded to the email/webhook; server logs that may contain personal data are deleted roughly every two months; servers in US East; GDPR posture claimed without legal warranty.
- Free-tier submission limits and pricing tiers: **UNVERIFIED**. The marketing site (web3forms.com) and its pricing page returned HTTP 403 to our fetches, and the FAQ contains no numeric quota. The FAQ elsewhere describes the service as usable without a paid plan, but **no official numeric free-tier limit was confirmed**.
- Evaluation: strongest privacy posture (no storage) and the simplest key-handling story of the three providers. Main open question is the actual free quota.

## 3. Comparison summary

| Criterion | Mailto (current) | Formspree | Web3Forms | Netlify Forms |
|---|---|---|---|---|
| Works on any static host | ✅ | ✅ | ✅ | ❌ (Netlify hosting only) |
| No account needed today | ✅ | ❌ | ❌ | ❌ |
| Free tier limits (verified) | n/a | 50/mo | **UNVERIFIED** | **UNVERIFIED** |
| Submissions archived | ❌ | 30 days | ❌ (not stored) | Per usage/billing docs |
| Spam filtering | ❌ | Formshield | Firewall + optional CAPTCHA | Per docs |
| Domain restriction | n/a | ✅ (free) | ❌ Pro only | Per docs |
| Data passes through third party | ❌ | ✅ | ✅ (but not retained) | ✅ |
| Migration effort from current code | — | Small: point `submitEnquiry()` at Formspree endpoint | Small: POST JSON to api.web3forms.com with access key | Requires hosting move |

## 4. Recommendation (presented, NOT actioned)

1. **Keep the current mailto fallback as the live default.** It works today with zero accounts, zero cost, and zero data flowing through third parties — consistent with the project's constraints. Its known weaknesses (needs a mail client, no archive, no spam filter) are acceptable for a launch.
2. **If a server-backed form is wanted later, Web3Forms is the best fit**: no submission storage (best privacy story for a small B2B site), public-by-design access key (no secret in client code — nothing to leak), and free of hosting lock-in. Open question before committing: confirm the current free-tier submission limit directly at web3forms.com (their site blocked our fetches).
3. **Formspree is the second choice**: everything is verifiable and stable (50/mo free), but submissions are stored 30 days and the free tier is a hard cap.
4. **Netlify Forms only if Netlify hosting is chosen**, which is a separate, undecided decision.

**No provider will be selected or activated without your explicit approval.** Switching any provider later is a contained change: the transport is isolated in `src/scripts/quote.ts` (`submitEnquiry()`), so only that function and a small config constant change.

## 5. Source list

- Formspree plans — https://formspree.io/plans (fetched 2026-10-22)
- Netlify Forms setup — https://docs.netlify.com/forms/setup/ (fetched 2026-10-22)
- Netlify Forms usage & billing — https://docs.netlify.com/manage/forms/usage-and-billing/ (fetched 2026-10-22); netlify.com/pricing shows credit model, no Forms quotas
- Web3Forms docs intro — https://docs.web3forms.com/ (fetched 2026-10-22)
- Web3Forms FAQ — https://docs.web3forms.com/getting-started/faq.md (fetched 2026-10-22); web3forms.com main + pricing pages returned 403 (limits unverified)
