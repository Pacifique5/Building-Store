export const CATEGORIES = [
  "Cement and binders",
  "Sand, gravel and aggregates",
  "Bricks, blocks and stone",
  "Steel, rebar and metal",
  "Roofing",
  "Timber and boards",
  "Doors and windows",
  "Tiles and flooring",
  "Paint and coatings",
  "Plumbing",
  "Electrical",
  "Hardware and fasteners",
  "Tools",
  "Safety equipment",
  "Adhesives, sealants and chemicals",
  "Glass",
  "Insulation",
  "Water storage",
  "Fencing and wire",
  "Gypsum and finishing",
];

export const UNIT_GROUPS = [
  {
    label: "Counted items",
    units: ["pieces", "pairs", "sets", "dozens", "bundles", "boxes", "cartons", "packets", "rolls", "sheets", "bars", "lengths", "bags"],
  },
  {
    label: "Weight",
    units: ["kg", "grams", "tons"],
  },
  {
    label: "Length and area",
    units: ["meters", "centimeters", "feet", "square meters"],
  },
  {
    label: "Liquids and cans",
    units: [
      "litres",
      "millilitres",
      "250 ml can",
      "500 ml can",
      "1 litre can",
      "4 litre can",
      "5 litre can",
      "10 litre can",
      "20 litre can",
      "tin",
      "gallon",
      "jerrycan",
      "drum",
      "bucket",
      "bottle",
      "tube",
    ],
  },
];

export const UNITS = UNIT_GROUPS.flatMap((group) => group.units);

export function withCurrent(options: string[], extras: Array<string | undefined> = []) {
  const extra = extras.filter((item): item is string => typeof item === "string" && item.length > 0 && !options.includes(item));
  return [...new Set([...extra, ...options])];
}
