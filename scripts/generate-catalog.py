#!/usr/bin/env python3
"""
generate-catalog.py — builds src/data/catalog.ts from source-assets/captions.json
and source-assets/asset-manifest.json.

Rules:
- Names/specs transcribe the PDF captions verbatim (known clipped captions are
  restored from the PDF raw text and flagged 'caption-clipped').
- Unknown values are omitted, never invented.
- Categories use the canonical index names (PDF file p.5); differing on-page
  headings are preserved in pageHeading.
"""
import json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
caps = {(r['file_page'], r['idx']): r for r in json.load(open(f'{ROOT}/source-assets/captions.json'))}
man = json.load(open(f'{ROOT}/source-assets/asset-manifest.json'))

CATS = [
    (1,  'WELDING ELECTRODES',                          '1-2',  [6, 7],  None),
    (2,  'MIG WELDING WIRE',                            '3',    [8],     None),
    (3,  'TIG WELDING WIRES',                           '4-5',  [9, 10], None),
    (4,  'ARC WELDING ACCESSORIES',                     '6-7',  [11, 12], None),
    (5,  'MIG WELDING TORCHES & ACCESSORIES',           '8',    [13],    'MIG TORCHES & CONSUMABLES'),
    (6,  'TIG WELDING TORCHES & CONSUMABLES',           '9',    [14],    None),
    (7,  'TIG WELDING TORCH ACCESSORIES',               '10',   [15],    None),
    (8,  'GOUGING ROD & TORCHES',                       '11',   [16],    'GOUGING TORCHES & RODS'),
    (9,  'INDUSTRIAL GAS CYLINDERS & GAS TROLLEY',      '12',   [17],    None),
    (10, 'GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES', '13',   [18],    None),
    (11, 'CUTTING NOZZLES',                             '14',   [19],    None),
    (12, 'WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS', '15', [20],   None),
    (13, 'WELDING & CUTTING GAS ACCESSORIES',           '16',   [21],    None),
    (14, 'WELDING HELMET & ACCESSORIES',                '17',   [22],    None),
    (15, 'WELDING MACHINES',                            '18',   [23],    None),
    (16, 'ABRASIVES',                                   '19',   [24],    None),
    (17, 'INDUSTRIAL CHEMICALS',                        '20',   [25],    None),
    (18, 'SAFETY',                                      '21',   [26],    None),
    (19, 'HAND PROTECTIONS',                            '22',   [27],    None),
    (20, 'WELDING PROTECTIVE GEAR',                     '23',   [28],    None),
]
def cslug(n): return 'welding-machines' if n == 15 else None  # unused; general slug below
def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

# Captions clipped by the text-position pass, restored verbatim from the PDF raw
# text (pypdf extraction). Keys are (file_page, placement_idx).
OVERRIDES = {
    (12, 1): 'PORTABLE WELDING ELECTRODE | DRYER | AVAILABLE SIZE: | 5, 10 KG',
    # M9 audit correction: card images on file p.17 are (visual check of
    # source-assets/cards/fp17-0{4,5,6}.png) a NITROGEN-labelled bottle, a CO2
    # bottle, and a propane (LPG) bottle; the raw PDF text (pdf_text.txt p.17)
    # captions them NITROGEN CYLINDER, CO2 CYLINDER, LPG CYLINDER in this order.
    (17, 4): 'NITROGEN CYLINDER',
    (17, 5): 'CO2 CYLINDER',
    (17, 6): 'LPG CYLINDER',
    (21, 2): 'TIP CLEANER',
    (21, 4): '9 MOUTH OXYGEN / ACETYLENE WRENCH',
    (23, 6): '200 ACDC EDON',
    (27, 6): 'TIG GLOVES SHORT',
    (27, 7): 'TIG GLOVES LONG',
}
SIZE_KEYS = ('AVAILABLE SIZES:', 'AVAILABLE SIZE:', 'AVAILABLE Sizes:', 'AVAILABLE SIZE',
             'Sizes:', 'SIZE:', 'AVAILABLE NUMBER:', 'AVAILABLE LENGTH:')

def parse_caption(caption):
    lines = [l.strip() for l in caption.split('|') if l.strip()]
    # trailing standalone page number ("1", "13", "17", "10", "16")
    if lines and re.fullmatch(r'\d{1,2}', lines[-1]):
        lines.pop()
    aws = model = sizes = amps = packet = None
    name_lines, type_lines = [], []
    i = 0
    while i < len(lines):
        l = lines[i]
        if l.upper().startswith('AWS NO'):
            aws = l.split(':', 1)[1].strip(); i += 1; continue
        if l.upper().startswith('MODEL'):
            model = l.split(':', 1)[1].strip(); i += 1; continue
        if l == '5KG PKT.' or l == '10KG PKT.':
            packet = l; i += 1; continue
        matched = False
        for k in SIZE_KEYS:
            if l.startswith(k):
                rest = l[len(k):].strip()
                if rest:
                    sizes = rest
                elif i + 1 < len(lines):
                    sizes = lines[i + 1]; i += 1
                matched = True; break
        if matched:
            i += 1; continue
        if l == 'AVAILABLE AMPS:' and i + 1 < len(lines):
            amps = lines[i + 1]; i += 2; continue
        if re.fullmatch(r'[\d.,\s\-]+(MM|METER|CM|KG|G|AMPS|W|MFA)?[,.]?', l) and sizes:
            sizes = f'{sizes} {l}'.strip()  # size list wrapped onto the next line
            i += 1; continue
        if re.fullmatch(r'(300,500,600(,800)? AMPS|800A|1000A)', l):
            amps = l; i += 1; continue
        if l.startswith('SIZES:') and ':' in l:
            sizes = l.split(':', 1)[1].strip(); i += 1; continue
        if l in ('TIG WELDING WIRE', 'FLUXCORED WIRE', 'SOLID WIRE') and not name_lines:
            type_lines.append(l); i += 1; continue
        name_lines.append(l); i += 1
    name = ' '.join(name_lines).strip()
    if not name and type_lines:
        name = ' '.join(type_lines)  # card name IS the type line, as printed
        type_lines = []
    if not name and model:
        name = model  # torch cards printed with the model number only
    return name, type_lines, aws, model, sizes, amps, packet

fp_to_cat = {}
for num, _n, _pp, pages, _h in CATS:
    for fp in pages:
        fp_to_cat[fp] = num

products, used_ids, image_map = [], set(), []
for (fp, idx) in sorted(caps):
    r = caps[(fp, idx)]
    caption = OVERRIDES.get((fp, idx), r['caption'])
    flags = ['caption-clipped'] if (fp, idx) in OVERRIDES else []
    if not caption.strip():
        continue  # unresolved extra (no caption) — logged in asset report
    cat = fp_to_cat[fp]
    name, type_lines, aws, model, sizes, amps, packet = parse_caption(caption)
    if not name:
        print('EMPTY NAME', fp, idx, caption); continue
    base = slugify(name + ('-' + aws if aws else '') + ('-' + model if model and model != name else ''))
    pid, n = base, 2
    while pid in used_ids:
        pid = f'{base}-{n}'; n += 1
    used_ids.add(pid)
    cat_meta = next(c for c in CATS if c[0] == cat)
    cat_slug = slugify(cat_meta[1])
    notes = ' '.join(type_lines) if type_lines else None
    if notes:
        flags.append('caption-type-heading-preserved')
    if cat == 11:
        flags.append('code-only-name')
    img = f'/images/products/{cat_slug}/{pid}.webp'
    image_map.append({'card_png': f'source-assets/cards/fp{fp:02d}-{idx:02d}.png', 'webp': img})
    products.append({
        'id': pid, 'categoryId': cat, 'name': name,
        'awsNo': aws, 'model': model, 'sizes': sizes, 'amps': amps, 'packet': packet,
        'notes': notes, 'image': img,
        'printedPage': cat_meta[2], 'pdfPage': f'{fp}',
        'flags': flags,
    })

INDUSTRY_NAMES = ['Oil & Gas', 'Heavy Equipment & Machinery', 'Construction & Infrastructure',
                  'Industrial Maintenance & Repair', 'Petro Chemical & Chemical',
                  'Steel & Metal Fabrication']

def ts_str(s): return json.dumps(s, ensure_ascii=False)

lines = []
lines.append('// GENERATED by scripts/generate-catalog.py from the source PDF catalogue.')
lines.append('// Do not hand-edit generated records; edit the generator or follow content-guide.md.')
lines.append('// Every record is auditable: printedPage = printed catalogue page, pdfPage = PDF file page.')
lines.append('\nexport interface Category {')
lines.append('  indexNo: number; slug: string; name: string; pageHeading?: string;')
lines.append('  printedPages: string; pdfPages: string;')
lines.append('}\nexport interface Product {')
lines.append('  id: string; categoryId: number; name: string;')
lines.append('  awsNo?: string; model?: string; sizes?: string; amps?: string; packet?: string; notes?: string;')
lines.append('  image?: string; printedPage: string; pdfPage: string; flags: string[];')
lines.append('}\nexport interface Brand { name: string; image: string; sourceRef: string; }')
lines.append('export interface Industry { name: string; image: string; sourceRef: string; }')

lines.append('\nexport const categories: Category[] = [')
for num, name, pp, fps, heading in CATS:
    pdfpages = str(fps[0]) if len(fps) == 1 else f'{min(fps)}-{max(fps)}'
    h = f' pageHeading: {ts_str(heading)},' if heading else ''
    lines.append(f'  {{ indexNo: {num}, slug: {ts_str(slugify(name))}, name: {ts_str(name)},{h} printedPages: {ts_str(pp)}, pdfPages: {ts_str(pdfpages)} }},')
lines.append('];')

lines.append('\nexport const products: Product[] = [')
for p in products:
    opt = ''
    for k in ('awsNo', 'model', 'sizes', 'amps', 'packet', 'notes'):
        if p[k]: opt += f' {k}: {ts_str(p[k])},'
    fl = ', '.join(ts_str(f) for f in p['flags'])
    lines.append(f"  {{ id: {ts_str(p['id'])}, categoryId: {p['categoryId']}, name: {ts_str(p['name'])},{opt} image: {ts_str(p['image'])}, printedPage: {ts_str(p['printedPage'])}, pdfPage: {ts_str(p['pdfPage'])}, flags: [{fl}] }},")
lines.append('];')

lines.append('\nexport const brands: Brand[] = [')
for b in man['brands']:
    lines.append(f"  {{ name: {ts_str(b['brand'])}, image: {ts_str('/images/brands/' + os.path.basename(b['file']).replace('.png', '.webp'))}, sourceRef: 'PDF file p.4' }},")
lines.append('];')

lines.append('\nexport const industries: Industry[] = [')
for i, ind in enumerate(man['industries']):
    lines.append(f"  {{ name: {ts_str(INDUSTRY_NAMES[i])}, image: {ts_str('/images/industries/' + os.path.basename(ind['file']).replace('.png', '.webp'))}, sourceRef: 'PDF file p.3' }},")
lines.append('];')

os.makedirs(f'{ROOT}/src/data', exist_ok=True)
open(f'{ROOT}/src/data/catalog.ts', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
json.dump(image_map, open(f'{ROOT}/source-assets/product-map.json', 'w'), indent=1)
print('products:', len(products), 'image_map:', len(image_map))
from collections import Counter
print(Counter(p['categoryId'] for p in products))
