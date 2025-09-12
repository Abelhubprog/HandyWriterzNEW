import { AuthProvider } from '@/providers/AuthProvider';
import { ChakraProvider } from '@chakra-ui/react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ChakraProvider>
  );
}
