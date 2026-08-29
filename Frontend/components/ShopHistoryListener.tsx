'use client'

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const VALID_DIVISIONS = [
    'branding',
    'electronics',
    'furniture',
    'janitorial',
    'software-development',
    'stationary'
];

export default function ShopHistoryListener() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;

        const pathParts = pathname.split('/').filter(Boolean);
        const lastSegment = pathParts[pathParts.length - 1];

        const isDivisionPage = VALID_DIVISIONS.includes(lastSegment) || lastSegment === 'all';

        if (isDivisionPage) {
            const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

            const displayName = lastSegment === 'all'
                ? 'All Products'
                : lastSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const routeData = {
                path: currentPath,
                name: displayName,
                division: lastSegment
            };

            console.log('📍 Saving Shop History:', routeData);
            sessionStorage.setItem('last_shop_route', JSON.stringify(routeData));
        }
    }, [pathname, searchParams]);

    return null;
}