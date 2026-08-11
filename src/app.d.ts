// Tipos de módulos sem @types: o SW virtual do vite-plugin-pwa e o Leaflet
// (importado dinamicamente só na página do mapa do álbum).
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegisteredSW?: (swUrl: string, r?: ServiceWorkerRegistration) => void;
    onRegisterError?: (error: unknown) => void;
  }
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'leaflet';
