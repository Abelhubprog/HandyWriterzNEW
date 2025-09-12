// Clerk is the only external auth provider in use.
// This file can be extended if you need to add custom Clerk types for your app.

export interface ExtendedClerk {
  session?: {
    userId: string;
    email?: string;
    // Add more Clerk session fields as needed
  };
}

export type LoadedClerk = ExtendedClerk;

export interface ClerkContextValue {
  clerk: LoadedClerk | null;
  session: any;
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean;
} 