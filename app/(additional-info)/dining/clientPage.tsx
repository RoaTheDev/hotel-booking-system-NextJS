'use client'
import {useEffect, useRef} from "react";
import {gsap} from "gsap";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Clock,Star, Users, } from "lucide-react";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {diningExperiences, menuHighlights} from "@/app/(additional-info)/dining/data";

gsap.registerPlugin(ScrollTrigger)


export const DiningClientPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const experiencesRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial setup
            gsap.set([".hero-content", ".experience-card", ".menu-content"], { opacity: 0, y: 30 })
            gsap.set(".floating-element", { opacity: 0, scale: 0 })

            // Hero animation
            gsap.fromTo(".hero-content", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" })

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

            // Experience cards animation
            gsap.fromTo(
                ".experience-card",
                { opacity: 0, y: 60, rotateX: 15 },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: experiencesRef.current,
                        start: "top 80%",
                    },
                },
            )

            // Menu animation
            gsap.fromTo(
                ".menu-content",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: menuRef.current,
                        start: "top 80%",
                    },
                },
            )

            // Card hover effects
            gsap.utils.toArray(".experience-card").forEach((card) => {
                const diningCard = card as HTMLElement;
                const image = diningCard.querySelector(".experience-image")
                const content = diningCard.querySelector(".experience-content")
                const icon = diningCard.querySelector(".experience-icon")

                diningCard.addEventListener("mouseenter", () => {
                    gsap.to(diningCard, { y: -10, scale: 1.02, duration: 0.4, ease: "power2.out" })
                    gsap.to(image, { scale: 1.1, duration: 0.6, ease: "power2.out" })
                    gsap.to(content, { y: -5, duration: 0.3, ease: "power2.out" })
                    gsap.to(icon, { scale: 1.2, rotation: 10, duration: 0.3, ease: "back.out(1.7)" })
                })

                diningCard.addEventListener("mouseleave", () => {
                    gsap.to(diningCard, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" })
                    gsap.to(image, { scale: 1, duration: 0.6, ease: "power2.out" })
                    gsap.to(content, { y: 0, duration: 0.3, ease: "power2.out" })
                    gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: "power2.out" })
                })
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Navigation */}
            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center shadow-lg">
                                <div className="w-5 h-5 border-2 border-slate-100 rounded-full"></div>
                            </div>
                            <div>
                                <span className="text-lg font-light text-slate-100 tracking-wide">Tranquility Inn</span>
                                <p className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</p>
                            </div>
                        </Link>
                        <div className="hidden md:flex items-center space-x-12">
                            <Link
                                href="/rooms"
                                className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                            >
                                Rooms
                            </Link>
                            <Link
                                href="/amenities"
                                className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                            >
                                Facilities
                            </Link>
                            <Link
                                href="/dining"
                                className="text-amber-400 font-medium text-sm tracking-wide border-b border-amber-400 pb-1"
                            >
                                Dining
                            </Link>
                            <Link
                                href="/experience"
                                className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                            >
                                Experience
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition-all duration-300"
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/rooms">
                                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                                    Book Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/placeholder.svg?height=600&width=1920&text=Dark+mountain+dining+room+with+warm+lighting"
                        alt="Mountain dining experience"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90" />
                </div>

                <div className="hero-content relative z-10 text-center max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 leading-tight tracking-wide">
                        Mountain
                        <span className="block text-amber-400 font-normal">Cuisine</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Savor the essence of the mountains through carefully crafted dishes that honor seasonal ingredients and
                        traditional techniques
                    </p>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
                </div>
            </section>

            {/* Dining Experiences */}
            <section ref={experiencesRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Culinary Journeys</h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                        {`Each dining experience is designed to connect you with the mountain's natural abundance and cultural
                        heritage`}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {diningExperiences.map((experience) => {
                        const IconComponent = experience.icon
                        return (
                            <Card
                                key={experience.id}
                                className="experience-card border-0 shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-amber-500/10 transition-all duration-500 border border-slate-700/50 group cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={experience.imageUrl || "/placeholder.svg"}
                                        alt={experience.name}
                                        fill
                                        className="experience-image object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-slate-800/80 backdrop-blur-sm text-amber-400 border border-amber-400/30 hover:bg-slate-700/80">
                                            {experience.category}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <div className="flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-700/50">
                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            <span className="text-amber-400 text-sm font-medium">{experience.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="experience-content p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="experience-icon w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                            <IconComponent className="h-5 w-5 text-slate-900" />
                                        </div>
                                        <h3 className="text-xl font-light text-slate-100 tracking-wide">{experience.name}</h3>
                                    </div>

                                    <p className="text-slate-300 text-sm leading-relaxed mb-4 font-light">{experience.description}</p>

                                    <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-slate-400" />
                                            <span className="text-slate-400">{experience.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-slate-400" />
                                            <span className="text-slate-400">{experience.capacity}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-amber-400 font-medium">${experience.price}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 mb-2">Available Times:</p>
                                        <div className="flex gap-2">
                                            {experience.schedule.map((time, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs bg-slate-700/50 text-slate-300 border border-slate-600/50"
                                                >
                                                    {time}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-xs text-slate-400 italic leading-relaxed">{experience.philosophy}</p>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-light shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                                    >
                                        Reserve Experience
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </section>

            {/* Menu Highlights */}
            <section ref={menuRef} className="py-20 bg-slate-800/30 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="menu-content text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Signature Dishes</h2>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                        <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                            A selection of our most beloved dishes, each crafted with reverence for mountain traditions
                        </p>
                    </div>

                    <div className="space-y-6">
                        {menuHighlights.map((dish, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start p-6 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 transition-all duration-300"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-light text-slate-100">{dish.name}</h3>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs bg-slate-700/50 text-slate-400 border border-slate-600/50"
                                        >
                                            {dish.category}
                                        </Badge>
                                    </div>
                                    <p className="text-slate-300 text-sm font-light leading-relaxed">{dish.description}</p>
                                </div>
                                <div className="text-right ml-6">
                                    <span className="text-xl font-light text-amber-400">${dish.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 px-12 py-4 text-lg font-light tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all duration-500 hover:scale-110"
                        >
                            View Full Menu
                        </Button>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-wide text-slate-100">Culinary Philosophy</h2>
                    <p className="text-lg tracking-widest mb-4 text-amber-400">ICHIGO ICHIE</p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl leading-relaxed font-light mb-12 max-w-3xl mx-auto text-slate-300">
                        {`"One time, one meeting" - Each meal is a unique encounter, never to be repeated. We honor this principle by
                        sourcing the finest seasonal ingredients and preparing each dish with mindful attention to the present
                        moment.`}
                    </p>
                    <Link href="/booking">
                        <Button
                            size="lg"
                            className="bg-slate-800/50 backdrop-blur-sm border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 px-12 py-4 text-lg font-light tracking-wide transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-amber-400/25"
                        >
                            Begin Your Culinary Journey
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )

}