// hooks/usePreviousRoute.ts
'use client'

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface PreviousRouteState {
  path: string;
  division: string;
  displayName: string;
}

// ✅ 1. DEFINE YOUR STATIC DIVISIONS HERE
const VALID_DIVISIONS = [
  'all', // Include 'all' for the main shop page
  'branding',
  'electronics',
  'furniture',
  'janitorial',
  'software-development',
  'stationary'
];

export const usePreviousRoute = () => {
  const [previousRoute, setPreviousRoute] = useState<PreviousRouteState | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // EFFECT 1: TRACKING (Only runs when we are on a valid DIVISION page)
  useEffect(() => {
    if (!pathname) return;

    // Get the last part of the URL (e.g. 'branding' or '12345')
    const pathParts = pathname.split('/').filter(Boolean);
    const lastSegment = pathParts[pathParts.length - 1];

    // ✅ 2. CHECK: Is this a Division Page?
    // We only save to history if the current URL ends in one of our known divisions.
    // If it ends in a Product ID (which isn't in the list), we skip this block.
    const isDivisionPage = VALID_DIVISIONS.includes(lastSegment);

    if (isDivisionPage) {
      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      // Format display name (e.g., "software-development" -> "Software Development")
      const displayName = lastSegment === 'all'
        ? 'All Products'
        : lastSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      const routeData: PreviousRouteState = {
        path: currentPath,
        division: lastSegment,
        displayName: displayName
      };

      // Save to storage
      sessionStorage.setItem('previousShopRoute', JSON.stringify(routeData));
      setPreviousRoute(routeData);
    }
  }, [pathname, searchParams]);

  // EFFECT 2: READING (Runs on every mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRoute = sessionStorage.getItem('previousShopRoute');
      if (storedRoute) {
        try {
          setPreviousRoute(JSON.parse(storedRoute));
        } catch (error) {
          console.warn('Failed to parse stored route:', error);
        }
      }
    }
  }, []);

  return previousRoute;
};