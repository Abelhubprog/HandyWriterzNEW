// src/hooks/useHomeData.ts
import { useQuery } from '@tanstack/react-query';
import { cloudflareDb } from '@/lib/cloudflare';

export function useHomeData() {
  return useQuery(['home'], async () => {
    const [featuredPosts, popularPosts, categories, featuredCourses] = await Promise.all([
      cloudflareDb.query('SELECT * FROM posts WHERE featured = ? LIMIT 5', [true]),
      cloudflareDb.query('SELECT * FROM posts ORDER BY views DESC LIMIT 5'),
      cloudflareDb.query('SELECT * FROM categories'),
      cloudflareDb.query('SELECT * FROM courses WHERE featured = ? LIMIT 3', [true])
    ]);
    
    return {
      featuredPosts: featuredPosts.results || [],
      popularPosts: popularPosts.results || [],
      categories: categories.results || [],
      featuredCourses: featuredCourses.results || []
    };
  });
}