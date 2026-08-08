import { browser } from '$app/environment';
import { base } from '$app/paths';
import { seedDecrypt } from './secure.svelte';
import { setCoupleFromDataURL } from './personalize.svelte';

export interface FlightLeg {
  journey: string;
  date: string;
  airline: string;
  flightNo: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
}

export interface Lodging {
  name: string;
  kind?: string;
  address: string;
  checkin: string;
  checkout: string;
  code?: string;
  host?: string;
  phone?: string;
  note?: string;
  mapQuery?: string;
}

export interface Car {
  company: string;
  confirmation?: string;
  code?: string;
  pickup: string;
  pickupAt: string;
  dropoff: string;
  dropoffAt: string;
  phone?: string;
  note?: string;
}

export interface Insurance {
  company: string;
  insured?: string; // nome de quem está coberto
  policy: string; // nº do bilhete
  plan?: string;
  validity?: string;
  coverage?: string[]; // linhas de cobertura
  phone: string; // telefone principal (assistência)
  phones?: { label: string; number: string }[];
  email?: string;
  claimUrl?: string;
  note?: string;
}

export interface TripPlan {
  flights: FlightLeg[];
  lodgings: Lodging[];
  cars: Car[];
  insurances: Insurance[];
  docsNote: string;
  /** Optional couple photo (data URL) carried inside the encrypted bundle. */
  couplePhoto?: string;
}

function emptyTrip(): TripPlan {
  return { flights: [], lodgings: [], cars: [], insurances: [], docsNote: '' };
}

// Generic/empty in the repo — the REAL data lives only inside the encrypted bundle
// (static/trip-seed.txt) and is decrypted in memory with the shared password.
export const tripPlan = $state<TripPlan>(emptyTrip());
export const tripState = $state<{ unlocked: boolean }>({ unlocked: false });

export async function seedExistsInRepo(): Promise<boolean> {
  if (!browser) return false;
  try {
    // No cache-buster: the service worker serves the precached seed (works OFFLINE),
    // and a new deploy revisions it via Workbox so it still updates online.
    const r = await fetch(`${base}/trip-seed.txt`);
    if (!r.ok) return false;
    return (await r.text()).trim().startsWith('gpeseed:');
  } catch {
    return false;
  }
}

const CACHE_KEY = 'gpe-trip-cache';
const SEED_HASH_KEY = 'gpe-seed-hash';

// Cipher of the seed used in the current unlock — lets us stamp the cache so we can later
// tell whether the published seed changed (e.g. I added the insurances after they unlocked).
let lastCipher = '';

function quickHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

/** Remember the unlocked trip on THIS device (stored decrypted; protected by the phone's own lock). */
export function cacheTrip() {
  if (browser) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(tripPlan));
      if (lastCipher) localStorage.setItem(SEED_HASH_KEY, quickHash(lastCipher));
    } catch {
      /* ignore */
    }
  }
}

/** If this device chose to stay unlocked, load the remembered trip (no password needed). */
export function loadTripCache(): boolean {
  if (!browser) return false;
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return false;
  try {
    Object.assign(tripPlan, { ...emptyTrip(), ...JSON.parse(raw) });
    tripState.unlocked = true;
    return true;
  } catch {
    return false;
  }
}

/** True if the published seed differs from the one cached on this device (reservations changed). */
export async function seedChangedSinceCache(): Promise<boolean> {
  if (!browser) return false;
  const saved = localStorage.getItem(SEED_HASH_KEY);
  if (!saved) return false; // nothing to compare against → don't nag
  try {
    const r = await fetch(`${base}/trip-seed.txt`);
    if (!r.ok) return false;
    const cipher = (await r.text()).trim();
    return quickHash(cipher) !== saved;
  } catch {
    return false;
  }
}

/** Forget the unlocked trip on this device → password is required again. */
export function clearTripCache() {
  if (browser) {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(SEED_HASH_KEY);
  }
  tripState.unlocked = false;
  Object.assign(tripPlan, emptyTrip());
}

export type UnlockResult = 'ok' | 'wrong-password' | 'no-seed';

/** Decrypt the committed bundle with the shared password and populate the trip (in memory only).
 *  Distinguishes a wrong password from a seed that couldn't be loaded (e.g. offline, not cached). */
export async function loadSeedFromRepo(password: string): Promise<UnlockResult> {
  if (!browser) return 'no-seed';
  let cipher: string;
  try {
    const r = await fetch(`${base}/trip-seed.txt`);
    if (!r.ok) return 'no-seed';
    cipher = (await r.text()).trim();
    if (!cipher.startsWith('gpeseed:')) return 'no-seed';
  } catch {
    return 'no-seed';
  }
  try {
    const obj = JSON.parse(await seedDecrypt(cipher, password));
    Object.assign(tripPlan, { ...emptyTrip(), ...obj });
    if (obj.couplePhoto) {
      await setCoupleFromDataURL(obj.couplePhoto);
    }
    lastCipher = cipher; // stamp so cacheTrip can record which seed version this is
    tripState.unlocked = true;
    return 'ok';
  } catch {
    return 'wrong-password';
  }
}
