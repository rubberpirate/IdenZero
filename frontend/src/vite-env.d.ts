/// <reference types="vite/client" />

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface ImportMetaEnv {
  readonly VITE_GITHUB_CLIENT_ID: string
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
  var Buffer: typeof Buffer;
}
