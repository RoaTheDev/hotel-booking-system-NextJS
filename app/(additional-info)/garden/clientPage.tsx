"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {ElementType, FC, useEffect, useRef} from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Flower2, Moon, Sun, TreePine, Waves } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type GardenSectionType = {
    id: number;
    name: string;
    nameJp: string;
    description: string;
    philosophy: string;
    icon: string;
    imageUrl: string;
    features: string[];
    bestTime: string;
    symbolism: string;
};

type GardenPageProps = {
    gardenSections: GardenSectionType[];
};

const iconMap: { [key: string]: ElementType } = {
    Compass,
    Moon,
    Flower2,
    Waves,
    Sun,
    TreePine,
};

export const GardenClientPage: FC<GardenPageProps> = ({ gardenSections }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<HTMLDivElement>(null);
    const philosophyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.ticker.fps(60); // Ensure smooth animations
        ScrollTrigger.config({
            autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
            limitCallbacks: true
        });

        const ctx = gsap.context(() => {
            // Initial setup
            gsap.set([".hero-content", ".garden-card", ".philosophy-content"], { opacity: 0, y: 30 });
            gsap.set(".floating-element", { opacity: 0, scale: 0 });

            // Hero animation
            gsap.fromTo(".hero-content", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" });

            // Floating elements
            gsap.to(".floating-element", {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.7)",
                delay: 1.5, // Delay to reduce initial load
            });

            // Floating animations
            gsap.to(".floating-1", { y: -20, rotation: 5, duration: 4, repeat: -1, yoyo: true, ease: "power2.inOut" });
            gsap.to(".floating-2", {
                y: -15,
                rotation: -3,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: 1,
            });

            // Garden cards animation
            gsap.fromTo(
                ".garden-card",
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionsRef.current,
                        start: "top 60%",
                        toggleActions: "play none none none",
                    },
                }
            );

            // Philosophy animation
            gsap.fromTo(
                ".philosophy-content",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: philosophyRef.current,
                        start: "top 60%",
                        toggleActions: "play none none none",
                    },
                }
            );

            // Card hover effects (only for icon)
            gsap.utils.toArray(".garden-card").forEach((card) => {
                const gardenCard = card as HTMLElement;
                const icon = gardenCard.querySelector(".garden-icon");

                gardenCard.addEventListener("mouseenter", () => {
                    gsap.to(icon, { scale: 1.2, rotation: 10, duration: 0.3, ease: "back.out(1.7)" });
                });

                gardenCard.addEventListener("mouseleave", () => {
                    gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: "power2.out" });
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full"></div>
                <div
                    className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full"
                ></div>
            </div>



            {/* Hero Section */}
            <section ref={heroRef} className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/placeholder.svg?height=600&width=1920&text=Dark+zen+garden+with+stone+paths+and+meditation+areas"
                        alt="Zen garden overview"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90" />
                </div>

                <div className="hero-content relative z-10 text-center max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 leading-tight tracking-wide">
                        Zen
                        <span className="block text-emerald-400 font-normal">Garden</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Walk the paths of contemplation through our carefully designed gardens, where every stone, plant, and water feature invites deeper reflection and inner peace
                    </p>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto"></div>
                </div>
            </section>

            {/* Garden Sections */}
            <section ref={sectionsRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Sacred Spaces</h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                        {"Each garden section offers a unique meditation on nature's wisdom and the art of mindful living"}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gardenSections.map((section) => {
                        const IconComponent = iconMap[section.icon];
                        return (
                            <Card
                                key={section.id}
                                className="garden-card border-0 shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-emerald-500/10 transition-all duration-500 border-slate-700/50 group cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={section.imageUrl || "/placeholder.svg"}
                                        alt={section.name}
                                        fill
                                        className="garden-image object-cover"
                                        priority={section.id === 1}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-slate-800/80 backdrop-blur-sm text-emerald-400 border border-emerald-400/30 hover:bg-slate-700/80">
                                            {section.nameJp}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="garden-content p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="garden-icon w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                                            {IconComponent && <IconComponent className="h-5 w-5 text-slate-900" />}
                                        </div>
                                        <h3 className="text-xl font-light text-slate-100 tracking-wide">{section.name}</h3>
                                    </div>

                                    <p className="text-slate-300 text-sm leading-relaxed mb-4 font-light">{section.description}</p>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 mb-2">Best Time to Visit:</p>
                                        <p className="text-xs text-emerald-400 font-medium">{section.bestTime}</p>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 mb-2">Features:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {section.features.slice(0, 2).map((feature, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs bg-slate-700/50 text-slate-300 border border-slate-600/50"
                                                >
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-xs text-slate-400 italic leading-relaxed">{section.philosophy}</p>
                                    </div>


                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Garden Philosophy */}
            <section ref={philosophyRef} className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="philosophy-content max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-wide text-slate-100">Garden Philosophy</h2>
                    <p className="text-lg tracking-widest mb-4 text-emerald-400">SHIZEN NO KOKORO</p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl leading-relaxed font-light mb-12 max-w-3xl mx-auto text-slate-300">
                        {`"The heart of nature" - Our gardens are not mere decoration but living teachings. Each element is placed
            with intention, creating spaces where the boundary between inner and outer landscape dissolves, revealing
            the profound interconnectedness of all existence.`}
                    </p>
                    <Link href="/rooms">
                        <Button
                            size="lg"
                            className="bg-slate-800/50 backdrop-blur-sm border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400 px-12 py-4 text-lg font-light tracking-wide transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-emerald-400/25"
                        >
                            Join a Garden Meditation
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};