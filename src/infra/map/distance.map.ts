

function toRadians(value: number) {
  return value * Math.PI / 180;
}

export function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const WORLD_RADIUS = 6371; // Earth's average radius in kilometers

  const dLat = toRadians(latitude2 - latitude1);
  const dLon = toRadians(longitude2 - longitude1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = WORLD_RADIUS * c;

  return distance;
}
