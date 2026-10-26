#!/usr/bin/env python3
"""
extract-assets.py — Oriental Equipments Trading Est. catalogue
Extracts card photos (by captioned placement geometry), brand logos,
industry images, logo and hero from the source PDF.

Outputs:
  source-assets/cards/<filepage>-<idx>.png     card crops (RGB, from 3x render)
  source-assets/brands/<slug>.png              brand logo crops
  source-assets/industries/<slug>.png          industry crops
  source-assets/logo/logo.png, source-assets/hero/hero.png
  source-assets/asset-manifest.json            traceable manifest
Caption source: source-assets/captions.json (produced by the caption pass,
which associates PDF text lines to image placements geometrically).
"""
import pdfplumber, json, os, re, unicodedata
import pypdfium2 as pdfium
import pypdf
from PIL import Image

PDF = r'C:/Users/leojo/Downloads/PRE-FINAL_1_ORIENTAL EQUIPMENTS TRADING EST.pdf'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source-assets')
SCALE = 3.0

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s or 'item'

captions = {(r['file_page'], r['idx']): r for r in json.load(open(os.path.join(SRC, 'captions.json')))}

pdf = pdfium.PdfDocument(PDF)
pl = pdfplumber.open(PDF)
pp = pypdf.PdfReader(PDF)
manifest = {'products': [], 'brands': [], 'industries': [], 'logo': None, 'hero': None,
            'unresolved': []}

# ---------- product cards (file pages 6..28) ----------
for fpage in range(6, 29):
    page = pdf[fpage - 1]
    pypdf_page = pp.pages[fpage - 1]
    pil = page.render(scale=SCALE).to_pil().convert('RGB')
    recs = [r for (fp, idx), r in captions.items() if fp == fpage]
    for r in recs:
        if not r['caption'].strip():
            manifest['unresolved'].append({
                'reason': 'no caption found for this embedded image placement',
                'file_page': fpage, 'placement_idx': r['idx'],
                'raw_dump': f'source-assets/extracted/fp{fpage:02d}-{r["idx"]+1:02d}.png'})
            continue
        # placement geometry from the caption pass: re-read from captions json fields
        # prefer the embedded raster (higher resolution than the page render)
        pname = (r.get('pl_name') or '').lstrip('/')
        emb = next((im for im in pypdf_page.images if im.name.split('/')[-1].split('.')[0] == pname), None)
        if emb is not None:
            crop = emb.image
            if crop.mode != 'RGB':
                crop = crop.convert('RGB')
            bg = Image.new('RGB', crop.size, (255, 255, 255))
            from PIL import ImageChops
            bbox = ImageChops.difference(crop, bg).getbbox() or (0, 0, *crop.size)
            pad = 6
            bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(crop.size[0], bbox[2]+pad), min(crop.size[1], bbox[3]+pad))
            crop = crop.crop(bbox)
        else:
            crop = pil.crop((int(r['x0'] * SCALE), int(r['top'] * SCALE),
                             int((r['x0'] + r['w_pt']) * SCALE), int((r['top'] + r['h_pt']) * SCALE)))
        name = os.path.join(SRC, 'cards', f'fp{fpage:02d}-{r["idx"]:02d}.png')
        os.makedirs(os.path.dirname(name), exist_ok=True)
        crop.save(name)
        manifest['products'].append({'file': f'source-assets/cards/fp{fpage:02d}-{r["idx"]:02d}.png',
                                     'caption': r['caption'], 'file_page': fpage,
                                     'cat_page': fpage - 5})

# ---------- brand logos (file page 4) & industries (file page 3) ----------
for fpage, key in ((4, 'brands'), (3, 'industries')):
    plpage = pl.pages[fpage - 1]
    page = pdf[fpage - 1]
    pil = page.render(scale=SCALE).to_pil().convert('RGB')
    placements = [im for im in plpage.images if im['width'] < 400]
    placements.sort(key=lambda im: (round(im['top'] / 100), im['x0']))
    for i, p in enumerate(placements):
        crop = pil.crop((int(p['x0'] * SCALE), int(p['top'] * SCALE),
                         int(p['x1'] * SCALE), int(p['bottom'] * SCALE)))
        name = os.path.join(SRC, key, f'{fpage:02d}-{i:02d}.png')
        os.makedirs(os.path.dirname(name), exist_ok=True)
        crop.save(name)
        manifest[key].append({'file': name, 'file_page': fpage, 'order': i})
    print(key, len(placements))

# ---------- logo & hero (cover) ----------
cover = pdf[0].render(scale=SCALE).to_pil().convert('RGB')
W, H = cover.size
logo = cover.crop((int(0.30 * W), int(0.515 * H), int(0.50 * W), int(0.645 * H)))
os.makedirs(os.path.join(SRC, 'logo'), exist_ok=True)
logo.save(os.path.join(SRC, 'logo', 'logo.png'))
manifest['logo'] = {'file': 'source-assets/logo/logo.png', 'file_page': 1,
                    'note': 'cover crop; measured ~170px source — quality flagged for review'}
hero = cover.crop((0, 0, W, int(0.52 * H)))
os.makedirs(os.path.join(SRC, 'hero'), exist_ok=True)
hero.save(os.path.join(SRC, 'hero', 'hero.png'))
manifest['hero'] = {'file': 'source-assets/hero/hero.png', 'file_page': 1,
                    'note': 'cover top photo area (approximate crop)'}

json.dump(manifest, open(os.path.join(SRC, 'asset-manifest.json'), 'w'), indent=1)
print('cards:', len(manifest['products']), 'unresolved:', len(manifest['unresolved']))
