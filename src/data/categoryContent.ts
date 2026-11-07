// Category introductions and Key Features — transcribed verbatim from the
// supplied "Welding Product Catalogue.txt" (2026-11 content update). The text
// is the source of truth: do not paraphrase, shorten or extend it.
// Each feature carries a Lucide icon name resolved by FeatureIcon.astro.

export interface CategoryFeature { text: string; icon: string }
export interface CategoryContent { intro: string[]; features: CategoryFeature[] }

// Central feature-text → Lucide icon mapping. Reused across categories so the
// same wording always gets the same icon.
const I = {
  arcStability: "zap",
  arcPrecision: "crosshair",
  weldStrength: "shield-check",
  beadAppearance: "sparkles",
  lowSpatter: "brush",
  sizesSpecs: "ruler",
  heavyDuty: "factory",
  wireFeeding: "cable",
  productivity: "trending-up",
  weldQuality: "badge-check",
  corrosionResist: "shield",
  compatibility: "plug",
  durability: "hammer",
  conductivity: "zap",
  heatResist: "flame",
  connections: "link",
  installation: "wrench",
  gasFlow: "wind",
  stableArc: "activity",
  metalRemoval: "hammer",
  gougingResults: "badge-check",
  torchConstruction: "hammer",
  safeHandling: "hand",
  transport: "truck",
  wheelsFrames: "circle-dot",
  secureHolding: "layers",
  capacities: "package",
  flameControl: "sliders-horizontal",
  hoseOptions: "cable",
  cuttingPerf: "scissors",
  flameStability: "flame",
  copperBuild: "hammer",
  leakResistant: "link",
  wearResist: "shield",
  pressureControl: "gauge",
  opSafety: "shield",
  corrosionResistBuild: "shield-check",
  weldingCutting: "factory",
  uvProtection: "sun",
  impactHeat: "hard-hat",
  visibility: "eye",
  headgear: "hard-hat",
  lightweight: "feather",
  shades: "sun-dim",
  preciseControl: "crosshair",
  efficiency: "trending-up",
  inverterTech: "cpu",
  compactBuild: "box",
  thermalProtection: "thermometer",
  materialRemoval: "hammer",
  grinding: "disc",
  finishPrecision: "sparkles",
  wearResistBuild: "hammer",
  metalworking: "factory",
  grits: "ruler",
  cleaning: "brush",
  spatterPrevention: "shield",
  maintenance: "wrench",
  serviceLife: "trending-up",
  formulations: "package",
  hazardProtection: "shield-check",
  qualityMaterials: "award",
  comfort: "heart",
  resistOptions: "flame",
  standards: "badge-check",
  cutAbrasion: "shield",
  durableMaterials: "hammer",
  fitFlexibility: "heart",
  grip: "hand",
  materialsSizes: "ruler",
  environments: "factory",
  sparksProtection: "shield",
  leatherHeat: "flame",
  coverage: "shirt",
  workingHours: "clock",
  spatterResist: "shield",
  fabrication: "factory",
} as const;

const f = (text: string, icon: string): CategoryFeature => ({ text, icon });

export const categoryContent: Record<string, CategoryContent> = {
  "welding-electrodes": {
    intro: [
      "Welding Electrodes are consumable metal rods used in Shielded Metal Arc Welding (SMAW), commonly known as stick welding. They conduct electric current to generate an arc, producing the heat required to melt and join metal surfaces. The electrode also provides filler metal to create a strong, durable weld joint.",
      "Available in various types, sizes, and specifications, welding electrodes are widely used in construction, fabrication, shipbuilding, oil & gas, and industrial maintenance.",
    ],
    features: [
      f("Excellent arc stability and easy operation.", I.arcStability),
      f("Strong weld strength and durability.", I.weldStrength),
      f("Smooth weld bead appearance.", I.beadAppearance),
      f("Low spatter and easy slag removal.", I.lowSpatter),
      f("Available in multiple sizes and specifications.", I.sizesSpecs),
      f("Suitable for industrial and heavy-duty applications.", I.heavyDuty),
    ],
  },
  "mig-welding-wire": {
    intro: [
      "MIG welding wires are continuous consumable filler wires used in Metal Inert Gas (MIG) welding to produce strong, consistent, and high-quality welds. Suitable for a wide range of industrial and fabrication applications, they offer excellent welding performance and productivity.",
    ],
    features: [
      f("Smooth and consistent wire feeding.", I.wireFeeding),
      f("Excellent arc stability.", I.arcStability),
      f("High deposition rate and productivity.", I.productivity),
      f("Low spatter and minimal post-weld cleaning.", I.lowSpatter),
      f("Strong and reliable weld quality.", I.weldQuality),
      f("Available in various diameters and specifications.", I.sizesSpecs),
    ],
  },
  "tig-welding-wires": {
    intro: [
      "TIG welding wires are filler materials used in Tungsten Inert Gas (TIG) welding to produce clean, precise, and high-quality weld joints. Available in various material grades and specifications, they are suitable for welding a wide range of metals and alloys.",
    ],
    features: [
      f("Excellent weld quality and precision.", I.arcPrecision),
      f("Smooth and consistent feeding.", I.wireFeeding),
      f("Low spatter and minimal weld contamination.", I.lowSpatter),
      f("Strong and corrosion-resistant weld joints.", I.corrosionResist),
      f("Excellent compatibility with various base metals.", I.compatibility),
      f("Available in different diameters and specifications.", I.sizesSpecs),
    ],
  },
  "arc-welding-accessories": {
    intro: [
      "ARC welding accessories are essential tools and components designed to support efficient, safe, and reliable arc welding operations. They ensure smooth welding performance, proper electrical connections, and improved operator convenience across various industrial applications.",
    ],
    features: [
      f("Durable and robust construction.", I.durability),
      f("Excellent electrical conductivity.", I.conductivity),
      f("Heat-resistant components.", I.heatResist),
      f("Secure and reliable connections.", I.connections),
      f("Designed for heavy-duty applications.", I.heavyDuty),
      f("Easy handling and installation.", I.installation),
    ],
  },
  "mig-welding-torches-accessories": {
    intro: [
      "MIG welding torches and consumables are essential components designed to ensure efficient, precise, and reliable MIG welding operations. They provide consistent wire feeding, effective shielding gas delivery, and optimal welding performance across various industrial applications.",
    ],
    features: [
      f("Excellent heat resistance and durability.", I.heatResist),
      f("Consistent wire feeding performance.", I.wireFeeding),
      f("Efficient shielding gas distribution.", I.gasFlow),
      f("Reliable electrical conductivity.", I.conductivity),
      f("Easy installation and replacement.", I.installation),
      f("Compatible with various MIG torch models.", I.compatibility),
    ],
  },
  "tig-welding-torches-consumables": {
    intro: [
      "TIG welding torches and consumables are designed to deliver precision, control, and consistent performance in TIG welding applications. They ensure efficient shielding gas coverage, stable arc performance, and high-quality weld finishes across various industrial requirements.",
    ],
    features: [
      f("Excellent arc stability and precision.", I.arcPrecision),
      f("Effective shielding gas coverage.", I.gasFlow),
      f("Heat-resistant and durable construction.", I.heatResist),
      f("Consistent welding performance.", I.weldQuality),
      f("Easy installation and replacement.", I.installation),
      f("Compatible with various TIG torch models.", I.compatibility),
    ],
  },
  "tig-welding-torch-accessories": {
    intro: [
      "TIG welding torch accessories are essential components designed to enhance torch performance, improve welding precision, and ensure reliable operation. They provide effective gas coverage, secure component fitting, and consistent performance for various TIG welding applications.",
    ],
    features: [
      f("Precision fit and easy installation.", I.installation),
      f("Excellent heat resistance and durability.", I.heatResist),
      f("Improved shielding gas coverage.", I.gasFlow),
      f("Stable and consistent arc performance.", I.stableArc),
      f("Reliable component compatibility.", I.compatibility),
      f("Designed for professional and industrial applications.", I.heavyDuty),
    ],
  },
  "gouging-rod-torches": {
    intro: [
      "Gouging torches and carbon electrodes are used for efficient metal removal, weld joint preparation, and defect removal in industrial applications. Designed for reliable performance, they provide precise arc control and effective metal gouging across various fabrication and maintenance operations.",
    ],
    features: [
      f("Efficient metal removal and weld preparation.", I.metalRemoval),
      f("Stable arc performance.", I.stableArc),
      f("High-temperature resistance.", I.heatResist),
      f("Consistent gouging results.", I.gougingResults),
      f("Durable torch construction.", I.torchConstruction),
      f("Available in various sizes and specifications.", I.sizesSpecs),
    ],
  },
  "industrial-gas-cylinders-gas-trolley": {
    intro: [
      "Industrial gas cylinders and trolleys are designed for the safe storage, handling, and transportation of industrial gases. Built for durability and reliability, they support a wide range of welding, cutting, fabrication, and industrial applications.",
    ],
    features: [
      f("Robust and durable construction.", I.durability),
      f("Designed for safe cylinder handling.", I.safeHandling),
      f("Easy transportation and mobility.", I.transport),
      f("Heavy-duty wheels and support frames.", I.wheelsFrames),
      f("Secure cylinder holding arrangements.", I.secureHolding),
      f("Available in various capacities and configurations.", I.capacities),
    ],
  },
  "gas-cutting-heating-equipments-gas-hoses": {
    intro: [
      "Gas cutting and heating equipment are widely used for metal cutting, heating, brazing, and fabrication applications. Designed for precision, efficiency, and reliable operation, these products provide controlled flame performance and dependable gas delivery for industrial requirements.",
    ],
    features: [
      f("Precise flame control and performance.", I.flameControl),
      f("Durable and heat-resistant construction.", I.heatResist),
      f("Reliable gas flow and delivery.", I.gasFlow),
      f("Flexible and durable hose options.", I.hoseOptions),
      f("Suitable for heavy-duty industrial applications.", I.heavyDuty),
      f("Available in various sizes and specifications.", I.sizesSpecs),
    ],
  },
  "cutting-nozzles": {
    intro: [
      "Cutting nozzles are essential components used in oxy-fuel gas cutting applications to deliver a controlled mixture of oxygen and fuel gas for precise and efficient metal cutting. Designed for consistent flame performance, they ensure clean cuts and reliable operation across various industrial applications.",
    ],
    features: [
      f("Precise and consistent cutting performance.", I.cuttingPerf),
      f("Excellent flame stability.", I.flameStability),
      f("High-temperature resistance.", I.heatResist),
      f("Durable copper construction.", I.copperBuild),
      f("Efficient gas flow and distribution.", I.gasFlow),
      f("Available in various sizes and torch-compatible designs.", I.sizesSpecs),
    ],
  },
  "welding-regulator-fittings-gas-hose-fittings": {
    intro: [
      "Welding regulator fittings and gas hose fittings are essential components designed to ensure secure, leak-resistant connections and efficient gas flow in welding and cutting applications. Built for durability and reliability, they support safe gas distribution and consistent performance across various industrial operations.",
    ],
    features: [
      f("Secure and leak-resistant connections.", I.leakResistant),
      f("Durable brass and metal construction.", I.durability),
      f("Reliable gas flow and distribution.", I.gasFlow),
      f("Excellent pressure and wear resistance.", I.wearResist),
      f("Easy installation and maintenance.", I.installation),
      f("Available in various sizes, threads, and configurations.", I.sizesSpecs),
      f("Suitable for industrial welding and gas cutting applications.", I.weldingCutting),
    ],
  },
  "welding-cutting-gas-accessories": {
    intro: [
      "Welding and cutting gas accessories are essential components designed to ensure safe, efficient, and reliable gas flow during welding, heating, and cutting operations. They support proper gas control, secure connections, and enhanced operational safety across various industrial applications.",
    ],
    features: [
      f("Reliable gas flow and pressure control.", I.pressureControl),
      f("Enhanced operational safety.", I.opSafety),
      f("Durable and corrosion-resistant construction.", I.corrosionResistBuild),
      f("Secure and leak-resistant connections.", I.leakResistant),
      f("Easy installation and maintenance.", I.installation),
      f("Suitable for various welding and cutting applications.", I.weldingCutting),
    ],
  },
  "welding-helmet-accessories": {
    intro: [
      "Welding helmets and accessories are essential personal protective equipment designed to protect welders from sparks, heat, harmful radiation, and welding spatter. Offering comfort, visibility, and reliable protection, they support safe and efficient welding operations.",
    ],
    features: [
      f("Reliable protection against UV and IR radiation.", I.uvProtection),
      f("Impact and heat-resistant construction.", I.impactHeat),
      f("Clear visibility and improved viewing comfort.", I.visibility),
      f("Adjustable headgear for a comfortable fit.", I.headgear),
      f("Durable and lightweight designs.", I.lightweight),
      f("Available in various shades and specifications.", I.shades),
    ],
  },
  "welding-machines": {
    intro: [
      "Welding machines are essential equipment designed to provide reliable power and precise control for a wide range of welding applications. Engineered for efficiency, durability, and consistent performance, they are suitable for industrial fabrication, construction, maintenance, and workshop operations.",
    ],
    features: [
      f("Stable arc performance and precise control.", I.preciseControl),
      f("High welding efficiency and productivity.", I.efficiency),
      f("Advanced inverter technology.", I.inverterTech),
      f("Compact and durable construction.", I.compactBuild),
      f("Overload and thermal protection.", I.thermalProtection),
      f("Suitable for industrial and heavy-duty applications.", I.heavyDuty),
    ],
  },
  "abrasives": {
    intro: [
      "Abrasives are essential products used for grinding, cutting, polishing, and surface preparation across various industrial applications. Designed for efficient material removal and smooth finishing, they deliver consistent performance, precision, and durability in metalworking and fabrication operations.",
    ],
    features: [
      f("High material removal efficiency.", I.materialRemoval),
      f("Excellent cutting and grinding performance.", I.grinding),
      f("Consistent finish and precision.", I.finishPrecision),
      f("Durable and wear-resistant construction.", I.wearResistBuild),
      f("Suitable for various metalworking applications.", I.metalworking),
      f("Available in different sizes, grits, and specifications.", I.grits),
    ],
  },
  "industrial-chemicals": {
    intro: [
      "Industrial chemicals are essential products used in welding, fabrication, metal treatment, cleaning, and maintenance operations. Formulated to deliver reliable performance and efficiency, they support a wide range of industrial and workshop applications.",
    ],
    features: [
      f("Effective cleaning and surface preparation.", I.cleaning),
      f("Helps prevent welding spatter buildup.", I.spatterPrevention),
      f("Supports corrosion protection and maintenance.", I.maintenance),
      f("Improves equipment performance and service life.", I.serviceLife),
      f("Suitable for various industrial applications.", I.environments),
      f("Available in different formulations and packaging sizes.", I.formulations),
    ],
  },
  "safety": {
    intro: [
      "Industrial safety items are essential protective equipment designed to safeguard workers from workplace hazards and potential injuries. Providing reliable protection, comfort, and durability, they support safe working conditions across welding, fabrication, construction, and industrial environments.",
    ],
    features: [
      f("Reliable protection against workplace hazards.", I.hazardProtection),
      f("Durable and high-quality materials.", I.qualityMaterials),
      f("Comfortable designs for extended use.", I.comfort),
      f("Heat, impact, and abrasion-resistant options.", I.resistOptions),
      f("Available in various sizes and specifications.", I.sizesSpecs),
      f("Designed to meet relevant industrial safety standards.", I.standards),
    ],
  },
  "hand-protections": {
    intro: [
      "Hand protection products are designed to safeguard workers' hands against heat, cuts, abrasions, chemicals, and other workplace hazards. Offering comfort, durability, and reliable protection, they are essential for welding, fabrication, construction, and industrial applications.",
    ],
    features: [
      f("Protection against heat, cuts, and abrasions.", I.cutAbrasion),
      f("Durable materials for extended use.", I.durableMaterials),
      f("Comfortable fit and flexibility.", I.fitFlexibility),
      f("Enhanced grip and handling.", I.grip),
      f("Available in different materials and sizes.", I.materialsSizes),
      f("Suitable for various industrial working environments.", I.environments),
    ],
  },
  "welding-protective-gear": {
    intro: [
      "Welding protective gear is designed to protect welders from heat, sparks, molten metal, UV radiation, and other welding-related hazards. Offering durability, comfort, and reliable protection, these products are essential for maintaining workplace safety during welding and fabrication operations.",
    ],
    features: [
      f("Protection against heat, sparks, and molten metal.", I.sparksProtection),
      f("Durable leather and heat-resistant materials.", I.leatherHeat),
      f("Enhanced coverage for body and limbs.", I.coverage),
      f("Comfortable designs for extended working hours.", I.workingHours),
      f("Resistant to abrasion and welding spatter.", I.spatterResist),
      f("Suitable for industrial welding and fabrication applications.", I.fabrication),
    ],
  },
};
