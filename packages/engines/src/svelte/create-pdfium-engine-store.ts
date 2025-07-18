import { readable, writable, type Readable } from 'svelte/store';
import type { PdfiumEngineConfig, PdfiumEngineController } from './types';
import { AllLogger, type PdfEngine } from '@embedpdf/models';
import { getSingleton, retain, release } from './cache';

const DEFAULT_WASM =
  'https://cdn.jsdelivr.net/npm/@embedpdf/pdfium@__PDFIUM_VERSION__/dist/pdfium.wasm';

interface PdfiumEngineStores {
  engine: Readable<PdfEngine | null>;
  isLoading: Readable<boolean>;
  error: Readable<Error | null>;
  controller: PdfiumEngineController;
}

export function createPdfiumEngineStore(cfg: PdfiumEngineConfig = {}): PdfiumEngineStores {
  let config: Required<PdfiumEngineConfig> = {
    wasmUrl: cfg.wasmUrl ?? DEFAULT_WASM,
    worker: cfg.worker ?? true,
    logger: cfg.logger ?? new AllLogger([]),
    singletonKey: cfg.singletonKey ?? '',
    defer: cfg.defer ?? false,
  };

  const engine$ = writable<PdfEngine | null>(null);
  const loading$ = writable<boolean>(!config.defer);
  const error$ = writable<Error | null>(null);

  let current: PdfEngine | null = null;
  let destroyed = false;
  let loadingPromise: Promise<void> | null = null;
  let acquiredSingleton = false;

  async function actuallyLoad() {
    if (typeof window === 'undefined') {
      // SSR: just mark not loading (or keep as loading if you prefer)
      loading$.set(false);
      return;
    }
    loading$.set(true);
    error$.set(null);

    if (config.singletonKey) {
      const existing = getSingleton(config.singletonKey);
      if (existing) {
        current = existing;
        engine$.set(existing);
        loading$.set(false);
        acquiredSingleton = true;
        return;
      }
    }

    try {
      const { createPdfiumEngine } = config.worker
        ? await import('@embedpdf/engines/pdfium-worker-engine')
        : await import('@embedpdf/engines/pdfium-direct-engine');

      const eng = await createPdfiumEngine(config.wasmUrl, config.logger);
      if (destroyed) {
        eng.destroy?.();
        return;
      }
      current = eng;
      engine$.set(eng);
      if (config.singletonKey) {
        retain(config.singletonKey, eng);
        acquiredSingleton = true;
      }
    } catch (e) {
      error$.set(e as Error);
    } finally {
      if (!destroyed) loading$.set(false);
    }
  }

  function load() {
    if (!loadingPromise) loadingPromise = actuallyLoad();
    return loadingPromise;
  }

  async function reload(partial?: Partial<PdfiumEngineConfig>) {
    if (partial) config = { ...config, ...partial };
    destroyInternal(true);
    loadingPromise = null;
    await load();
  }

  function destroyInternal(reloading = false) {
    destroyed = !reloading;
    if (config.singletonKey && acquiredSingleton) {
      release(config.singletonKey);
      acquiredSingleton = false;
    } else if (current) {
      current.destroy?.();
    }
    current = null;
    engine$.set(null);
    if (!reloading) loading$.set(true);
  }

  function destroy() {
    destroyInternal(false);
  }

  // lazy: only load on first subscribe unless defer=false (default false = immediate load)
  const lazyEngine = readable<PdfEngine | null>(null, (set) => {
    const unsub = engine$.subscribe(set);
    if (!config.defer) load();
    return () => {
      unsub();
      destroy();
    };
  });

  const controller: PdfiumEngineController = {
    get engine() {
      return current;
    },
    get isLoading() {
      let v: boolean;
      loading$.subscribe((x) => (v = x))();
      return v!;
    },
    get error() {
      let v: Error | null;
      error$.subscribe((x) => (v = x))();
      return v!;
    },
    reload,
    destroy,
    load,
    config: () => config,
  };

  return {
    engine: lazyEngine,
    isLoading: { subscribe: loading$.subscribe },
    error: { subscribe: error$.subscribe },
    controller,
  };
}
