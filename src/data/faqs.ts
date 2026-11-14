// faqs.ts — single source of truth for the FAQ page content (14 approved
// questions and answers, wording preserved verbatim from FAQ's.txt).
// Categories drive the filter chips and their counts.

export interface Faq {
  id: number;
  q: string;
  a: string;
  cat: 'products' | 'technical' | 'orders';
}

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'products', label: 'Products & Consumables' },
  { id: 'technical', label: 'Technical Guidance' },
  { id: 'orders', label: 'Orders & Support' },
] as const;

export const FAQS: Faq[] = [
  { id: 1, cat: 'products',
    q: 'What types of welding products and consumables do you supply?',
    a: 'We offer a comprehensive range of welding products, including welding electrodes, TIG filler rods, MIG wires, flux-cored wires, welding machines, MIG and TIG torches, welding accessories, gas-cutting equipment, abrasives, industrial chemicals, and personal protective equipment. Our product range caters to various welding, fabrication, maintenance, and industrial requirements.' },
  { id: 2, cat: 'products',
    q: 'Which welding brands do you supply?',
    a: 'We offer products from recognised brands, including ESAB, ADOR, Kiswel, Lincoln Electric, Böhler and many other brands subject to availability. Our selection covers a variety of welding applications, product grades, and technical requirements.' },
  { id: 3, cat: 'products',
    q: 'What types of welding electrodes are available?',
    a: 'We supply different types of welding electrodes, including mild steel, low-hydrogen, stainless steel, cast iron, and specialised electrodes. Popular classifications include E6013, E7018, E6010, E308L, E309L, and E316L, depending on product availability and application requirements.' },
  { id: 4, cat: 'technical',
    q: 'How do I choose the right welding electrode or filler wire?',
    a: 'Selecting the right welding consumable depends on the base material, material thickness, welding process, welding position, required mechanical properties, and applicable welding standards. Our team can assist you in identifying suitable products based on your specific application and technical requirements.' },
  { id: 5, cat: 'technical',
    q: 'What is the difference between MIG, TIG, and ARC welding?',
    a: 'MIG welding uses a continuously fed consumable wire electrode and shielding gas. TIG welding uses a non-consumable tungsten electrode, with a separate filler rod when required, while ARC (MMA) welding uses a consumable flux-coated electrode. Each process is suited to different materials, applications, and welding requirements.' },
  { id: 6, cat: 'products',
    q: 'Do you supply welding consumables for stainless steel, aluminium, and other metals?',
    a: 'Yes. We offer welding consumables for various metals, including carbon steel, stainless steel, aluminium, and cast iron. Product selection depends on the base material, required filler composition, welding process, and intended application.' },
  { id: 7, cat: 'technical',
    q: 'What sizes, grades, and technical specifications are available?',
    a: 'Our products are available in different sizes, diameters, grades, and technical specifications depending on the product category. We can assist customers in identifying suitable products according to AWS classifications and other applicable industry standards.' },
  { id: 8, cat: 'products',
    q: 'Do you supply welding machines, torches, and accessories?',
    a: 'Yes. We supply welding machines and a wide range of accessories, including MIG and TIG torches, electrode holders, earth clamps, welding cables, connectors, contact tips, gas nozzles, and other essential components. Our team can help identify compatible products for your equipment and application.' },
  { id: 9, cat: 'products',
    q: 'Do you supply gas-cutting equipment and accessories?',
    a: 'Yes. Our product range includes cutting and heating torches, cutting nozzles, gas regulators, flashback arrestors, gas hoses, fittings, and other accessories required for gas-cutting and heating applications.' },
  { id: 10, cat: 'products',
    q: 'What welding safety equipment and protective gear do you offer?',
    a: 'We offer a range of personal protective equipment, including welding helmets, auto-darkening helmets, safety goggles, face shields, welding gloves, jackets, aprons, protective sleeves, and hearing protection products. These products help protect workers against common workplace hazards when selected and used appropriately.' },
  { id: 11, cat: 'products',
    q: 'Do you supply abrasives and industrial chemicals for metal fabrication?',
    a: 'Yes. Our range includes cutting discs, grinding discs, flap discs, diamond cutting discs, sanding belts, mounting stones, zinc sprays, pickling gels, passivators, and anti-spatter products. These products support cutting, grinding, surface preparation, cleaning, and post-welding treatment.' },
  { id: 12, cat: 'technical',
    q: 'How should welding electrodes be stored and handled?',
    a: 'Welding electrodes should be stored in a clean, dry environment and protected from moisture. Certain low-hydrogen electrodes require controlled storage and, where specified by the manufacturer, baking or holding in suitable electrode ovens. Always follow the manufacturer\'s storage and handling instructions to maintain electrode performance.' },
  { id: 13, cat: 'orders',
    q: 'Can I request technical datasheets, certifications, or material test certificates?',
    a: 'Yes. Available product documentation may include technical datasheets, classification details, certificates of conformity, and material test certificates, depending on the product and manufacturer. Contact our team with your requirements to check the relevant documentation.' },
  { id: 14, cat: 'orders',
    q: 'Do you accept bulk orders, provide quotations, and arrange delivery?',
    a: 'Yes. We welcome bulk enquiries from contractors, fabrication workshops, construction companies, manufacturers, and industrial customers. Share your product list, required specifications, and quantities with our sales team to receive a quotation and discuss product availability and delivery arrangements.' },
];

export function faqCount(cat: string): number {
  return cat === 'all' ? FAQS.length : FAQS.filter((f) => f.cat === cat).length;
}
