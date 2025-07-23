"use client";

import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';

export default function NavigationProgressBar() {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const isAnimatingRef = useRef(false);

    useEffect(() => {
        const startProgress = () => {
            if (isAnimatingRef.current) return;
            isAnimatingRef.current = true;
            setLoading(true);
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
                link.getAttribute('target') !== '_blank'
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
            isAnimatingRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (loading && isAnimatingRef.current) {
            const timer = setTimeout(() => {
                setLoading(false);
                isAnimatingRef.current = false;
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [pathname, loading]);

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