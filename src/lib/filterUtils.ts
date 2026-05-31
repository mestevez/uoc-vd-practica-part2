import { Restaurant, foodTypes, ambientTypes } from './restaurantData';

function zoneMatches(r: Restaurant, zones: string[]): boolean {
  return zones.length === 0 || zones.includes(r.zone);
}

function foodMatches(r: Restaurant, foods: string[]): boolean {
  if (foods.length === 0) return true;
  return foodTypes(r).some((f) => foods.includes(f));
}

function ambientMatches(r: Restaurant, ambients: string[]): boolean {
  if (ambients.length === 0) return true;
  return ambientTypes(r).some((a) => ambients.includes(a));
}

export function applyMapaFilters(
  data: Restaurant[],
  zones: string[],
  foods: string[]
): Restaurant[] {
  return data.filter(
    (r) => r.latitude !== 0 && r.longitude !== 0 && zoneMatches(r, zones) && foodMatches(r, foods)
  );
}

export function applyExploracioFilters(
  data: Restaurant[],
  zones: string[],
  foods: string[],
  ambients: string[],
  priceRange: [number, number]
): Restaurant[] {
  return data.filter((r) => {
    const priceOk =
      r.price === 0 || (r.price >= priceRange[0] && r.price <= priceRange[1]);
    return (
      zoneMatches(r, zones) &&
      foodMatches(r, foods) &&
      ambientMatches(r, ambients) &&
      priceOk
    );
  });
}

export function applyAnalisiFilters(
  data: Restaurant[],
  zones: string[],
  foods: string[]
): Restaurant[] {
  return data.filter((r) => zoneMatches(r, zones) && foodMatches(r, foods));
}

