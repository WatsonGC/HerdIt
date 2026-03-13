// ─── Farm / Multi-tenant ─────────────────────────────────────────────

export interface FarmMeta {
  name: string;
  location: string; // city / description
  acreage: number;
  farmType: FarmType;
  createdBy: string;
  createdAt: number;
}

export type FarmType = 'ranch' | 'dairy' | 'poultry' | 'mixed' | 'hobby' | 'commercial';

export interface FarmEntry {
  id: string;
  meta: FarmMeta;
}

// ─── Pastures / Enclosures ──────────────────────────────────────────

export type EnclosureType = 'pasture' | 'pen' | 'barn' | 'coop' | 'stable' | 'paddock' | 'feedlot' | 'run';
export type FencingType = 'barbed-wire' | 'electric' | 'board' | 'chain-link' | 'woven-wire' | 'panel' | 'none';
export type TerrainType = 'flat' | 'hilly' | 'wooded' | 'mixed' | 'wetland';

export interface Enclosure {
  name: string;
  type: EnclosureType;
  acreage: number;
  capacity: number; // max head count
  fencingType: FencingType;
  terrain: TerrainType;
  waterSource: boolean;
  shelter: boolean;
  notes: string;
  createdAt: number;
}

// ─── Animals ────────────────────────────────────────────────────────

export type Species = 'cattle' | 'sheep' | 'goat' | 'pig' | 'chicken' | 'duck' | 'turkey' | 'horse' | 'donkey' | 'rabbit' | 'alpaca' | 'llama' | 'bee' | 'other';
export type AnimalSex = 'male' | 'female' | 'castrated' | 'unknown';
export type AnimalStatus = 'active' | 'pregnant' | 'nursing' | 'growing' | 'producing' | 'dry' | 'quarantined' | 'for-sale' | 'sold' | 'deceased';

export interface AnimalBreed {
  name: string;
  species: Species;
  purpose: string; // e.g. "dairy", "meat", "dual-purpose", "fiber", "eggs", "draft"
  avgWeightLbs: number;
  temperament: string;
  climatePreference: string;
  gestationDays: number;
  maturityMonths: number;
  lifeExpectancyYears: number;
  notes: string;
}

export interface AnimalEntry {
  name: string;
  tagId: string; // ear tag or ID number
  species: Species;
  breedId: string;
  sex: AnimalSex;
  dateOfBirth: string; // ISO date
  acquisitionDate: string; // ISO date
  acquisitionMethod: 'born-on-farm' | 'purchased' | 'rescued' | 'traded';
  enclosureId: string;
  sireId: string; // parent animal ID
  damId: string; // parent animal ID
  status: AnimalStatus;
  weightLbs: number;
  color: string;
  markings: string;
  registrationNumber: string;
  notes: string;
  createdAt: number;
}

// ─── Tasks ──────────────────────────────────────────────────────────

export type TaskType = 'feed' | 'water' | 'clean' | 'vet-check' | 'vaccinate' | 'deworm' | 'hoof-trim' | 'shear' | 'breed' | 'move' | 'repair' | 'general';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskRecurrence = 'none' | 'daily' | 'every-2-days' | 'every-3-days' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';

export interface FarmTask {
  title: string;
  type: TaskType;
  priority: TaskPriority;
  enclosureId: string;
  animalId: string;
  dueDate: string; // ISO date
  completed: boolean;
  completedAt: number | null;
  recurrence: TaskRecurrence;
  notes: string;
  createdAt: number;
}

// ─── Journal ────────────────────────────────────────────────────────

export interface JournalEntry {
  date: string; // ISO date
  title: string;
  text: string;
  weather: string;
  tempHigh: number | null;
  tempLow: number | null;
  tags: string[];
  createdAt: number;
}

// ─── Production Log ─────────────────────────────────────────────────

export type ProductionType = 'milk' | 'eggs' | 'wool' | 'meat' | 'honey' | 'fiber' | 'hide' | 'manure' | 'other';
export type ProductionUnit = 'gallons' | 'liters' | 'lbs' | 'kg' | 'dozen' | 'count' | 'bales' | 'bushels';

export interface ProductionEntry {
  animalId: string;
  animalName: string;
  type: ProductionType;
  date: string;
  quantity: number;
  unit: ProductionUnit;
  quality: 1 | 2 | 3 | 4 | 5;
  notes: string;
  createdAt: number;
}

// ─── Breeding Records ───────────────────────────────────────────────

export type BreedingStatus = 'planned' | 'bred' | 'confirmed-pregnant' | 'due-soon' | 'delivered' | 'failed' | 'cancelled';
export type BreedingMethod = 'natural' | 'artificial-insemination' | 'embryo-transfer';

export interface BreedingRecord {
  damId: string;
  damName: string;
  sireId: string;
  sireName: string;
  breedingDate: string; // ISO date
  expectedDueDate: string; // ISO date
  actualDeliveryDate: string;
  method: BreedingMethod;
  status: BreedingStatus;
  offspringCount: number;
  offspringIds: string[];
  notes: string;
  createdAt: number;
}

// ─── Health / Veterinary Records ────────────────────────────────────

export type HealthEventType = 'vaccination' | 'deworming' | 'illness' | 'injury' | 'surgery' | 'dental' | 'hoof-care' | 'routine-checkup' | 'medication' | 'weight-check' | 'other';
export type HealthSeverity = 'routine' | 'minor' | 'moderate' | 'serious' | 'critical';

export interface HealthRecord {
  animalId: string;
  animalName: string;
  eventType: HealthEventType;
  date: string; // ISO date
  severity: HealthSeverity;
  description: string;
  treatment: string;
  medication: string;
  dosage: string;
  veterinarian: string;
  followUpDate: string;
  cost: number;
  resolved: boolean;
  notes: string;
  createdAt: number;
}

// ─── Feed Inventory ─────────────────────────────────────────────────

export type FeedType = 'hay' | 'grain' | 'pellets' | 'silage' | 'pasture' | 'supplement' | 'mineral' | 'salt-block' | 'scratch' | 'mash' | 'other';
export type FeedUnit = 'lbs' | 'kg' | 'bales' | 'bags' | 'tons' | 'bushels';

export interface FeedEntry {
  name: string;
  type: FeedType;
  brand: string;
  quantity: number;
  unit: FeedUnit;
  costPerUnit: number;
  purchaseDate: string;
  expirationDate: string;
  targetSpecies: Species[];
  proteinPercent: number;
  notes: string;
  createdAt: number;
}

// ─── Map Features (Geofences & Points) ──────────────────────────────

export type GeofenceType = 'fence' | 'pasture' | 'treatment' | 'outbuilding';
export type TreatmentType = 'fertilizer' | 'pesticide' | 'other';
export type MapPointType = 'water-source' | 'feeder' | 'mineral-station' | 'hazard' | 'gate' | 'shelter' | 'animal' | 'feature';

export interface MapRing {
  rings: number[][][];
}

export interface MapPath {
  paths: number[][][];
}

export type LineStyleType = 'solid' | 'dash' | 'dot' | 'dash-dot' | 'long-dash' | 'long-dash-dot' | 'short-dash' | 'short-dot' | 'short-dash-dot';

export interface GeofenceStyle {
  fillColor: string;
  fillOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderStyle: LineStyleType;
  label: string;
  labelColor: string;
  labelSize: number;
  labelFollowLine: boolean;
}

export interface GeoFence {
  type: GeofenceType;
  geometry: MapRing | MapPath;
  createdAt: number;
  createdBy: string;
  createdByName: string;
  material: string;
  fenceType: string;
  description: string;
  soilType: string;
  plotType: string;
  treatmentType: string;
  treatmentDate: string;
  treatmentCustomType: string;
  outbuildingType: string;
  style?: GeofenceStyle;
}

export interface MapPoint {
  type: MapPointType;
  longitude: number;
  latitude: number;
  description: string;
  createdAt: number;
  createdBy: string;
  createdByName: string;
  quantity: number;
}

// ─── User Directory ─────────────────────────────────────────────────

export interface UserEntry {
  email: string;
  displayName: string;
}

// ─── Favorite Map Locations ─────────────────────────────────────────

export interface FavoriteLocation {
  name: string;
  longitude: number;
  latitude: number;
  zoom: number;
  createdAt: number;
}

// ─── Default Breed Database ─────────────────────────────────────────

export const DEFAULT_BREEDS: Record<string, AnimalBreed> = {
  // Cattle
  angus: {
    name: 'Angus',
    species: 'cattle',
    purpose: 'meat',
    avgWeightLbs: 1200,
    temperament: 'Docile',
    climatePreference: 'Temperate',
    gestationDays: 283,
    maturityMonths: 24,
    lifeExpectancyYears: 20,
    notes: 'Excellent marbling. Naturally polled. Hardy and adaptable.',
  },
  hereford: {
    name: 'Hereford',
    species: 'cattle',
    purpose: 'meat',
    avgWeightLbs: 1300,
    temperament: 'Docile',
    climatePreference: 'Temperate to cold',
    gestationDays: 283,
    maturityMonths: 24,
    lifeExpectancyYears: 18,
    notes: 'White face with red body. Great foragers. Good mothers.',
  },
  holstein: {
    name: 'Holstein',
    species: 'cattle',
    purpose: 'dairy',
    avgWeightLbs: 1500,
    temperament: 'Calm',
    climatePreference: 'Temperate',
    gestationDays: 283,
    maturityMonths: 24,
    lifeExpectancyYears: 20,
    notes: 'Highest milk production of any breed. Black and white spotted.',
  },
  jersey: {
    name: 'Jersey',
    species: 'cattle',
    purpose: 'dairy',
    avgWeightLbs: 1000,
    temperament: 'Gentle',
    climatePreference: 'Temperate',
    gestationDays: 283,
    maturityMonths: 20,
    lifeExpectancyYears: 18,
    notes: 'Rich, high-butterfat milk. Smaller breed, efficient grazers.',
  },
  highlandCattle: {
    name: 'Highland',
    species: 'cattle',
    purpose: 'meat',
    avgWeightLbs: 1100,
    temperament: 'Docile',
    climatePreference: 'Cold',
    gestationDays: 283,
    maturityMonths: 30,
    lifeExpectancyYears: 20,
    notes: 'Long shaggy hair. Extremely cold hardy. Lean, tender beef.',
  },

  // Sheep
  dorper: {
    name: 'Dorper',
    species: 'sheep',
    purpose: 'meat',
    avgWeightLbs: 230,
    temperament: 'Calm',
    climatePreference: 'Hot and dry',
    gestationDays: 150,
    maturityMonths: 8,
    lifeExpectancyYears: 12,
    notes: 'Hair sheep — no shearing needed. Fast growth rate. Heat tolerant.',
  },
  merino: {
    name: 'Merino',
    species: 'sheep',
    purpose: 'fiber',
    avgWeightLbs: 200,
    temperament: 'Gentle',
    climatePreference: 'Temperate to hot',
    gestationDays: 150,
    maturityMonths: 12,
    lifeExpectancyYears: 12,
    notes: 'Finest wool of any sheep breed. Requires annual shearing.',
  },
  suffolk: {
    name: 'Suffolk',
    species: 'sheep',
    purpose: 'meat',
    avgWeightLbs: 275,
    temperament: 'Docile',
    climatePreference: 'Temperate',
    gestationDays: 147,
    maturityMonths: 10,
    lifeExpectancyYears: 13,
    notes: 'Black face and legs. Excellent meat breed. Fast growing lambs.',
  },

  // Goats
  boer: {
    name: 'Boer',
    species: 'goat',
    purpose: 'meat',
    avgWeightLbs: 250,
    temperament: 'Docile',
    climatePreference: 'Hot and dry',
    gestationDays: 150,
    maturityMonths: 12,
    lifeExpectancyYears: 12,
    notes: 'Premier meat goat. White body with red/brown head. Fast growth.',
  },
  nubian: {
    name: 'Nubian',
    species: 'goat',
    purpose: 'dairy',
    avgWeightLbs: 175,
    temperament: 'Vocal and friendly',
    climatePreference: 'Hot',
    gestationDays: 150,
    maturityMonths: 10,
    lifeExpectancyYears: 15,
    notes: 'Long floppy ears. High butterfat milk. Very vocal breed.',
  },
  laMancha: {
    name: 'LaMancha',
    species: 'goat',
    purpose: 'dairy',
    avgWeightLbs: 155,
    temperament: 'Calm and friendly',
    climatePreference: 'Temperate',
    gestationDays: 150,
    maturityMonths: 10,
    lifeExpectancyYears: 15,
    notes: 'Tiny ears. Excellent milk production. Hardy and adaptable.',
  },
  nigerianDwarf: {
    name: 'Nigerian Dwarf',
    species: 'goat',
    purpose: 'dairy',
    avgWeightLbs: 75,
    temperament: 'Friendly and playful',
    climatePreference: 'Temperate',
    gestationDays: 145,
    maturityMonths: 8,
    lifeExpectancyYears: 15,
    notes: 'Small but high butterfat milk. Great for small farms. Year-round breeding.',
  },

  // Pigs
  berkshire: {
    name: 'Berkshire',
    species: 'pig',
    purpose: 'meat',
    avgWeightLbs: 600,
    temperament: 'Docile',
    climatePreference: 'Temperate',
    gestationDays: 114,
    maturityMonths: 6,
    lifeExpectancyYears: 10,
    notes: 'Heritage breed. Premium pork with excellent marbling and flavor.',
  },
  duroc: {
    name: 'Duroc',
    species: 'pig',
    purpose: 'meat',
    avgWeightLbs: 700,
    temperament: 'Calm',
    climatePreference: 'Temperate',
    gestationDays: 114,
    maturityMonths: 6,
    lifeExpectancyYears: 10,
    notes: 'Red-brown color. Fast growing. Excellent feed conversion.',
  },
  kunekune: {
    name: 'Kunekune',
    species: 'pig',
    purpose: 'meat',
    avgWeightLbs: 200,
    temperament: 'Very friendly',
    climatePreference: 'Temperate',
    gestationDays: 116,
    maturityMonths: 12,
    lifeExpectancyYears: 15,
    notes: 'Small grazing pig from New Zealand. Great for pasture-based systems.',
  },

  // Chickens
  rhodeIslandRed: {
    name: 'Rhode Island Red',
    species: 'chicken',
    purpose: 'eggs',
    avgWeightLbs: 7,
    temperament: 'Hardy and friendly',
    climatePreference: 'All climates',
    gestationDays: 21,
    maturityMonths: 5,
    lifeExpectancyYears: 8,
    notes: '250-300 brown eggs/year. Extremely cold hardy. Great dual-purpose bird.',
  },
  leghorn: {
    name: 'Leghorn',
    species: 'chicken',
    purpose: 'eggs',
    avgWeightLbs: 5,
    temperament: 'Active and flighty',
    climatePreference: 'Warm',
    gestationDays: 21,
    maturityMonths: 4,
    lifeExpectancyYears: 7,
    notes: '280-320 white eggs/year. Top egg producer. Heat tolerant.',
  },
  cornishCross: {
    name: 'Cornish Cross',
    species: 'chicken',
    purpose: 'meat',
    avgWeightLbs: 10,
    temperament: 'Docile',
    climatePreference: 'Temperate',
    gestationDays: 21,
    maturityMonths: 2,
    lifeExpectancyYears: 1,
    notes: 'Commercial meat bird. Ready to process at 8 weeks. Fast growth.',
  },
  orpington: {
    name: 'Orpington',
    species: 'chicken',
    purpose: 'dual-purpose',
    avgWeightLbs: 8,
    temperament: 'Very docile and friendly',
    climatePreference: 'Cold hardy',
    gestationDays: 21,
    maturityMonths: 5,
    lifeExpectancyYears: 8,
    notes: 'Fluffy and friendly. 200+ brown eggs/year. Excellent broody hens.',
  },

  // Ducks
  pekin: {
    name: 'Pekin',
    species: 'duck',
    purpose: 'dual-purpose',
    avgWeightLbs: 9,
    temperament: 'Friendly',
    climatePreference: 'Temperate',
    gestationDays: 28,
    maturityMonths: 3,
    lifeExpectancyYears: 10,
    notes: 'Classic white farm duck. 200+ eggs/year. Fast meat growth.',
  },
  khakiCampbell: {
    name: 'Khaki Campbell',
    species: 'duck',
    purpose: 'eggs',
    avgWeightLbs: 5,
    temperament: 'Active',
    climatePreference: 'Temperate',
    gestationDays: 28,
    maturityMonths: 5,
    lifeExpectancyYears: 12,
    notes: 'Top egg-laying duck breed. 250-340 eggs/year. Very foraging oriented.',
  },

  // Horses
  quarterHorse: {
    name: 'Quarter Horse',
    species: 'horse',
    purpose: 'draft',
    avgWeightLbs: 1100,
    temperament: 'Calm and versatile',
    climatePreference: 'All climates',
    gestationDays: 340,
    maturityMonths: 48,
    lifeExpectancyYears: 30,
    notes: 'Most popular American horse breed. Excellent for ranch work and riding.',
  },

  // Rabbits
  newZealandWhite: {
    name: 'New Zealand White',
    species: 'rabbit',
    purpose: 'meat',
    avgWeightLbs: 11,
    temperament: 'Calm',
    climatePreference: 'Temperate',
    gestationDays: 31,
    maturityMonths: 4,
    lifeExpectancyYears: 8,
    notes: 'Premier meat rabbit. Fast growing. Good mothers with large litters.',
  },

  // Alpacas
  huacayaAlpaca: {
    name: 'Huacaya Alpaca',
    species: 'alpaca',
    purpose: 'fiber',
    avgWeightLbs: 175,
    temperament: 'Gentle and curious',
    climatePreference: 'Temperate to cold',
    gestationDays: 345,
    maturityMonths: 24,
    lifeExpectancyYears: 20,
    notes: 'Dense, crimpy fleece. Sheared annually. Need companion animals.',
  },

  // Bees
  italianHoneybee: {
    name: 'Italian Honeybee',
    species: 'bee',
    purpose: 'honey',
    avgWeightLbs: 0,
    temperament: 'Gentle',
    climatePreference: 'Temperate to warm',
    gestationDays: 21,
    maturityMonths: 0,
    lifeExpectancyYears: 5,
    notes: 'Most popular honeybee. Prolific honey producers. Gentle temperament.',
  },
};

// ─── Species Compatibility Matrix ───────────────────────────────────

export interface CompatibilityInfo {
  compatible: Species[];
  incompatible: Species[];
  notes: string;
}

export const SPECIES_COMPATIBILITY: Record<Species, CompatibilityInfo> = {
  cattle: {
    compatible: ['horse', 'donkey', 'goat', 'sheep', 'chicken', 'duck', 'alpaca', 'llama'],
    incompatible: ['pig'],
    notes: 'Cattle coexist well with most livestock. Avoid close quarters with pigs due to disease transmission risks.',
  },
  sheep: {
    compatible: ['cattle', 'horse', 'donkey', 'chicken', 'duck', 'alpaca', 'llama'],
    incompatible: ['goat', 'pig'],
    notes: 'Sheep and goats can share pasture but require different mineral supplements (copper is toxic to sheep). Guard animals like donkeys or llamas protect sheep from predators.',
  },
  goat: {
    compatible: ['cattle', 'horse', 'donkey', 'chicken', 'duck', 'llama'],
    incompatible: ['sheep'],
    notes: 'Goats are escape artists — ensure fencing is goat-proof. Do not share mineral blocks with sheep (copper toxicity).',
  },
  pig: {
    compatible: ['chicken', 'duck'],
    incompatible: ['cattle', 'sheep', 'goat', 'horse', 'rabbit'],
    notes: 'Pigs should generally be housed separately. They can coexist with poultry in pasture-based systems.',
  },
  chicken: {
    compatible: ['cattle', 'sheep', 'goat', 'pig', 'duck', 'horse', 'donkey', 'alpaca', 'llama'],
    incompatible: ['turkey'],
    notes: 'Chickens are excellent companion animals that reduce pest populations. Keep separate from turkeys (blackhead disease).',
  },
  duck: {
    compatible: ['cattle', 'sheep', 'goat', 'pig', 'chicken', 'horse', 'alpaca'],
    incompatible: [],
    notes: 'Ducks need access to water. They get along with most livestock and are great pest controllers.',
  },
  turkey: {
    compatible: ['cattle', 'sheep', 'goat', 'horse'],
    incompatible: ['chicken'],
    notes: 'Keep turkeys separate from chickens to prevent blackhead disease transmission.',
  },
  horse: {
    compatible: ['cattle', 'sheep', 'goat', 'chicken', 'duck', 'donkey', 'alpaca', 'llama'],
    incompatible: ['pig'],
    notes: 'Horses are social and generally get along with other livestock. Donkeys make excellent companion animals for horses.',
  },
  donkey: {
    compatible: ['cattle', 'sheep', 'goat', 'horse', 'chicken', 'alpaca', 'llama'],
    incompatible: [],
    notes: 'Donkeys are natural guard animals for sheep, goats, and cattle. They deter predators like coyotes and dogs.',
  },
  rabbit: {
    compatible: ['chicken'],
    incompatible: ['pig', 'cattle', 'horse'],
    notes: 'Rabbits should be housed in secure enclosures. They can share space with chickens but need predator protection.',
  },
  alpaca: {
    compatible: ['cattle', 'sheep', 'goat', 'chicken', 'duck', 'horse', 'donkey', 'llama'],
    incompatible: [],
    notes: 'Alpacas are gentle herd animals that need companions. They can serve as guard animals for smaller livestock.',
  },
  llama: {
    compatible: ['cattle', 'sheep', 'goat', 'chicken', 'horse', 'donkey', 'alpaca'],
    incompatible: [],
    notes: 'Llamas are excellent guard animals for sheep and goats. They are territorial and will chase off predators.',
  },
  bee: {
    compatible: [],
    incompatible: [],
    notes: 'Bees are managed in hives and do not directly interact with other livestock. Place hives away from high-traffic animal areas.',
  },
  other: {
    compatible: [],
    incompatible: [],
    notes: '',
  },
};

// ─── Gestation / Incubation Reference ───────────────────────────────

export const GESTATION_DAYS: Record<Species, number> = {
  cattle: 283,
  sheep: 150,
  goat: 150,
  pig: 114,
  chicken: 21,
  duck: 28,
  turkey: 28,
  horse: 340,
  donkey: 365,
  rabbit: 31,
  alpaca: 345,
  llama: 350,
  bee: 21,
  other: 0,
};

// ─── Task Type Icons & Colors ───────────────────────────────────────

export const TASK_TYPE_ICONS: Record<TaskType, string> = {
  feed: 'restaurant',
  water: 'water_drop',
  clean: 'cleaning_services',
  'vet-check': 'medical_services',
  vaccinate: 'vaccines',
  deworm: 'medication',
  'hoof-trim': 'content_cut',
  shear: 'cut',
  breed: 'favorite',
  move: 'swap_horiz',
  repair: 'build',
  general: 'task_alt',
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  feed: 'orange',
  water: 'blue',
  clean: 'teal',
  'vet-check': 'red',
  vaccinate: 'purple',
  deworm: 'deep-purple',
  'hoof-trim': 'brown',
  shear: 'amber',
  breed: 'pink',
  move: 'cyan',
  repair: 'grey',
  general: 'blue-grey',
};

export const ANIMAL_STATUS_COLORS: Record<AnimalStatus, string> = {
  active: 'green',
  pregnant: 'pink',
  nursing: 'purple',
  growing: 'light-green',
  producing: 'teal',
  dry: 'blue-grey',
  quarantined: 'red',
  'for-sale': 'orange',
  sold: 'grey',
  deceased: 'grey-8',
};

export const HEALTH_EVENT_ICONS: Record<HealthEventType, string> = {
  vaccination: 'vaccines',
  deworming: 'medication',
  illness: 'sick',
  injury: 'healing',
  surgery: 'local_hospital',
  dental: 'dentistry',
  'hoof-care': 'content_cut',
  'routine-checkup': 'medical_services',
  medication: 'medication_liquid',
  'weight-check': 'monitor_weight',
  other: 'note_add',
};

export const HEALTH_SEVERITY_COLORS: Record<HealthSeverity, string> = {
  routine: 'green',
  minor: 'blue',
  moderate: 'orange',
  serious: 'deep-orange',
  critical: 'red',
};

export const BREEDING_STATUS_COLORS: Record<BreedingStatus, string> = {
  planned: 'grey',
  bred: 'pink',
  'confirmed-pregnant': 'purple',
  'due-soon': 'orange',
  delivered: 'green',
  failed: 'red',
  cancelled: 'grey-5',
};

// ─── Species Options ────────────────────────────────────────────────

export const SPECIES_OPTIONS: { label: string; value: Species }[] = [
  { label: 'Cattle', value: 'cattle' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Goat', value: 'goat' },
  { label: 'Pig', value: 'pig' },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Duck', value: 'duck' },
  { label: 'Turkey', value: 'turkey' },
  { label: 'Horse', value: 'horse' },
  { label: 'Donkey', value: 'donkey' },
  { label: 'Rabbit', value: 'rabbit' },
  { label: 'Alpaca', value: 'alpaca' },
  { label: 'Llama', value: 'llama' },
  { label: 'Bee (Hive)', value: 'bee' },
  { label: 'Other', value: 'other' },
];

export const FARM_TYPE_OPTIONS: { label: string; value: FarmType }[] = [
  { label: 'Ranch', value: 'ranch' },
  { label: 'Dairy Farm', value: 'dairy' },
  { label: 'Poultry Farm', value: 'poultry' },
  { label: 'Mixed Operation', value: 'mixed' },
  { label: 'Hobby Farm', value: 'hobby' },
  { label: 'Commercial', value: 'commercial' },
];
