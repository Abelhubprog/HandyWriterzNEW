import { LucideIcon } from 'lucide-react';
// Define types that were previously imported from Footer
export interface FooterLinks {
  quickLinks: { label: string; path: string }[];
  supportLinks: { label: string; path: string }[];
  companyLinks: { label: string; path: string }[];
  serviceLinks: { label: string; path: string }[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

export interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Homepage data configuration
export interface HomepageConfig {
  companyName: string;
  companyDescription: string;
  features: Feature[];
  services: Service[];
  steps: Step[];
  footer: {
    links: FooterLinks;
    contact: ContactInfo;
  };
  cta: {
    title: string;
    description: string;
    buttonText: string;
  };
}
