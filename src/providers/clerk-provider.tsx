import { ClerkProvider } from '@clerk/clerk-react';
import { getFullClerkConfig } from '@/lib/clerk';

interface Props {
  children: React.ReactNode;
}

export function CustomClerkProvider({ children }: Props) {
  const config = getFullClerkConfig();

  return (
    <ClerkProvider
      {...config}
      appearance={{
        ...config.appearance,
        variables: {
          colorPrimary: '#3b82f6',
          colorTextOnPrimaryBackground: 'white',
        },
        elements: {
          ...config.appearance.elements,
          card: 'rounded-lg shadow-md',
          navbar: 'shadow-none',
          formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
          formFieldInput: 'rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          dividerLine: 'bg-gray-200 dark:bg-gray-700',
          dividerText: 'text-gray-500 dark:text-gray-400',
          footerActionLink: 'text-blue-500 hover:text-blue-600',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 