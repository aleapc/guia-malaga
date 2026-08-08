import { browser } from '$app/environment';
import localforage from 'localforage';
import { encryptStr, decryptStr, encryptBlob, decryptBlob } from './secure.svelte';

// "Minhas reservas" — o viajante reserva voos/hotéis POR FORA e registra aqui. Fica SÓ no
// aparelho: a lista (com localizadores) é cifrada com o PIN quando há um; os anexos (PDF/foto
// da confirmação) vão para o IndexedDB, cifrados em repouso. Nada disso sobe para o repositório.

export type ResType = 'voo' | 'hotel' | 'carro' | 'trem' | 'ingresso' | 'restaurante' | 'outro';

export const RES_TYPES: { id: ResType; label: string; emoji: string }[] = [
  { id: 'voo', label: 'Voo', emoji: '🛫' },
  { id: 'hotel', label: 'Hospedagem', emoji: '🛏️' },
  { id: 'trem', label: 'Trem / AVE', emoji: '🚆' },
  { id: 'carro', label: 'Carro / transfer', emoji: '🚗' },
  { id: 'ingresso', label: 'Ingresso / passeio', emoji: '🎟️' },
  { id: 'restaurante', label: 'Restaurante', emoji: '🍽️' },
  { id: 'outro', label: 'Outro', emoji: '📌' }
];
export const resType = (id: string) => RES_TYPES.find((t) => t.id === id) ?? RES_TYPES[6];

export interface Reservation {
  id: string;
  type: ResType;
  title: string; // ex.: "Iberia GRU→MAD" ou "Gran Hotel Miramar"
  provider?: string; // companhia / hotel / site
  code?: string; // localizador / código de confirmação
  start?: string; // ISO (embarque / check-in) — datetime-local
  end?: string; // ISO (chegada / check-out)
  location?: string; // cidade / aeroporto
  cost?: string; // texto livre (ex.: "€1.240 · 2 pax")
  notes?: string;
  ts: number; // criado em
  attachName?: string; // nome do anexo, se houver
  attachMime?: string;
}

const KEY = 'gpe-reservas';
const attachStore = browser ? localforage.createInstance({ name: 'gpe', storeName: 'reservations' }) : null;

export const reservationsStore = $state<{ list: Reservation[]; ready: boolean; locked: boolean }>({
  list: [],
  ready: false,
  locked: false
});

function newId(): string {
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function persist() {
  if (!browser) return;
  const payload = await encryptStr(JSON.stringify(reservationsStore.list));
  localStorage.setItem(KEY, payload);
}

export async function loadReservations() {
  if (!browser) return;
  reservationsStore.ready = false;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    reservationsStore.list = [];
    reservationsStore.locked = false;
    reservationsStore.ready = true;
    return;
  }
  try {
    const json = await decryptStr(raw);
    reservationsStore.list = JSON.parse(json);
    reservationsStore.locked = false;
  } catch {
    // PIN ativo e ainda travado: a tela de bloqueio do app cuida de destravar.
    reservationsStore.locked = true;
  }
  reservationsStore.ready = true;
}

/** Cria/atualiza uma reserva. Se `file` vier, salva o anexo cifrado. */
export async function saveReservation(
  data: Omit<Reservation, 'id' | 'ts'> & { id?: string; ts?: number },
  file?: File | null
): Promise<Reservation> {
  const rec: Reservation = {
    ...data,
    id: data.id ?? newId(),
    ts: data.ts ?? Date.now()
  };
  if (file && attachStore) {
    await attachStore.setItem(rec.id, await encryptBlob(file));
    rec.attachName = file.name;
    rec.attachMime = file.type || 'application/octet-stream';
  }
  const i = reservationsStore.list.findIndex((r) => r.id === rec.id);
  if (i >= 0) reservationsStore.list[i] = rec;
  else reservationsStore.list.push(rec);
  reservationsStore.list.sort((a, b) => (a.start || '').localeCompare(b.start || '') || a.ts - b.ts);
  await persist();
  return rec;
}

export async function deleteReservation(id: string) {
  reservationsStore.list = reservationsStore.list.filter((r) => r.id !== id);
  if (attachStore) await attachStore.removeItem(id);
  await persist();
}

/** Devolve uma URL de objeto para o anexo (decifrado), ou null. Lembre de revogar depois. */
export async function attachmentUrl(id: string): Promise<string | null> {
  if (!attachStore) return null;
  const blob = await attachStore.getItem<Blob>(id);
  if (!blob) return null;
  return URL.createObjectURL(await decryptBlob(blob));
}
