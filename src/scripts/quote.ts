// quote.ts — enquiry form behaviour: validation, product pre-fill, and the
// mailto submission adapter. The transport is isolated in submitEnquiry() so a
// hosted provider can replace it later without touching the form logic.
// No data is stored or sent anywhere except the visitor's own email application.

const COMPANY_EMAIL = 'orientaltradest@gmail.com';
const MAX_MAILTO = 1800; // conservative usable length for mailto URLs

interface Inquiry {
  name: string; email: string; company: string; phone: string;
  category: string; product: string; quantity: string; message: string;
}

const form = document.getElementById('quote-form') as HTMLFormElement | null;
if (form) {
  const fields = ['name', 'company', 'email', 'phone', 'category', 'product', 'quantity', 'message'] as const;
  const el = (id: string) => document.getElementById(`qf-${id}`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const err = (id: string) => document.getElementById(`qf-${id}-err`)!;
  const summary = document.getElementById('qf-summary')!;
  const status = document.getElementById('qf-status')!;
  const copywrap = document.getElementById('qf-copywrap')!;
  const copyBox = document.getElementById('qf-copy') as HTMLTextAreaElement;

  // remember each control's static description (hints) so error association can
  // be added on top of it instead of replacing it
  for (const id of fields) {
    const input = el(id);
    const base = input.getAttribute('aria-describedby');
    if (base) input.setAttribute('data-descbase', base);
  }

  // ---- validation ----
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateField(id: keyof Inquiry): string {
    const v = el(id).value.trim();
    if (id === 'name' && !v) return 'Enter your full name.';
    if (id === 'email') {
      if (!v) return 'Enter your email address.';
      if (!EMAIL_RE.test(v)) return 'Enter a valid email address, e.g. name@company.com.';
    }
    if (id === 'message' && !v) return 'Enter your enquiry message.';
    if (id === 'phone' && v && !/^[+\d ()\-.]{6,30}$/.test(v)) return 'Enter a valid phone number (digits, spaces, + ( ) - only).';
    return '';
  }

  function showFieldError(id: keyof Inquiry, msg: string) {
    const input = el(id);
    const errEl = err(id);
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      const base = input.getAttribute('data-descbase');
      input.setAttribute('aria-describedby', base ? `${base} qf-${id}-err` : `qf-${id}-err`);
      errEl.textContent = msg;
      errEl.hidden = false;
    } else {
      input.removeAttribute('aria-invalid');
      const base = input.getAttribute('data-descbase');
      if (base) input.setAttribute('aria-describedby', base);
      else input.removeAttribute('aria-describedby');
      errEl.hidden = true;
    }
  }

  function validateAll(): string[] {
    const errors: string[] = [];
    for (const id of fields) {
      const msg = validateField(id);
      showFieldError(id, msg);
      if (msg) errors.push(msg);
    }
    if (errors.length) {
      summary.innerHTML = '<p>Please fix the following before continuing:</p>';
      const ul = document.createElement('ul');
      for (const m of errors) { const li = document.createElement('li'); li.textContent = m; ul.append(li); }
      summary.append(ul);
      summary.hidden = false;
      summary.focus();
    } else {
      summary.hidden = true;
    }
    return errors;
  }

  for (const id of fields) {
    el(id).addEventListener('blur', () => { if (err(id).textContent || el(id).value.trim()) showFieldError(id, validateField(id)); });
    el(id).addEventListener('input', () => { if (el(id).getAttribute('aria-invalid') === 'true') showFieldError(id, validateField(id)); });
  }

  // ---- product pre-fill from /contact/?product=<stable product id> ----
  async function prefill() {
    const pid = new URLSearchParams(location.search).get('product');
    if (!pid) return;
    try {
      const index: { id: string; name: string; cat: string; catSlug: string; text: string }[] =
        await (await fetch('/search-index.json')).json();
      const entry = index.find((e) => e.id === pid);
      if (!entry) {
        status.textContent = 'The linked product could not be found — the enquiry form is ready for your details. You can browse the catalogue to confirm the item name.';
        status.hidden = false;
        return;
      }
      (el('product') as HTMLInputElement).value = entry.name;
      const sel = el('category') as HTMLSelectElement;
      const opt = [...sel.options].find((o) => o.value === entry.cat);
      if (opt) sel.value = entry.cat;
      status.textContent = `Enquiry started for: ${entry.name} (${entry.cat}). You can change or clear these details.`;
      status.hidden = false;
    } catch {
      status.textContent = 'Product details could not be pre-filled — please enter the item name manually.';
      status.hidden = false;
    }
  }
  prefill();

  // ---- mailto submission adapter (production provider replaces this function) ----
  function buildBody(q: Inquiry): string {
    return [
      `Name: ${q.name}`,
      q.company && `Company: ${q.company}`,
      `Email: ${q.email}`,
      q.phone && `Phone: ${q.phone}`,
      q.category && `Category: ${q.category}`,
      q.product && `Product: ${q.product}`,
      q.quantity && `Quantity: ${q.quantity}`,
      '',
      'Enquiry:',
      q.message,
    ].filter((l) => l !== false && l !== '').join('\r\n');
  }

  function submitEnquiry(q: Inquiry): void {
    const subject = `Product enquiry — ${q.product || q.category || 'general'}`;
    const body = buildBody(q);
    const url = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (url.length <= MAX_MAILTO) {
      status.hidden = true;
      copywrap.hidden = true;
      location.href = url;
      status.textContent = 'Validation passed. Your email application should now open with the enquiry pre-filled — please review and press send there. This website cannot confirm whether the email was actually sent or received.';
      status.hidden = false;
    } else {
      // Honest fallback for long enquiries: never truncate silently.
      copyBox.value = body;
      copywrap.hidden = false;
      status.textContent = 'Validation passed. Your enquiry is too long for an automatic email draft, so the full text is provided below — copy it into a new email to orientaltradest@gmail.com.';
      status.hidden = false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = validateAll();
    if (errors.length) {
      status.hidden = true;
      copywrap.hidden = true;
      return;
    }
    const q = Object.fromEntries(fields.map((id) => [id, el(id).value.trim()])) as unknown as Inquiry;
    submitEnquiry(q);
  });
}
