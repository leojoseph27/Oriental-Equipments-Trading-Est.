import { chromium, webkit } from '@playwright/test';
import { readdirSync } from 'node:fs';
const H = 'http://localhost:4322';
const engine = process.argv[2] === 'webkit' ? webkit : chromium;
const name = process.argv[2] || 'chromium';
const slugs = readdirSync('dist/products', { withFileTypes: true }).filter(d => d.isDirectory()).map(d => '/products/' + d.name + '/');
const pages = ['/', '/products/', '/contact/', '/search/', '/search/?q=torch', '/catalogue/', ...slugs];
const widths = [320,360,375,390,414,430,768,1024,1280,1440,1920];
let fails = 0, checks = 0;
const go = async (p, u) => { for (let i = 0; i < 4; i++) { try { return await p.goto(H + u, { waitUntil: 'load' }); } catch (e) { await new Promise(r => setTimeout(r, 2000)); } } throw new Error('unreachable ' + u); };
const b = await engine.launch();
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const u of pages) {
    await go(p, u);
    await p.waitForTimeout(1300);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const d = document.documentElement;
      window.scrollTo(5000, window.scrollY);
      const sx = window.scrollX;
      const wide = [...document.querySelectorAll('body *')].filter(el => { const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el); return rc.width > 1 && (rc.right > innerWidth + 1 || rc.left < -1) && cs.position !== 'fixed' && !el.matches('.skip-link,.visually-hidden') && !el.closest('.cr-stage,.hero-media,[aria-hidden="true"],.visually-hidden'); }).slice(0,3).map(el => el.tagName + '.' + String(el.className).slice(0,30) + ' ' + Math.round(el.getBoundingClientRect().right));
      return { over: d.scrollWidth - innerWidth, sx, wide, obx: getComputedStyle(d).overscrollBehaviorX, oby: getComputedStyle(d).overscrollBehaviorY };
    });
    checks++;
    if (r.over > 0 || r.sx !== 0 || r.wide.length || r.obx !== 'none' || r.oby !== 'none') { fails++; console.log(`FAIL ${name} ${w} ${u} ${JSON.stringify(r)}`); }
  }
  await go(p, '/'); await p.waitForTimeout(2500);
  await p.mouse.move(w/2, 450); await p.mouse.wheel(0, 900); await p.waitForTimeout(700);
  const st = await p.evaluate(() => { const h = document.querySelector('header'); return { y: Math.round(scrollY), top: Math.round(h.getBoundingClientRect().top) }; });
  checks++; if (st.y < 300 || st.top !== 0) { fails++; console.log(`FAIL ${name} ${w} wheel/sticky ${JSON.stringify(st)}`); }
  if (w <= 900) {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
    await p.locator('.menu-btn').click(); await p.waitForTimeout(400);
    const open = await p.evaluate(() => !document.getElementById('mobile-nav').hidden);
    checks++; if (!open) { fails++; console.log(`FAIL ${name} ${w} mobile menu`); }
  } else { checks++; if (!(await p.locator('.desktop-nav').isVisible())) { fails++; console.log(`FAIL ${name} ${w} desktop nav`); } }
  const fixed = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(el => getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().width < innerWidth).map(el => { const rc = el.getBoundingClientRect(); return { c: String(el.className).slice(0,25), l: Math.round(rc.left), r: Math.round(rc.right) }; }));
  for (const f of fixed) { checks++; if (f.r > w + 1 || f.l < -1) { fails++; console.log(`FAIL ${name} ${w} fixed off-edge ${JSON.stringify(f)}`); } }
  await go(p, '/catalogue/'); await p.waitForTimeout(3000);
  const cat = await p.evaluate(() => { const s = document.querySelector('.cr-stage'); return s && { vis: s.getBoundingClientRect().height > 50, ob: getComputedStyle(s).overscrollBehaviorY }; });
  checks++; if (!cat || !cat.vis || cat.ob !== 'contain') { fails++; console.log(`FAIL ${name} ${w} catalogue ${JSON.stringify(cat)}`); }
  await p.close();
}
await b.close();
console.log(`${name}: ${checks} checks, ${fails} failures`);
