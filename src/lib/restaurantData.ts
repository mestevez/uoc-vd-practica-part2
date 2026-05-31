import * as d3 from 'd3';

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  zone: string;
  food: string;
  food_sample: string;
  ambient: string;
  keywords: string;
  menu: string;
  target: string;
  score: number;
  opinions_count: number;
  price: number;
  opinions_count_log: number;
  weekly_hours: number;
  open_lunch: boolean;
  open_dinner: boolean;
  open_weekend: boolean;
  latitude: number;
  longitude: number;
  dist_centre_km: number;
  renda_mitjana_bruta: number;
}

function parseEuropeanNumber(value: string): number {
  // Replace comma decimal separator with dot
  return parseFloat(value.replace(',', '.'));
}

export async function loadRestaurantData(base = import.meta.env.BASE_URL): Promise<Restaurant[]> {
  const text = await d3.text(`${base}data/data_restaurants_clean.csv`);

  // The CSV uses semicolons as delimiters
  const parsed = d3.dsvFormat(';').parse(text);

  return parsed
    .filter((d) => d['name'] && d['name'].trim() !== '')
    .map((d) => ({
      id: +d[''] || 0,
      name: d['name'] ?? '',
      address: d['address'] ?? '',
      city: d['city'] ?? '',
      postal_code: d['postal_code'] ?? '',
      zone: d['zone'] ?? '',
      food: d['food'] ?? '',
      food_sample: d['food_sample'] ?? '',
      ambient: d['ambient'] ?? '',
      keywords: d['keywords'] ?? '',
      menu: d['menu'] ?? '',
      target: d['target'] ?? '',
      score: parseEuropeanNumber(d['score'] ?? '0'),
      opinions_count: +(d['opinions_count'] ?? 0),
      price: parseEuropeanNumber(d['price'] ?? '0'),
      opinions_count_log: parseEuropeanNumber(d['opinions_count_log'] ?? '0'),
      weekly_hours: parseEuropeanNumber(d['weekly_hours'] ?? '0'),
      open_lunch: d['open_lunch'] === 'TRUE',
      open_dinner: d['open_dinner'] === 'TRUE',
      open_weekend: d['open_weekend'] === 'TRUE',
      latitude: parseEuropeanNumber(d['latitude'] ?? '0'),
      longitude: parseEuropeanNumber(d['longitude'] ?? '0'),
      dist_centre_km: parseEuropeanNumber(d['dist_centre_km'] ?? '0'),
      renda_mitjana_bruta: +(d['renda_mitjana_bruta'] ?? 0),
    }));
}

