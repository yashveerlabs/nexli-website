import { z } from 'zod';

/** String-based (input === output) so it satisfies the kit `Form<T>`. */
export const visitorSchema = z.object({
  name: z.string().trim().min(2, 'Visitor name required'),
  phone: z.string().trim().refine((v) => v === '' || /^\d{10}$/.test(v), 'Enter a 10-digit mobile'),
  purpose: z.enum(['parent_meeting', 'admission', 'vendor', 'interview', 'official', 'maintenance', 'delivery', 'other']),
  whomToMeet: z.string().trim().optional(),
  company: z.string().trim().optional(),
  partySize: z.string().refine((v) => v === '' || (Number(v) >= 1 && Number(v) <= 99), 'Party size 1–99'),
  idType: z.enum(['aadhaar', 'pan', 'driving_license', 'voter_id', 'other']).optional(),
  idLast4: z.string().trim().refine((v) => v === '' || /^\d{4}$/.test(v), 'Last 4 digits only'),
  vehicleNo: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type VisitorValues = z.infer<typeof visitorSchema>;

export const emptyVisitor: VisitorValues = {
  name: '', phone: '', purpose: 'parent_meeting', whomToMeet: '', company: '',
  partySize: '1', idType: undefined, idLast4: '', vehicleNo: '', notes: '',
};

const pad = (n: number, w: number) => String(n).padStart(w, '0');

/** Human-readable gate pass number, e.g. V-260613-0421 (date + time tail). */
export function generatePassNo(now = new Date()): string {
  const ymd = `${pad(now.getFullYear() % 100, 2)}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const tail = pad((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % 10000, 4);
  return `V-${ymd}-${tail}`;
}

/** 4-digit gate OTP for the host to verify the visitor. */
export function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
