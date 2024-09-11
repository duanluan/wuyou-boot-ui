/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 环境变量
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  // 环境变量
  readonly env: ImportMetaEnv
}
