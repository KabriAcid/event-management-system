/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONNIFY_PUBLIC_KEY: string
  readonly VITE_MONNIFY_CONTRACT_CODE: string
  readonly VITE_MONNIFY_ENVIRONMENT: string
  readonly VITE_BASE_URL: string
  readonly VITE_WALLET_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}