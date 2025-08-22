"use client";

import {FC, useEffect, useRef, useState, useCallback} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {Card, CardContent} from "@/components/ui/card";
import {ChevronLeft, ChevronRight, Filter} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import {debounce} from "lodash";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {RoomWithDetails} from "@/types/roomTypes";

export interface Pagination {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}

export interface RoomResponse {
    success: boolean;
    message: string;
    data: {
        rooms: RoomWithDetails[];
        pagination: Pagination;
    };
}

interface RoomData {
    initialData: RoomResponse;
}

gsap.registerPlugin(ScrollTrigger);

export const ClientRoomPage: FC<RoomData> = ({initialData}) => {
    const [rooms, setRooms] = useState<RoomWithDetails[]>(initialData.data.rooms);
    const [pagination, setPagination] = useState<Pagination>(initialData.data.pagination);
    const [filters, setFilters] = useState({
        priceRange: [100, 1000],
        guestCount: "any",
        searchTerm: "",
        sortBy: "price",
        page: 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    const [inputValue, setInputValue] = useState("");
    const [displayPriceRange, setDisplayPriceRange] = useState([100, 1000]);

    const containerRef = useRef<HTMLDivElement>(null);
    const roomsRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        setRooms(initialData.data.rooms);
        setPagination(initialData.data.pagination);
    }, [initialData]);

    const debouncedSearchUpdate = useCallback(
        debounce((searchTerm: string) => {
            setFilters(prev => ({
                ...prev,
                searchTerm,
                page: 1,
            }));
        }, 500),
        []
    );

    const debouncedPriceUpdate = useCallback(
        debounce((priceRange: number[]) => {
            setFilters(prev => ({
                ...prev,
                priceRange,
                page: 1,
            }));
        }, 800),
        []
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        debouncedSearchUpdate(inputValue);
    }, [inputValue, debouncedSearchUpdate]);

    const handlePriceRangeChange = (value: number[]) => {
        setDisplayPriceRange(value);
        debouncedPriceUpdate(value);
    };

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    page: filters.page.toString(),
                    limit: "10",
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortBy === "rating" ? "desc" : "asc",
                    minPrice: filters.priceRange[0].toString(),
                    maxPrice: filters.priceRange[1].toString(),
                });

                if (filters.guestCount !== "any") {
                    params.set("maxGuests", filters.guestCount);
                }
                if (filters.searchTerm) {
                    params.set("search", filters.searchTerm);
                }

                const response = await fetch(`/api/rooms?${params}`);
                const data: RoomResponse = await response.json();

                if (data.success) {
                    setRooms(data.data.rooms);
                    setPagination(data.data.pagination);
                }
            } catch (error) {
                console.error("Error fetching rooms:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const isInitialServerParams = filters.page === 1 &&
            filters.searchTerm === "" &&
            filters.guestCount === "any" &&
            filters.priceRange[0] === 100 &&
            filters.priceRange[1] === 1000 &&
            filters.sortBy === "price";

        if (isInitialMount.current && isInitialServerParams) {
            isInitialMount.current = false;
            return;
        }

        if (isInitialMount.current) {
            isInitialMount.current = false;
        }

        fetchRooms();
    }, [filters])

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set([".header-content", ".filters-content", ".room-card"], {opacity: 0, y: 30});
            gsap.set(".floating-element", {opacity: 0, scale: 0});

            const tl = gsap.timeline();
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
                    "-=0.6"
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
                    "-=0.4"
                );

            gsap.to(".floating-1", {
                y: -20,
                rotation: 5,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
            });

            gsap.to(".floating-2", {
                y: -15,
                rotation: -3,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: 1,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".room-card",
                {opacity: 0, y: 40, scale: 0.95},
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "back.out(1.7)",
                }
            );

            gsap.utils.toArray(".room-card").forEach((cardEl) => {
                const card = cardEl as HTMLElement;
                const image = card.querySelector(".room-image");
                const content = card.querySelector(".room-content");

                card.addEventListener("mouseenter", () => {
                    gsap.to(card, {y: -8, scale: 1.02, duration: 0.4, ease: "power2.out"});
                    gsap.to(image, {scale: 1.05, duration: 0.6, ease: "power2.out"});
                    gsap.to(content, {y: -4, duration: 0.3, ease: "power2.out"});
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(card, {y: 0, scale: 1, duration: 0.4, ease: "power2.out"});
                    gsap.to(image, {scale: 1, duration: 0.6, ease: "power2.out"});
                    gsap.to(content, {y: 0, duration: 0.3, ease: "power2.out"});
                });
            });
        }, roomsRef);

        return () => ctx.revert();
    }, [rooms]);

    const handlePageChange = (newPage: number) => {
        setFilters({...filters, page: newPage});
    };

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleClearFilters = () => {
        setInputValue("");
        setDisplayPriceRange([100, 1000]);
        setFilters({
            priceRange: [100, 1000],
            guestCount: "any",
            searchTerm: "",
            sortBy: "price",
            page: 1,
        });
    };

    return (
        <div ref={containerRef}
             className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
            </div>

            <div className="max-w-7xl mt-10 mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="header-content text-center mb-16">
                    <h1 className="text-5xl font-serif font-light text-slate-100 mb-4 tracking-wider">Tranquil Sanctuaries</h1>
                    <p className="text-lg text-amber-300 tracking-widest mb-6">PEACEFUL RETREATS</p>
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mb-8"></div>
                    <p className="text-xl text-slate-200 leading-relaxed font-light max-w-3xl mx-auto">Discover serenity in our carefully crafted rooms, where traditional elegance meets modern comfort, nestled in nature&apos;s embrace.</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <Card
                            className="filters-content border border-slate-700/30 shadow-xl bg-slate-800/40 backdrop-blur-lg sticky top-8 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Filter className="h-5 w-5 text-slate-900"/>
                                    </div>
                                    <h3 className="text-lg font-serif font-light text-slate-100 tracking-wide">Find Your Peace</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-slate-200 mb-2 block font-light">Search Rooms</Label>
                                        <Input
                                            placeholder="Room name or view..."
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-amber-300 focus:ring-amber-300/20 transition-all duration-300"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-slate-200 mb-3 block font-light">
                                            Price Range: ${displayPriceRange[0]} - ${displayPriceRange[1]}
                                        </Label>
                                        <Slider
                                            value={displayPriceRange}
                                            onValueChange={handlePriceRangeChange}
                                            max={1000}
                                            min={100}
                                            step={10}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                                            <span>Budget</span>
                                            <span>Premium</span>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-slate-200 mb-2 block font-light">Maximum Guests</Label>
                                        <Select value={filters.guestCount}
                                                onValueChange={(value) => handleFilterChange({ guestCount: value })}>
                                            <SelectTrigger
                                                className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-amber-300">
                                                <SelectValue placeholder="Any number"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="any">Any number</SelectItem>
                                                {[1, 2, 3, 4].map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        {num} Guest{num !== 1 ? "s" : ""}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        onClick={handleClearFilters}
                                        variant="outline"
                                        className="w-full border-amber-300/30 text-amber-300 hover:bg-amber-300/10 hover:border-amber-300 font-light bg-transparent transition-all duration-300"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="mb-8 flex justify-between items-center">
                            <p className="text-slate-200 font-light">
                                <span className="font-medium text-amber-300">{pagination.totalCount || rooms.length}</span> sanctuar
                                {rooms.length !== 1 ? "ies" : "y"} available
                            </p>
                        </div>
                        {isLoading ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin mx-auto mb-6"></div>
                                <p className="text-slate-200 font-light">Loading sanctuaries...</p>
                            </div>
                        ) : (
                            <>
                                <div ref={roomsRef} className="grid md:grid-cols-2 gap-6">
                                    {rooms.map((room) => (
                                        <Card key={room.id} className="room-card border border-slate-700/30 shadow-xl bg-slate-800/40 backdrop-blur-sm hover:shadow-teal-500/10 transition-all duration-500">
                                            <div className="relative h-72 overflow-hidden">
                                                <Image src={room.images[0]?.imageUrl || "/placeholder.svg"} alt={room.images[0]?.caption || room.roomType.name} fill className="room-image object-cover transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                                            </div>
                                            <CardContent className="room-content p-6">
                                                <div className="mb-6">
                                                    <h3 className="text-2xl font-serif font-light text-slate-100 mb-1 tracking-wide">{room.roomType.name}</h3>
                                                    <p className="text-slate-200 leading-relaxed font-light mb-4 line-clamp-3">{room.roomType.description}</p>
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {room.amenities.map(({amenity}) => ( <Badge key={amenity.id} variant="secondary" className="text-xs bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 font-light border border-slate-600/50">{amenity.name}</Badge>))}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-2xl font-light text-amber-300">${room.roomType.basePrice}</span>
                                                        <span className="text-slate-400 text-sm font-light">/night</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Link href={`/rooms/${room.id}`}><Button variant="outline" size="sm" className="border-amber-300/30 text-amber-300 hover:bg-amber-300/10 hover:border-amber-300 font-light bg-transparent transition-all duration-300">View Details</Button></Link>
                                                        <Link href={`/booking/${room.id}`}><Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-900 font-light shadow-lg hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105">Reserve</Button></Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                {pagination.totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-4">
                                        <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} variant="outline" size="sm" className="border-amber-300/30 text-amber-300 hover:bg-amber-300/10 hover:border-amber-300 font-light bg-transparent transition-all duration-300"><ChevronLeft className="h-5 w-5"/>Previous</Button>
                                        <p className="text-slate-200 font-light">Page {pagination.page} of {pagination.totalPages}</p>
                                        <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} variant="outline" size="sm" className="border-amber-300/30 text-amber-300 hover:bg-amber-300/10 hover:border-amber-300 font-light bg-transparent transition-all duration-300">Next<ChevronRight className="h-5 w-5"/></Button>
                                    </div>
                                )}
                            </>
                        )}
                        {rooms.length === 0 && !isLoading && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50"><div className="w-12 h-12 border border-amber-300/50 rounded-full"></div></div>
                                <h3 className="text-xl font-serif font-light text-slate-100 mb-4">No sanctuaries found</h3>
                                <p className="text-slate-200 mb-6 font-light">Adjust your search criteria to find your perfect retreat</p>
                                <Button onClick={handleClearFilters} variant="outline" className="border-amber-300/30 text-amber-300 hover:bg-amber-300/10 hover:border-amber-300 font-light bg-transparent transition-all duration-300">Clear Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientRoomPage;