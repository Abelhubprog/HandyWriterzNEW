import { ReactNode } from 'react';

export interface ServiceMetadata {
  author?: string;
  date?: string;
  category?: string;
  tags?: string[];
}

export interface ServicePageProps {
  title: string;
  description?: string;
  content?: ReactNode;
  metadata?: ServiceMetadata;
  children?: ReactNode;
}

export interface ServicePageType {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  metadata?: ServiceMetadata;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}
