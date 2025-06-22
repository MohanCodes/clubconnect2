// Get today's ID (YYYY-MM-DD)
export function getTodayId(): string {
  return new Date().toISOString().slice(0, 10);
}
