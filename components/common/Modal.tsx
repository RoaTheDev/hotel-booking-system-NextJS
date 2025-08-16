import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(
                modalRef.current,
                { opacity: 0, scale: 0.8, y: -20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
            );
            gsap.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 0.85, duration: 0.4, ease: "power3.out" }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-lg border border-slate-700"
                onClick={(e) => e.stopPropagation()}>
                {title && (
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">{title}</h2>
                )}
                <div className="text-slate-300">{children}</div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded text-slate-900 font-medium transition-colors duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
