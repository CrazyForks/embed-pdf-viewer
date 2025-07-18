import type { PdfEngine } from '@embedpdf/models';

const engines = new Map<string, PdfEngine>();
const refs = new Map<string, number>();

export function getSingleton(key: string) {
  return engines.get(key) ?? null;
}
export function retain(key: string, eng: PdfEngine) {
  engines.set(key, eng);
  refs.set(key, (refs.get(key) ?? 0) + 1);
}
export function release(key: string) {
  const n = (refs.get(key) ?? 1) - 1;
  if (n <= 0) {
    const e = engines.get(key);
    e?.destroy?.();
    engines.delete(key);
    refs.delete(key);
  } else {
    refs.set(key, n);
  }
}
export function forceClear(key: string) {
  const e = engines.get(key);
  e?.destroy?.();
  engines.delete(key);
  refs.delete(key);
}
