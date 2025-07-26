"use client";

import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';

export default function NavigationProgressBar() {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const isNavigatingRef = useRef(false);
    const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const startProgress = () => {
            if (isNavigatingRef.current) return;
            isNavigatingRef.current = true;
            setLoading(true);

            navigationTimeoutRef.current = setTimeout(() => {
                setLoading(false);
                isNavigatingRef.current = false;
            }, 3000);
        };

        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (
                link &&
                link.href &&
                !link.href.startsWith('#') &&
                !link.href.includes('mailto:') &&
                !link.href.includes('tel:') &&
                link.getAttribute('target') !== '_blank' &&
                !link.hasAttribute('download')
            ) {
                const url = new URL(link.href, window.location.origin);
                const currentUrl = new URL(window.location.href);

                if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
                    startProgress();
                }
            }
        };

        const handlePopState = () => {
            startProgress();
        };

        document.addEventListener('click', handleLinkClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleLinkClick, true);
            window.removeEventListener('popstate', handlePopState);
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isNavigatingRef.current) {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
                navigationTimeoutRef.current = null;
            }

            const timer = setTimeout(() => {
                setLoading(false);
                isNavigatingRef.current = false;
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
            <div
                className="h-full bg-amber-500 animate-progress"
                style={{
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.6), 0 0 20px rgba(245, 158, 11, 0.3)',
                }}
            />
        </div>
    );
}
