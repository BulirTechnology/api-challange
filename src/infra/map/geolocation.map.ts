export function isInsideLuanda(latitude: number, longitude: number) {
  // Geographic limits of Luanda
  const luandaLimits = {
    north: -8.797643,
    sul: -8.960688,
    leste: 13.410415,
    west: 13.166375
  };

  if (latitude >= luandaLimits.sul && latitude <= luandaLimits.north &&
      longitude >= luandaLimits.west && longitude <= luandaLimits.leste) {
    return true;
  } else {
    return false;
  }
}
