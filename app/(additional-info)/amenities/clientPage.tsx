'use client'
import {useEffect, useRef} from "react";
import {gsap} from "gsap";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {amenities} from "@/app/(additional-info)/amenities/data";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

export const AmenitiesClientPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const amenitiesRef = useRef<HTMLDivElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial setup
            gsap.set([".hero-content", ".amenity-card", ".cta-content"], {opacity: 0, y: 30})
            gsap.set(".floating-element", {opacity: 0, scale: 0})

            // Hero animation
            gsap.fromTo(".hero-content", {opacity: 0, y: 50}, {opacity: 1, y: 0, duration: 1.5, ease: "power3.out"})

            // Floating elements
            gsap.to(".floating-element", {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.7)",
                delay: 0.5,
            })

            // Floating animations
            gsap.to(".floating-1", {
                y: -20,
                rotation: 5,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
            })

            gsap.to(".floating-2", {
                y: -15,
                rotation: -3,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: 1,
            })

            gsap.to(".floating-3", {
                y: -25,
                rotation: 8,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: 2,
            })

            // Amenities animation
            gsap.fromTo(
                ".amenity-card",
                {opacity: 0, y: 60, rotateX: 15},
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: amenitiesRef.current,
                        start: "top 80%",
                    },
                },
            )

            // Amenity card hover effects
            gsap.utils.toArray(".amenity-card").forEach((card) => {
                const amenityCard = card as HTMLElement
                const image = amenityCard.querySelector(".amenity-image")
                const content = amenityCard.querySelector(".amenity-content")
                const icon = amenityCard.querySelector(".amenity-icon")

                amenityCard.addEventListener("mouseenter", () => {
                    gsap.to(amenityCard, {y: -10, scale: 1.02, duration: 0.4, ease: "power2.out"})
                    gsap.to(image, {scale: 1.1, duration: 0.6, ease: "power2.out"})
                    gsap.to(content, {y: -5, duration: 0.3, ease: "power2.out"})
                    gsap.to(icon, {scale: 1.2, rotation: 10, duration: 0.3, ease: "back.out(1.7)"})
                })

                amenityCard.addEventListener("mouseleave", () => {
                    gsap.to(amenityCard, {y: 0, scale: 1, duration: 0.4, ease: "power2.out"})
                    gsap.to(image, {scale: 1, duration: 0.6, ease: "power2.out"})
                    gsap.to(content, {y: 0, duration: 0.3, ease: "power2.out"})
                    gsap.to(icon, {scale: 1, rotation: 0, duration: 0.3, ease: "power2.out"})
                })
            })

            // CTA animation
            gsap.fromTo(
                ".cta-content",
                {opacity: 0, y: 50},
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 80%",
                    },
                },
            )
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element floating-3 absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>


            {/* Hero Section */}
            <section ref={heroRef} className="relative py-20 overflow-hidden">


                <div className="hero-content relative z-10 text-center max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 leading-tight tracking-wide">
                        Mountain
                        <span className="block text-amber-400 font-normal">Wellness</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Discover our thoughtfully curated facilities designed to nurture your body, mind, and spirit in
                        the tranquil
                        embrace of the mountains
                    </p>
                </div>
            </section>

            {/* Amenities Grid */}
            <section ref={amenitiesRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Sanctuary
                        Facilities</h2>
                    <div
                        className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                        Each facility is designed to enhance your journey toward inner peace and physical wellness
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {amenities.map((amenity) => {
                        const IconComponent = amenity.icon
                        return (
                            <Card
                                key={amenity.id}
                                className="amenity-card  shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-amber-500/10 transition-all duration-500 border border-slate-700/50 group cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={amenity.imageUrl || "/placeholder.svg"}
                                        alt={amenity.name}
                                        fill
                                        className="amenity-image object-cover"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4">
                                        <Badge
                                            className="bg-slate-800/80 backdrop-blur-sm text-amber-400 border border-amber-400/30 hover:bg-slate-700/80">
                                            {amenity.category}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="amenity-content p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div
                                            className="amenity-icon w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                            <IconComponent className="h-5 w-5 text-slate-900"/>
                                        </div>
                                        <h3 className="text-xl font-light text-slate-100 tracking-wide">{amenity.name}</h3>
                                    </div>

                                    <p className="text-slate-300 text-sm leading-relaxed mb-4 font-light">{amenity.description}</p>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-200">Features:</h4>
                                        <ul className="text-sm text-slate-400 space-y-1">
                                            {amenity.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"/>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section ref={ctaRef}
                     className="py-20 bg-gradient-to-r from-slate-800 to-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10"></div>
                <div className="cta-content max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-6 tracking-wide">
                        Experience True Mountain Wellness
                    </h2>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
                        Book your stay and enjoy unlimited access to all our wellness facilities. Your journey to
                        rejuvenation and
                        inner peace begins in the mountains.
                    </p>
                    <Link href="/rooms">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 px-12 py-4 text-lg font-light tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all duration-500 hover:scale-110"
                        >
                            Book Your Mountain Retreat
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )

}