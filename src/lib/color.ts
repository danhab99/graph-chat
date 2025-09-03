export function calculateColor(i: number): string {
  const hue = (133 * (i + 1) - 80) % 360;
  const lum = 12 * Math.sin(1.13 * i + 0.6) + 70;
  return `hsl(${hue}, 100%, ${lum}%)`;
}
