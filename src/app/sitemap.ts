
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://piiss.vercel.app';

  const staticRoutes = [
      '/',
      '/admissions',
      '/results',
      '/events',
      '/faculty',
      '/gallery',
    ];
  
  const staticUrls = staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1 : 0.8,
  }));

  return [
    ...staticUrls
  ];
}
