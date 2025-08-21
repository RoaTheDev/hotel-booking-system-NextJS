"use client"

import {useEffect, useRef} from "react"
import {gsap} from "gsap"
import {ScrollTrigger} from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const featuresRef = useRef<HTMLDivElement>(null)
    const roomsRef = useRef<HTMLDivElement>(null)
    const philosophyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero animations
            gsap.fromTo(".hero-title", {opacity: 0, y: 100}, {opacity: 1, y: 0, duration: 2, ease: "power3.out"})
            gsap.fromTo(
                ".hero-subtitle",
                {opacity: 0, y: 50},
                {opacity: 1, y: 0, duration: 1.5, delay: 0.5, ease: "power2.out"},
            )
            gsap.fromTo(
                ".hero-description",
                {opacity: 0, y: 30},
                {opacity: 1, y: 0, duration: 1.2, delay: 1, ease: "power2.out"},
            )
            gsap.fromTo(
                ".hero-cta",
                {opacity: 0, scale: 0.8},
                {opacity: 1, scale: 1, duration: 1, delay: 1.5, ease: "back.out(1.7)"},
            )

            // Floating elements
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

            // Philosophy section
            gsap.fromTo(
                ".philosophy-content",
                {opacity: 0, y: 50},
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.5,
                    scrollTrigger: {
                        trigger: philosophyRef.current,
                        start: "top 80%",
                    },
                },
            )

            gsap.fromTo(
                ".feature-card",
                {opacity: 0, y: 60, rotateX: 15},
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: "top 80%",
                    },
                },
            )

            gsap.utils.toArray(".feature-card").forEach((card) => {
                if (!(card instanceof HTMLElement)) return;

                const icon = card.querySelector<HTMLElement>(".feature-icon");
                const content = card.querySelector<HTMLElement>(".feature-content");

                if (!icon || !content) return;

                card.addEventListener("mouseenter", () => {
                    gsap.to(icon, {scale: 1.2, rotation: 10, duration: 0.3, ease: "back.out(1.7)"});
                    gsap.to(content, {y: -5, duration: 0.3, ease: "power2.out"});
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(icon, {scale: 1, rotation: 0, duration: 0.3, ease: "power2.out"});
                    gsap.to(content, {y: 0, duration: 0.3, ease: "power2.out"});
                });
            });

            gsap.fromTo(
                ".room-card",
                {opacity: 0, scale: 0.8, rotateY: 15},
                {
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    duration: 1.5,
                    stagger: 0.15,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: roomsRef.current,
                        start: "top 80%",
                    },
                },
            )

            gsap.utils.toArray(".room-card").forEach((card) => {
                if (!(card instanceof HTMLElement)) return; // type guard

                const image = card.querySelector<HTMLElement>(".room-image");
                const content = card.querySelector<HTMLElement>(".room-content");

                if (!image || !content) return;

                card.addEventListener("mouseenter", () => {
                    gsap.to(card, {y: -10, duration: 0.4, ease: "power2.out"});
                    gsap.to(image, {scale: 1.1, duration: 0.6, ease: "power2.out"});
                    gsap.to(content, {y: -5, duration: 0.3, ease: "power2.out"});
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(card, {y: 0, duration: 0.4, ease: "power2.out"});
                    gsap.to(image, {scale: 1, duration: 0.6, ease: "power2.out"});
                    gsap.to(content, {y: 0, duration: 0.3, ease: "power2.out"});
                });
            });

            // Parallax effect for background elements
            gsap.to(".parallax-bg", {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: ".parallax-bg",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            })
        })

        return () => ctx.revert()
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-3 absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Hero Section */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center">
                <div className="parallax-bg absolute inset-0">
                    <Image
                        src="/placeholder.svg?height=1080&width=1920&text=Dark mountain landscape with traditional inn at night"
                        alt="Mountain inn at twilight"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="hero-title text-6xl md:text-8xl font-extralight text-slate-100 mb-4 tracking-wider">
                            Serenity
                        </h1>
                        <p className="hero-subtitle text-xl md:text-2xl text-amber-400 font-light tracking-widest mb-2">
                            MOUNTAIN SANCTUARY
                        </p>
                        <p className="hero-description text-sm text-slate-300 tracking-widest">TRANQUILITY • SILENCE •
                            PEACE</p>
                    </div>

                    <div
                        className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>

                    <p className="hero-description text-lg md:text-xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                        In the heart of ancient mountains, find the silence within yourself.
                        <br/>A traditional inn where time moves gently and souls find rest.
                    </p>

                    <Link href="/rooms">
                        <Button
                            size="lg"
                            className="hero-cta bg-slate-800/50 backdrop-blur-sm border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 px-12 py-4 text-lg font-light tracking-wide transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-amber-400/25"
                        >
                            Begin Your Journey
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Philosophy Section */}
            <section ref={philosophyRef} className="py-24 bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <div className="philosophy-content mb-16">
                        <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-wide">Omotenashi</h2>
                        <p className="text-lg text-amber-400 tracking-widest mb-4">THE ART OF HOSPITALITY</p>
                        <div
                            className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                        <p className="text-xl text-slate-300 leading-relaxed font-light max-w-3xl mx-auto">
                            {"We welcome you not as a guest, but as family returning home. Every detail is considered, every moment" +
                                "crafted with care, so you may find the peace that dwells within the mountain's embrace."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-24 bg-slate-900">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">
                            The Way of Tranquility
                        </h2>
                        <div
                            className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div className="feature-card text-center group cursor-pointer">
                            <div
                                className="feature-icon w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/20 group-hover:border-amber-400/50 transition-all duration-300">
                                <div className="w-8 h-8 border border-amber-400 rounded-full"></div>
                            </div>
                            <div className="feature-content">
                                <h3 className="text-xl font-light text-slate-100 mb-4 tracking-wide">Traditional
                                    Rooms</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-3">WASHITSU</p>
                                <p className="text-slate-300 leading-relaxed font-light">
                                    Tatami rooms where simplicity creates space for the mind to rest and the spirit to
                                    breathe
                                </p>
                            </div>
                        </div>

                        <div className="feature-card text-center group cursor-pointer">
                            <div
                                className="feature-icon w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/20 group-hover:border-amber-400/50 transition-all duration-300">
                                <div className="w-8 h-8 border border-amber-400 rounded-sm"></div>
                            </div>
                            <div className="feature-content">
                                <h3 className="text-xl font-light text-slate-100 mb-4 tracking-wide">Hot Springs</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-3">ONSEN</p>
                                <p className="text-slate-300 leading-relaxed font-light">
                                    Natural thermal waters that heal the body and purify the spirit under starlit skies
                                </p>
                            </div>
                        </div>

                        <div className="feature-card text-center group ">

                            <Link href={"/garden"}>
                                <div
                                    className="cursor-pointer feature-icon w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/20 group-hover:border-amber-400/50 transition-all duration-300">
                                    <div
                                        className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full"></div>
                                </div>
                            </Link>

                            <div className="feature-content">
                                <h3 className="text-xl font-light text-slate-100 mb-4 tracking-wide">Zen Gardens</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-3">TEIEN</p>
                                <p className="text-slate-300 leading-relaxed font-light">
                                    Contemplative spaces designed for meditation and quiet reflection among ancient
                                    stones
                                </p>
                            </div>
                        </div>

                        <div className="feature-card text-center group cursor-pointer">
                            <div
                                className="feature-icon w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/20 group-hover:border-amber-400/50 transition-all duration-300">
                                <div
                                    className="w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                            </div>
                            <div className="feature-content">
                                <h3 className="text-xl font-light text-slate-100 mb-4 tracking-wide">Seasonal
                                    Cuisine</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-3">KAISEKI</p>
                                <p className="text-slate-300 leading-relaxed font-light">
                                    {"Mountain cuisine that honors nature's gifts with artful presentation and mindful preparation"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rooms Section */}
            <section ref={roomsRef} className="py-24 bg-slate-800/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Guest
                            Rooms</h2>
                        <p className="text-lg text-amber-400 tracking-widest mb-4">MOUNTAIN SANCTUARIES</p>
                        <div
                            className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                        <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                            Each room is a sanctuary of simplicity, where natural materials and thoughtful design create
                            harmony
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card
                            className="room-card  shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-amber-500/10 transition-all duration-500 border border-slate-700/50">
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src="/yamazakura.jpg"
                                    alt="Mountain Cherry room"
                                    fill
                                    className="room-image object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            </div>
                            <CardContent className="room-content p-8">
                                <h3 className="text-xl font-light text-slate-100 mb-2 tracking-wide">Mountain
                                    Cherry</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-4">YAMAZAKURA</p>
                                <p className="text-slate-300 mb-6 leading-relaxed font-light">
                                    Overlooking the zen garden with traditional futon bedding and tea ceremony space for
                                    quiet
                                    contemplation
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-light text-amber-400">$280</span>

                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="room-card  shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-amber-500/10 transition-all duration-500 border border-slate-700/50">
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src="/tsukimi.jpg"
                                    alt="Moon Viewing suite"
                                    fill
                                    className="room-image object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            </div>
                            <CardContent className="room-content p-8">
                                <h3 className="text-xl font-light text-slate-100 mb-2 tracking-wide">Moon Viewing</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-4">TSUKIMI</p>
                                <p className="text-slate-300 mb-6 leading-relaxed font-light">
                                    Suite with private outdoor onsen and panoramic mountain views for celestial
                                    meditation
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-light text-amber-400">$450</span>

                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="room-card shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-amber-500/10 transition-all duration-500 border border-slate-700/50">
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src="/mizukagami.jpg"
                                    alt="Water Mirror pavilion"
                                    fill
                                    className="room-image object-cover"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            </div>
                            <CardContent className="room-content p-8">
                                <h3 className="text-xl font-light text-slate-100 mb-2 tracking-wide">Water Mirror</h3>
                                <p className="text-sm text-amber-400 tracking-widest mb-4">MIZUKAGAMI</p>
                                <p className="text-slate-300 mb-6 leading-relaxed font-light">
                                    Pavilion extending over the lake with traditional architecture and modern comfort
                                    for reflection
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-light text-amber-400">$520</span>

                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center mt-16">
                        <Link href="/rooms">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 px-12 py-3 text-lg font-light tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all duration-500 hover:scale-110">
                                View All Rooms
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Experience Section */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-wide text-slate-100">Peace of Mind</h2>
                    <p className="text-lg tracking-widest mb-4 text-amber-400">KOKORO NO HEIWA</p>
                    <div
                        className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl leading-relaxed font-light mb-12 max-w-3xl mx-auto text-slate-300">
                        {"Peace comes not from the absence of noise, but from finding stillness within. Let our mountain" +
                            "inn be your" +
                            "refuge from the world's demands, where ancient wisdom meets modern comfort."}
                    </p>

                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-700/50 text-slate-300 py-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div>
                            <div className="flex items-center mb-6">
                                <div
                                    className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center mr-3 shadow-lg">
                                    <div className="w-5 h-5 border border-slate-100 rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-light text-slate-100 tracking-wide">Tranquility Inn</h3>
                                    <p className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</p>
                                </div>
                            </div>
                            <p className="text-slate-400 leading-relaxed font-light">
                                A traditional mountain inn where ancient wisdom meets modern comfort, creating space for
                                the soul to
                                breathe and the heart to find peace.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-slate-100 font-light mb-6 tracking-wide">Experience</h4>
                            <ul className="space-y-3 text-slate-400 font-light">
                                <li>
                                    <Link href="/rooms" className="hover:text-amber-400 transition-colors duration-300">
                                        Guest Rooms
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/onsen" className="hover:text-amber-400 transition-colors duration-300">
                                        Hot Springs
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dining"
                                          className="hover:text-amber-400 transition-colors duration-300">
                                        Mountain Cuisine
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/garden"
                                          className="hover:text-amber-400 transition-colors duration-300">
                                        Zen Garden
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-slate-100 font-light mb-6 tracking-wide">Visit</h4>
                            <div className="space-y-3 text-slate-400 font-light">
                                <p>
                                    123 Mountain Path
                                    <br/>
                                    Peaceful Valley, Colorado
                                </p>
                                <p>+855 973-061-501</p>
                                <p>info@tranquility-inn.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 mt-12 pt-8 text-center">
                        <p className="text-slate-400 font-light">© 2024 Tranquility Inn. Preserving tradition, nurturing
                            peace.</p>
                        <p>Roern Chamreun (ROA)</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
