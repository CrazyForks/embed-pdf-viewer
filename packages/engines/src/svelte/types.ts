import type { Logger, PdfEngine } from '@embedpdf/models';

export interface PdfiumEngineConfig {
  wasmUrl?: string;
  worker?: boolean;
  logger?: Logger;
  singletonKey?: string; // reuse across consumers
  defer?: boolean; // if true, don’t auto-load until .load() called
}

export interface PdfiumEngineController {
  engine: PdfEngine | null;
  isLoading: boolean;
  error: Error | null;
  reload(partial?: Partial<PdfiumEngineConfig>): Promise<void>;
  destroy(): void;
  load(): Promise<void>;
  config(): Readonly<Required<PdfiumEngineConfig>>;
}
