// Free OpenStreetMap lookups (Nominatim geocoding + Overpass places search).
const UA = "PowLink/1.0 (dog welfare platform)";

export type GeoPoint = { lat: number; lng: number; label: string };
export type NearbyPlace = {
  name: string;
  kind: "clinic" | "shelter";
  distanceKm: number;
  address: string | null;
  phone: string | null;
  mapsUrl: string;
};

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "eg");
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ar,en" } });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (!rows[0]) return null;
  return { lat: Number(rows[0].lat), lng: Number(rows[0].lon), label: rows[0].display_name };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "16");
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ar,en" } });
  if (!res.ok) return null;
  const row = (await res.json()) as { display_name?: string };
  return row.display_name ?? null;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function overpass(query: string) {
  let last = 0;
  for (const url of OVERPASS_MIRRORS) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (res.ok) return res;
    last = res.status;
  }
  throw new Error(`Places search failed (${last})`);
}

export async function findNearbyPlaces(
  point: { lat: number; lng: number },
  kind: "clinic" | "shelter" | "both",
  limit = 5,
): Promise<NearbyPlace[]> {
  const filters: string[] = [];
  for (const radius of [8000, 25000]) {
    filters.length = 0;
    if (kind !== "shelter") filters.push(`nwr["amenity"="veterinary"](around:${radius},${point.lat},${point.lng});`);
    if (kind !== "clinic") filters.push(`nwr["amenity"="animal_shelter"](around:${radius},${point.lat},${point.lng});`);
    const query = `[out:json][timeout:20];(${filters.join("")});out center tags 60;`;
    const res = await overpass(query);
    const json = (await res.json()) as {
      elements: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[];
    };
    const places = json.elements
      .map((el): NearbyPlace | null => {
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        const tags = el.tags ?? {};
        if (lat == null || lng == null) return null;
        const name: string | undefined = tags["name:ar"] ?? tags.name ?? tags["name:en"];
        if (!name) return null;
        const street = [tags["addr:street"], tags["addr:suburb"] ?? tags["addr:district"], tags["addr:city"]]
          .filter(Boolean)
          .join("، ");
        const place: NearbyPlace = {
          name,
          kind: tags.amenity === "animal_shelter" ? "shelter" : "clinic",
          distanceKm: Math.round(distanceKm(point, { lat, lng }) * 10) / 10,
          address: street || null,
          phone: tags.phone ?? tags["contact:phone"] ?? null,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        };
        return place;
      })
      .filter((p): p is NearbyPlace => p !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    if (places.length >= 2 || radius === 25000) return places.slice(0, limit);
  }
  return [];
}
