import { useState, useEffect } from 'react';
import { cloudflareDb } from '@/lib/cloudflare';
import toast from 'react-hot-toast';

// Import the ServiceData type from d1Client
import type { ServiceData } from '@/lib/d1Client';

export function useServices() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Query published services from Cloudflare D1
      const result = await cloudflareDb.select('services', { is_active: true });

      if (result && result.length > 0) {
        setServices(result);
      } else {
        setServices([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load services';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    isLoading,
    error,
    refetch: fetchServices
  };
}
