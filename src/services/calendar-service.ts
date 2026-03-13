import { GESTATION_DAYS, DEFAULT_BREEDS, SPECIES_COMPATIBILITY } from 'src/models/livestock';
import type { Species, AnimalBreed } from 'src/models/livestock';

export interface CalendarEvent {
  animalId: string;
  animalName: string;
  action: 'breeding-season' | 'gestation-check' | 'expected-birth' | 'vaccination-due' | 'shearing' | 'deworming';
  eventDate: Date;
  label: string;
}

export function getGestationDays(species: Species): number {
  return GESTATION_DAYS[species] ?? 0;
}

export function calculateDueDate(breedingDate: string, species: Species): Date {
  const date = new Date(breedingDate);
  date.setDate(date.getDate() + getGestationDays(species));
  return date;
}

export function generateSeasonalCalendar(species: Species[], year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const sp of species) {
    const breeds = Object.entries(DEFAULT_BREEDS).filter(([, b]) => b.species === sp);
    if (breeds.length === 0) continue;

    // Seasonal deworming (spring + fall)
    events.push({
      animalId: '',
      animalName: sp.charAt(0).toUpperCase() + sp.slice(1),
      action: 'deworming',
      eventDate: new Date(year, 2, 15), // March 15
      label: `Spring deworming — ${sp}`,
    });
    events.push({
      animalId: '',
      animalName: sp.charAt(0).toUpperCase() + sp.slice(1),
      action: 'deworming',
      eventDate: new Date(year, 8, 15), // September 15
      label: `Fall deworming — ${sp}`,
    });

    // Annual vaccination
    events.push({
      animalId: '',
      animalName: sp.charAt(0).toUpperCase() + sp.slice(1),
      action: 'vaccination-due',
      eventDate: new Date(year, 3, 1), // April 1
      label: `Annual vaccinations — ${sp}`,
    });

    // Species-specific events
    if (sp === 'sheep' || sp === 'alpaca') {
      events.push({
        animalId: '',
        animalName: sp.charAt(0).toUpperCase() + sp.slice(1),
        action: 'shearing',
        eventDate: new Date(year, 3, 15), // April 15
        label: `Shearing season — ${sp}`,
      });
    }

    // Breeding season reminders
    if (sp === 'cattle' || sp === 'sheep' || sp === 'goat') {
      events.push({
        animalId: '',
        animalName: sp.charAt(0).toUpperCase() + sp.slice(1),
        action: 'breeding-season',
        eventDate: new Date(year, sp === 'sheep' ? 8 : 4, 1),
        label: `Breeding season begins — ${sp}`,
      });
    }
  }

  events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  return events;
}

export function getBreedInfo(breedId: string): AnimalBreed | null {
  return DEFAULT_BREEDS[breedId] ?? null;
}

export function getCompatibilityInfo(species: Species): { compatible: Species[]; incompatible: Species[] } {
  const info = SPECIES_COMPATIBILITY[species];
  if (!info) return { compatible: [], incompatible: [] };
  return { compatible: info.compatible, incompatible: info.incompatible };
}
