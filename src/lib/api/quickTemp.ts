/**
 * Pull a minimal current temperature for a location, using the Open-Meteo
 * ensemble best-match. Used for the saved-locations rail mini-temps.
 */
export async function quickTemp(lat: number, lon: number): Promise<number | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m&timezone=auto&temperature_unit=celsius`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    return j.current?.temperature_2m ?? null;
  } catch {
    return null;
  }
}
