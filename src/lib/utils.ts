import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayPK(): string {
  const now = new Date();
  const pk = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  return pk.toISOString().slice(0, 10);
}

export function fmt12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function fmtDatePK(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function remainingMinutes(time24: string, durMinutes: number): { label: string; ended: boolean; live: boolean } {
  const now = new Date();
  const [h, m] = time24.split(':').map(Number);
  const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const slotEnd = new Date(slotStart.getTime() + durMinutes * 60 * 1000);
  if (now > slotEnd) return { label: 'Ended', ended: true, live: false };
  if (now >= slotStart) return { label: 'Live', ended: false, live: true };
  const diff = slotStart.getTime() - now.getTime();
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return { label: `${hrs}h ${mins}m`, ended: false, live: false };
  return { label: `${mins}m`, ended: false, live: false };
}
