function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

export interface CategoryColors {
  bg: string;
  text: string;
  solid: string;
  dim: string;
  glow: string;
  dot: string;
}

export function getCategoryColors(category: string, isLight: boolean): CategoryColors {
  const hue = hashHue(category || 'General');
  return {
    bg: isLight ? `hsl(${hue} 70% 93%)` : `hsl(${hue} 45% 16%)`,
    text: isLight ? `hsl(${hue} 65% 32%)` : `hsl(${hue} 85% 78%)`,
    solid: isLight ? `hsl(${hue} 65% 45%)` : `hsl(${hue} 70% 55%)`,
    dim: `hsl(${hue} 70% 62% / 0.7)`,
    glow: `hsl(${hue} 85% 62% / 0.4)`,
    dot: `hsl(${hue} 70% 55%)`,
  };
}
