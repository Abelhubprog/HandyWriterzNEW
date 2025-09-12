/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_KEY?: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_SECRET_KEY?: string
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_COINBASE_COMMERCE_API_KEY?: string
  readonly VITE_COINBASE_COMMERCE_WEBHOOK_SECRET?: string
  readonly VITE_STABLELINK_API_KEY?: string
  readonly VITE_STABLELINK_WEBHOOK_SECRET?: string
  readonly VITE_STABLELINK_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}
