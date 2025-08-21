'use client'

import { ArrowLeft, Bath, Calendar, Coffee, Heart, Maximize, Mountain, Star, Users, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RoomWithDetails } from "@/types/roomTypes";
import { use } from "react";

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
    "Garden View": Mountain,
    "Tea Ceremony Set": Coffee,
    "Tatami Flooring": Maximize,
    "Futon Bedding": Heart,
    "Private Bath": Bath,
    "WiFi": Wifi,
    "Mountain View": Mountain,
    "Private Onsen": Bath,
    "Moon Deck": Star,
    "Meditation Cushions": Heart,
    "Telescope Access": Star,
};

interface RoomPageProps {
    params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: RoomPageProps) {
    const { id } = use(params);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [room, setRoom] = useState<RoomWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoom = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/rooms/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Room not found');
                        return;
                    }
                    throw new Error(`Failed to fetch room: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    setRoom(result.data);
                } else {
                    setError(result.message || 'Failed to load room data');
                }
            } catch (err) {
                console.error('Error fetching room:', err);
                setError('Failed to load room data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [id]);

    useEffect(() => {
        if (!room) return;

        const ctx = gsap.context(() => {
            gsap.set([".room-header", ".gallery-content", ".details-content", ".amenities-grid"], { opacity: 0, y: 30 });
            gsap.set(".floating-element", { opacity: 0, scale: 0 });

            const tl = gsap.timeline();
            tl.to(".room-header", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" })
                .to(".gallery-content", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.6")
                .to(".details-content", { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.4")
                .to(".floating-element", {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "back.out(1.7)",
                }, "-=0.6");

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

            gsap.fromTo(
                ".amenity-item",
                { opacity: 0, y: 20, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    scrollTrigger: { trigger: ".amenities-grid", start: "top 80%" },
                }
            );

            gsap.utils.toArray(".thumbnail-image").forEach((imgEl, index) => {
                const img = imgEl as HTMLElement;
                img.addEventListener("mouseenter", () => gsap.to(img, { scale: 1.05, duration: 0.3, ease: "power2.out" }));
                img.addEventListener("mouseleave", () => gsap.to(img, { scale: 1, duration: 0.3, ease: "power2.out" }));
                img.addEventListener("click", () => {
                    setSelectedImage(index);
                    gsap.fromTo(
                        ".main-image",
                        { opacity: 0, scale: 0.95 },
                        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
                    );
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [room]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading room details...</p>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Card className="max-w-md w-full text-center border-red-500/50 bg-slate-800/50">
                    <CardContent className="p-8">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <h2 className="text-xl font-medium text-slate-100 mb-2">Room Not Found</h2>
                        <p className="text-slate-400 mb-6">
                            {error || "The room you're looking for doesn't exist or is no longer available."}
                        </p>
                        <Link href="/rooms">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900">
                                Browse Available Rooms
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-sm flex items-center justify-center shadow-lg">
                                <div className="w-5 h-5 border-2 border-slate-100 rounded-full"></div>
                            </div>
                            <div>
                                <span className="text-lg font-light text-slate-100 tracking-wide">Tranquility Inn</span>
                                <p className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</p>
                            </div>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/rooms">
                                <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2 transition-all duration-300">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Rooms
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="room-header mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl font-light text-slate-100 tracking-wide">{room.roomType.name}</h1>
                        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm">
                            {room.roomType.name.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-slate-300">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Up to {room.roomType.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Maximize className="h-4 w-4" />
                            <span>{room.roomType.description?.includes("tatami") ? "Tatami Room" : "Standard Room"}</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="gallery-content space-y-4">
                            <div className="relative h-96 rounded-lg overflow-hidden">
                                <Image
                                    src={room.images && room.images.length > 0 ? room.images[selectedImage]?.imageUrl || "/placeholder.svg" : "/placeholder.svg"}
                                    alt={room.images && room.images.length > 0 ? room.images[selectedImage]?.caption || `${room.roomType.name} - Image ${selectedImage + 1}` : room.roomType.name}
                                    fill
                                    className="main-image object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"></div>
                            </div>

                            {room.images && room.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {room.images.map((image, index) => (
                                        <div
                                            key={image.id}
                                            className={`thumbnail-image relative h-20 rounded cursor-pointer overflow-hidden border-2 transition-all duration-300 ${
                                                selectedImage === index ? "border-amber-400" : "border-slate-700/50 hover:border-slate-600"
                                            }`}
                                        >
                                            <Image
                                                src={image.imageUrl || "/placeholder.svg"}
                                                alt={image.caption || `${room.roomType.name} thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="details-content mt-8 space-y-8">
                            <div>
                                <h2 className="text-2xl font-light text-slate-100 mb-4 tracking-wide">About This Sanctuary</h2>
                                <p className="text-slate-300 leading-relaxed font-light mb-4">{room.roomType.description}</p>
                            </div>

                            {room.amenities && room.amenities.length > 0 && (
                                <>
                                    <div>
                                        <h3 className="text-xl font-light text-slate-100 mb-4 tracking-wide">Room Features</h3>
                                        <ul className="space-y-2">
                                            {room.amenities.map((amenityItem, index) => (
                                                <li key={index} className="flex items-start gap-3 text-slate-300">
                                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="font-light">{amenityItem.amenity.description || amenityItem.amenity.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-light text-slate-100 mb-6 tracking-wide">Amenities</h3>
                                        <div className="amenities-grid grid md:grid-cols-3 gap-4">
                                            {room.amenities.map((amenityItem, index) => {
                                                const IconComponent = iconMap[amenityItem.amenity.name as keyof typeof iconMap] || Star;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="amenity-item flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/30 transition-all duration-300"
                                                    >
                                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                                            <IconComponent className="h-4 w-4 text-slate-900" />
                                                        </div>
                                                        <span className="text-slate-200 font-light">{amenityItem.amenity.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl sticky top-8 border border-slate-700/50">
                            <CardContent className="p-8">
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-light text-amber-400 mb-2">${room.roomType.basePrice}</div>
                                    <div className="text-slate-400 text-sm font-light">per night</div>
                                </div>

                                <Separator className="bg-slate-700/50 mb-6" />

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Room Size</span>
                                        <span className="text-slate-200 font-light">{room.roomType.description?.includes("tatami") ? "Tatami Room" : "Standard Room"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">View</span>
                                        <span className="text-slate-200 font-light">{room.roomType.description?.includes("mountain") ? "Mountain View" : "Standard View"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Max Guests</span>
                                        <span className="text-slate-200 font-light">{room.roomType.maxGuests} guests</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link href={`/booking/${room.id}`}>
                                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-light tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Reserve This Room
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                    >
                                        <Heart className="h-4 w-4 mr-2" />
                                        Save to Favorites
                                    </Button>
                                </div>

                                <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-4 w-4 text-amber-400" />
                                        <span className="font-medium text-amber-400">Guest Favorite</span>
                                    </div>
                                    <p className="text-sm text-slate-300 font-light">
                                        This room is one of our most loved sanctuaries, consistently rated highly for its peaceful atmosphere and authentic design.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}