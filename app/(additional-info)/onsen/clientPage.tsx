'use client'
import {useEffect, useRef} from "react";
import {gsap} from "gsap";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Clock, Star, Thermometer, Users} from "lucide-react";
import {onsenBenefits, onsenExperiences} from "@/app/(additional-info)/onsen/data";
import {ScrollTrigger} from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger)

export const OnsenClientPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const experiencesRef = useRef<HTMLDivElement>(null)
    const benefitsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial setup
            gsap.set([".hero-content", ".experience-card", ".benefits-content"], { opacity: 0, y: 30 })
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

            // Benefits animation
            gsap.fromTo(
                ".benefits-content",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: benefitsRef.current,
                        start: "top 80%",
                    },
                },
            )

            // Card hover effects
            gsap.utils.toArray(".experience-card").forEach((card) => {
                const onsenCard = card as HTMLElement;
                const image = onsenCard.querySelector(".experience-image")
                const content = onsenCard.querySelector(".experience-content")
                const icon = onsenCard.querySelector(".experience-icon")

                onsenCard.addEventListener("mouseenter", () => {
                    gsap.to(onsenCard, { y: -10, scale: 1.02, duration: 0.4, ease: "power2.out" })
                    gsap.to(image, { scale: 1.1, duration: 0.6, ease: "power2.out" })
                    gsap.to(content, { y: -5, duration: 0.3, ease: "power2.out" })
                    gsap.to(icon, { scale: 1.2, rotation: 10, duration: 0.3, ease: "back.out(1.7)" })
                })

                onsenCard.addEventListener("mouseleave", () => {
                    gsap.to(onsenCard, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" })
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
                <div className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
            </div>



            {/* Hero Section */}
            <section ref={heroRef} className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/placeholder.svg?height=600&width=1920&text=Dark+mountain+hot+springs+with+steam"
                        alt="Mountain hot springs"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90" />
                </div>

                <div className="hero-content relative z-10 text-center max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-light text-slate-100 mb-6 leading-tight tracking-wide">
                        Mountain
                        <span className="block text-blue-400 font-normal">Onsen</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                        Immerse yourself in the healing waters of our natural hot springs, where mountain minerals and ancient
                        traditions create the perfect sanctuary for body and soul
                    </p>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
                </div>
            </section>

            {/* Onsen Experiences */}
            <section ref={experiencesRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Healing Waters</h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                        {`Choose from our curated onsen experiences, each designed to harmonize with nature's rhythms and your
                        personal wellness journey`}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {onsenExperiences.map((experience) => {
                        const IconComponent = experience.icon
                        return (
                            <Card
                                key={experience.id}
                                className="experience-card  shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-blue-500/10 transition-all duration-500 border border-slate-700/50 group cursor-pointer"
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
                                        <Badge className="bg-slate-800/80 backdrop-blur-sm text-blue-400 border border-blue-400/30 hover:bg-slate-700/80">
                                            {experience.category}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <div className="flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded border border-slate-700/50">
                                            <Star className="h-3 w-3 fill-blue-400 text-blue-400" />
                                            <span className="text-blue-400 text-sm font-medium">{experience.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <CardContent className="experience-content p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="experience-icon w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                                            <IconComponent className="h-5 w-5 text-slate-900" />
                                        </div>
                                        <h3 className="text-xl font-light text-slate-100 tracking-wide">{experience.name}</h3>
                                    </div>

                                    <p className="text-slate-300 text-sm leading-relaxed mb-4 font-light">{experience.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Thermometer className="h-3 w-3 text-slate-400" />
                                            <span className="text-slate-400">{experience.temperature}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-slate-400" />
                                            <span className="text-slate-400">{experience.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-slate-400" />
                                            <span className="text-slate-400">{experience.capacity}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-blue-400 font-medium">${experience.price}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 mb-2">Features:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {experience.features.slice(0, 2).map((feature, index) => (
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
                                        <p className="text-xs text-slate-500 mb-2">Health Benefits:</p>
                                        <ul className="text-xs text-slate-400 space-y-1">
                                            {experience.benefits.slice(0, 2).map((benefit, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-blue-400 rounded-full" />
                                                    {benefit}
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

            {/* Benefits Section */}
            <section ref={benefitsRef} className="py-20 bg-slate-800/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="benefits-content text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-light text-slate-100 mb-4 tracking-wide">Therapeutic Benefits</h2>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-8"></div>
                        <p className="text-xl text-slate-300 leading-relaxed font-light max-w-2xl mx-auto">
                            Our natural hot springs offer profound healing benefits, backed by centuries of tradition and modern
                            wellness science
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {onsenBenefits.map((benefit, index) => {
                            const IconComponent = benefit.icon
                            return (
                                <div
                                    key={index}
                                    className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <IconComponent className="h-8 w-8 text-slate-900" />
                                    </div>
                                    <h3 className="text-lg font-light text-slate-100 mb-3 tracking-wide">{benefit.title}</h3>
                                    <p className="text-slate-300 text-sm font-light leading-relaxed">{benefit.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Onsen Etiquette */}
            <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-wide text-slate-100">Onsen Etiquette</h2>
                    <p className="text-lg tracking-widest mb-4 text-blue-400">HADAKA NO TSUKIAI</p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl leading-relaxed font-light mb-12 max-w-3xl mx-auto text-slate-300">
                        {`"Naked communion" - The onsen experience transcends physical boundaries, creating a space of equality and
                        spiritual connection. We provide guidance on traditional etiquette to ensure a respectful and transformative
                        experience for all guests.`}
                    </p>
                    <Link href="/booking">
                        <Button
                            size="lg"
                            className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 px-12 py-4 text-lg font-light tracking-wide transition-all duration-500 hover:scale-110 hover:shadow-lg hover:shadow-blue-400/25"
                        >
                            Begin Your Healing Journey
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )

}