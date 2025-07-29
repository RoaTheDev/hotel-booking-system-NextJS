"use client"

import {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {Card, CardContent} from "@/components/ui/card";
import {Filter, Star} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

const roomTypes = [
    {
        id: 1,
        name: "Mountain Cherry",
        nameEn: "Yamazakura",
        description:
            "Overlooking the zen garden with traditional futon bedding and tea ceremony space for quiet contemplation",
        basePrice: 280,
        maxGuests: 2,
        imageUrl:
            "/placeholder.svg?height=400&width=600&text=Dark traditional tatami room with mountain view and cherry blossoms",
        amenities: ["Garden View", "Tea Ceremony Set", "Tatami Flooring", "Futon Bedding"],
        size: "12 tatami mats",
        view: "Zen Garden",
        rating: 4.8,
    },
    {
        id: 2,
        name: "Moon Viewing",
        nameEn: "Tsukimi",
        description: "Suite with private outdoor onsen and panoramic mountain views for celestial meditation",
        basePrice: 450,
        maxGuests: 3,
        imageUrl:
            "/placeholder.svg?height=400&width=600&text=Dark traditional room with mountain view and private outdoor onsen",
        amenities: ["Mountain View", "Private Onsen", "Moon Deck", "Meditation Cushions"],
        size: "16 tatami mats",
        view: "Mountain Range",
        rating: 4.9,
    },
    {
        id: 3,
        name: "Water Mirror",
        nameEn: "Mizukagami",
        description: "Pavilion extending over the lake with traditional architecture and modern comfort for reflection",
        basePrice: 520,
        maxGuests: 4,
        imageUrl: "/placeholder.svg?height=400&width=600&text=Dark lakeside traditional room with wooden deck over water",
        amenities: ["Lake View", "Private Deck", "Traditional Bath", "Calligraphy Set"],
        size: "20 tatami mats",
        view: "Lake & Forest",
        rating: 4.9,
    },
    {
        id: 4,
        name: "Bamboo Grove",
        nameEn: "Chikurin",
        description: "Sanctuary surrounded by whispering bamboo with natural soundscape for deep meditation",
        basePrice: 350,
        maxGuests: 2,
        imageUrl: "/placeholder.svg?height=400&width=600&text=Dark traditional room surrounded by bamboo forest",
        amenities: ["Bamboo Grove", "Natural Sounds", "Floor Seating", "Incense Burner"],
        size: "14 tatami mats",
        view: "Bamboo Forest",
        rating: 4.7,
    },
    {
        id: 5,
        name: "Morning Mist",
        nameEn: "Asagiri",
        description: "Pavilion perfect for sunrise meditation and morning tea ceremony with eastern valley views",
        basePrice: 380,
        maxGuests: 3,
        imageUrl: "/placeholder.svg?height=400&width=600&text=Dark traditional room with sunrise view and morning mist",
        amenities: ["Sunrise View", "Tea Garden", "Meditation Space", "Morning Tea Set"],
        size: "15 tatami mats",
        view: "Eastern Valley",
        rating: 4.8,
    },
    {
        id: 6,
        name: "Starry Sky",
        nameEn: "Hoshizora",
        description: "Loft with traditional architecture and modern skylight for celestial contemplation",
        basePrice: 480,
        maxGuests: 2,
        imageUrl: "/placeholder.svg?height=400&width=600&text=Dark traditional loft room with skylight for stargazing",
        amenities: ["Skylight", "Star Charts", "Night Tea", "Contemplation Deck"],
        size: "18 tatami mats",
        view: "Night Sky",
        rating: 4.9,
    },
]


export const ClientRoomPage = () => {
    const [filteredRooms, setFilteredRooms] = useState(roomTypes)
    const [priceRange, setPriceRange] = useState([250, 600])
    const [guestCount, setGuestCount] = useState("any")
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("price-low")
    const containerRef = useRef<HTMLDivElement>(null)
    const roomsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial setup
            gsap.set([".header-content", ".filters-content", ".room-card"], { opacity: 0, y: 30 })
            gsap.set(".floating-element", { opacity: 0, scale: 0 })

            // Entrance animations
            const tl = gsap.timeline()

            tl.to(".header-content", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
            })
                .to(
                    ".filters-content",
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                    },
                    "-=0.6",
                )
                .to(
                    ".floating-element",
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "back.out(1.7)",
                    },
                    "-=0.4",
                )

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
        }, containerRef)

        return () => ctx.revert()
    }, [])

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".room-card",
                { opacity: 0, y: 40, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                },
            )

            // Room card hover effects
            gsap.utils.toArray(".room-card").forEach((cardEl) => {
                const card = cardEl as HTMLElement
                const image = card.querySelector(".room-image")
                const content = card.querySelector(".room-content")

                card.addEventListener("mouseenter", () => {
                    gsap.to(card, { y: -10, scale: 1.02, duration: 0.4, ease: "power2.out" })
                    gsap.to(image, { scale: 1.1, duration: 0.6, ease: "power2.out" })
                    gsap.to(content, { y: -5, duration: 0.3, ease: "power2.out" })
                })

                card.addEventListener("mouseleave", () => {
                    gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" })
                    gsap.to(image, { scale: 1, duration: 0.6, ease: "power2.out" })
                    gsap.to(content, { y: 0, duration: 0.3, ease: "power2.out" })
                })
            })
        }, roomsRef)

        return () => ctx.revert()
    }, [filteredRooms])

    useEffect(() => {
        const filtered = roomTypes.filter((room) => {
            const matchesPrice = room.basePrice >= priceRange[0] && room.basePrice <= priceRange[1]
            const matchesGuests = guestCount === "any" || room.maxGuests >= Number.parseInt(guestCount)
            const matchesSearch =
                !searchTerm ||
                room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.view.toLowerCase().includes(searchTerm.toLowerCase())

            return matchesPrice && matchesGuests && matchesSearch
        })

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.basePrice - b.basePrice
                case "price-high":
                    return b.basePrice - a.basePrice
                case "rating":
                    return b.rating - a.rating
                case "size":
                    return Number.parseInt(b.size) - Number.parseInt(a.size)
                case "guests":
                    return b.maxGuests - a.maxGuests
                default:
                    return 0
            }
        })

        setFilteredRooms(filtered)
    }, [priceRange, guestCount, searchTerm, sortBy])

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>


            <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 relative z-10">
                {/* Header */}
                <div className="header-content text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-light text-slate-100 mb-4 tracking-wide">Guest Rooms</h1>
                    <p className="text-lg text-amber-400 tracking-widest mb-6">MOUNTAIN SANCTUARIES</p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl text-slate-300 leading-relaxed font-light max-w-3xl mx-auto">
                        {`Each room is a sanctuary of simplicity, where natural materials and thoughtful design create harmony between
                        tradition and comfort in the mountain's embrace`}
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="filters-content border border-slate-700/50 shadow-2xl bg-slate-800/50 backdrop-blur-xl sticky top-8 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Filter className="h-5 w-5 text-slate-900" />
                                    </div>
                                    <h3 className="text-lg font-light text-slate-100 tracking-wide">Find Your Sanctuary</h3>
                                </div>

                                <div className="space-y-8">
                                    {/* Search */}
                                    <div>
                                        <Label className="text-slate-300 mb-3 block font-light">Search Rooms</Label>
                                        <Input
                                            placeholder="Room name or view..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                        />
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <Label className="text-slate-300 mb-4 block font-light">
                                            Price Range: ${priceRange[0]} - ${priceRange[1]}
                                        </Label>
                                        <Slider
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            max={600}
                                            min={250}
                                            step={10}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                                            <span>Accessible</span>
                                            <span>Premium</span>
                                        </div>
                                    </div>

                                    {/* Guest Count */}
                                    <div>
                                        <Label className="text-slate-300 mb-3 block font-light">Maximum Guests</Label>
                                        <Select value={guestCount} onValueChange={setGuestCount}>
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400">
                                                <SelectValue placeholder="Any number" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="any">Any number</SelectItem>
                                                <SelectItem value="1">1 Guest</SelectItem>
                                                <SelectItem value="2">2 Guests</SelectItem>
                                                <SelectItem value="3">3 Guests</SelectItem>
                                                <SelectItem value="4">4 Guests</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <Label className="text-slate-300 mb-3 block font-light">Sort By</Label>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                                <SelectItem value="rating">Highest Rated</SelectItem>
                                                <SelectItem value="size">Room Size</SelectItem>
                                                <SelectItem value="guests">Maximum Guests</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rooms Grid */}
                    <div className="lg:col-span-3">
                        <div className="mb-8 flex justify-between items-center">
                            <p className="text-slate-300 font-light">
                                <span className="font-medium text-amber-400">{filteredRooms.length}</span> sanctuary
                                {filteredRooms.length !== 1 ? "s" : ""} available
                            </p>
                        </div>

                        <div ref={roomsRef} className="grid md:grid-cols-2 gap-8">
                            {filteredRooms.map((room) => (
                                <Card
                                    key={room.id}
                                    className="room-card border border-slate-700/50 shadow-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-amber-500/10 transition-all duration-500"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src={room.imageUrl || "/placeholder.svg"}
                                            alt={room.name}
                                            fill
                                            className="room-image object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-slate-800/80 backdrop-blur-sm text-amber-400 border border-amber-400/30 hover:bg-slate-700/80">
                                                <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                                                {room.rating}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="room-content p-8">
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-light text-slate-100 mb-1 tracking-wide">{room.name}</h3>
                                            <p className="text-sm text-amber-400 tracking-widest mb-4">{room.nameEn.toUpperCase()}</p>
                                            <p className="text-slate-300 leading-relaxed font-light mb-4">{room.description}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Size:</span>
                                                    <p className="font-light text-slate-200">{room.size}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">View:</span>
                                                    <p className="font-light text-slate-200">{room.view}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {room.amenities.map((amenity) => (
                                                    <Badge
                                                        key={amenity}
                                                        variant="secondary"
                                                        className="text-xs bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 font-light border border-slate-600/50"
                                                    >
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-2xl font-light text-amber-400">${room.basePrice}</span>
                                                <span className="text-slate-400 text-sm font-light">/night</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <Link href={`/rooms/${room.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 font-light bg-transparent transition-all duration-300"
                                                    >
                                                        View Details
                                                    </Button>
                                                </Link>
                                                <Link href={`/booking?room=${room.id}`}>
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-light shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
                                                    >
                                                        Reserve
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredRooms.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
                                    <div className="w-12 h-12 border border-amber-400/50 rounded-full"></div>
                                </div>
                                <h3 className="text-xl font-light text-slate-100 mb-4">No rooms found</h3>
                                <p className="text-slate-400 mb-6 font-light">
                                    Please adjust your search criteria to find your perfect sanctuary
                                </p>
                                <Button
                                    onClick={() => {
                                        setPriceRange([250, 600])
                                        setGuestCount("any")
                                        setSearchTerm("")
                                        setSortBy("price-low")
                                    }}
                                    variant="outline"
                                    className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 font-light bg-transparent transition-all duration-300"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
