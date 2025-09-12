// Add global type declarations
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// React Router compatibility for Vite/React
declare module 'react-router-dom' {
  export * from 'react-router-dom';
  export interface NavigateFunction {
    (to: string, options?: { replace?: boolean; state?: any }): void;
    (delta: number): void;
  }
  export function useNavigate(): NavigateFunction;
  export function useRouter(): {
    push: (path: string) => void;
    replace: (path: string) => void;
    back: () => void;
    pathname: string;
    query: Record<string, string>;
  };
}

// Add missing module declarations
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Fix for Node.js built-ins
declare module 'node:buffer' {
  export * from 'buffer';
}

declare module 'node:stream' {
  export * from 'stream';
}

declare module 'node:util' {
  export * from 'util';
}

declare module 'node:path' {
  export * from 'path';
}

// Web3 and Wallet Interface Declarations
declare interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    _isDisabled?: boolean;
    request?: (...args: any[]) => Promise<any>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    [key: string]: any;
  };
  __disableMetamaskDetection?: boolean;
  __reownAppKit?: any;
  process?: any;
  global?: any;
}

// Coinbase Commerce types
declare module 'coinbase-commerce' {
  export interface ChargeData {
    id?: string;
    name: string;
    description: string;
    pricing_type: 'fixed_price' | 'no_price';
    local_price?: {
      amount: string;
      currency: string;
    };
    metadata?: Record<string, any>;
  }

  export interface Charge {
    id: string;
    code: string;
    name: string;
    description: string;
    hosted_url: string;
    created_at: string;
    expires_at: string;
    timeline: any[];
    metadata: Record<string, any>;
    pricing_type: string;
    local_price: {
      amount: string;
      currency: string;
    };
  }

  export class Client {
    constructor(apiKey: string);
    charge: {
      create(data: ChargeData): Promise<Charge>;
      retrieve(id: string): Promise<Charge>;
    };
  }
}

// ShadCN UI component exports
declare module '@/components/ui/button' {
  import { ComponentType, ButtonHTMLAttributes } from 'react';
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }
  export const Button: ComponentType<ButtonProps>;
}

declare module '@/components/ui/input' {
  import { ComponentType, InputHTMLAttributes } from 'react';
  export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}
  export const Input: ComponentType<InputProps>;
}

declare module '@/components/ui/card' {
  import { ComponentType, HTMLAttributes } from 'react';
  export const Card: ComponentType<HTMLAttributes<HTMLDivElement>>;
  export const CardContent: ComponentType<HTMLAttributes<HTMLDivElement>>;
  export const CardHeader: ComponentType<HTMLAttributes<HTMLDivElement>>;
  export const CardTitle: ComponentType<HTMLAttributes<HTMLHeadingElement>>;
  export const CardDescription: ComponentType<HTMLAttributes<HTMLParagraphElement>>;
  export const CardFooter: ComponentType<HTMLAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/progress' {
  import { ComponentType } from 'react';
  export interface ProgressProps {
    value?: number;
    className?: string;
  }
  export const Progress: ComponentType<ProgressProps>;
}

declare module '@/components/ui/scroll-area' {
  import { ComponentType, HTMLAttributes } from 'react';
  export const ScrollArea: ComponentType<HTMLAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/tabs' {
  import { ComponentType, HTMLAttributes } from 'react';
  export const Tabs: ComponentType<HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }>;
  export const TabsList: ComponentType<HTMLAttributes<HTMLDivElement>>;
  export const TabsTrigger: ComponentType<HTMLAttributes<HTMLButtonElement> & { value: string }>;
}

// File upload service types
declare module '@/services/fileUploadService' {
  export function formatFileSize(bytes: number): string;
  export function getFileIcon(filename: string): string;
}

// D1 client modules (replacing Supabase)
declare module '@/lib/supabase' {
  interface D1Client {
    auth: any;
    from: (table: string) => any;
    storage: any;
  }
  export const supabase: D1Client;
}

declare module '@/lib/supabaseClient' {
  interface D1Client {
    auth: any;
    from: (table: string) => any;
    storage: any;
  }
  export const supabase: D1Client;
}

// Types are now defined in @/types/content

// Auth hook
declare module '@/hooks/useAuth' {
  export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  }

  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }

  export function useAuth(): AuthState & {
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (email: string, password: string, name?: string) => Promise<void>;
  };
}

import { useUser, useAuth } from '@clerk/clerk-react';