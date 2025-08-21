// Life CEO: Cache control middleware
export const cacheControl = (duration: string) => {
  return (req: any, res: any, next: any) => {
    const seconds = parseDuration(duration);
    res.set('Cache-Control', `public, max-age=${seconds}, immutable`);
    next();
  };
};

const parseDuration = (duration: string): number => {
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    y: 31536000,
  };
  
  const match = duration.match(/^(\d+)([smhdwy])$/);
  if (!match) return 0;
  
  const [, value, unit] = match;
  return parseInt(value) * (units[unit] || 0);
};