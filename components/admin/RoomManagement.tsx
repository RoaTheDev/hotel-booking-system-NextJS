'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {AlertCircle, Edit, Eye, ImagesIcon, Loader2, Plus, Trash2} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import {RoomTypeWithDetails} from '@/types/roomTypes';
import {RoomInternal} from "@/app/api/(protected)/admin/rooms/route";
import {Decimal} from '@prisma/client/runtime/library';

interface RoomImage {
    id: number;
    imageUrl: string;
    caption?: string | null;
}

interface Room {
    id: number;
    roomNumber: string;
    roomTypeId: number;
    floor?: number | null;
    isActive: boolean;
    roomType: {
        id: number;
        name: string;
        description?: string | null;
        basePrice: Decimal;
        maxGuests: number;
        imageUrl?: string | null;
    };
    amenities: Array<{
        id: number;
        amenity: {
            id: number;
            name: string;
            icon?: string | null;
            description?: string | null;
        };
    }>;
    images: RoomImage[];
    _count?: {
        bookings: number;
    };
}

interface AmenityWithDetails {
    id: number;
    name: string;
    icon: string | null;
    description: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        rooms: number;
    };
}

interface CreateRoomForm {
    roomNumber: string;
    roomTypeId: number | null;
    floor?: number;
    imageUrls: string[];
    amenityIds: number[];
}

interface CreateRoomTypeForm {
    name: string;
    description: string;
    basePrice: number;
    maxGuests: number;
    imageUrl: string;
}

interface CreateAmenityForm {
    name: string;
    icon: string;
    description: string;
    isActive: boolean;
}

interface ImageForm {
    imageUrl: string;
    caption: string;
}

export default function RoomManagement() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'rooms' | 'roomTypes' | 'amenities'>('rooms');
    const [roomForm, setRoomForm] = useState<CreateRoomForm>({
        roomNumber: '',
        roomTypeId: null,
        floor: 1,
        imageUrls: [''],
        amenityIds: [],
    });
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [roomTypeForm, setRoomTypeForm] = useState<CreateRoomTypeForm>({
        name: '',
        description: '',
        basePrice: 0,
        maxGuests: 1,
        imageUrl: '',
    });
    const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState<RoomTypeWithDetails | null>(null);
    const [amenityForm, setAmenityForm] = useState<CreateAmenityForm>({
        name: '',
        icon: '',
        description: '',
        isActive: true,
    });
    const [amenityDialogOpen, setAmenityDialogOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<AmenityWithDetails | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [selectedRoomForImages, setSelectedRoomForImages] = useState<Room | null>(null);
    const [imageForm, setImageForm] = useState<ImageForm>({imageUrl: '', caption: ''});
    const [bulkImageDialogOpen, setBulkImageDialogOpen] = useState(false);
    const [bulkImages, setBulkImages] = useState<ImageForm[]>([{imageUrl: '', caption: ''}]);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    // Fetch data using React Query
    const {data: rooms = [], isLoading: roomsLoading, error: roomsError} = useQuery<
        RoomInternal[]>({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await axios.get('/api/admin/rooms');
            return response.data.success ? response.data.data.rooms : [];
        },
    });

    const {data: roomTypes = [], isLoading: roomTypesLoading, error: roomTypesError} =
        useQuery<RoomTypeWithDetails[]>({
            queryKey: ['roomTypes'],
            queryFn: async () => {
                const response = await axios.get('/api/admin/room-types');
                if (!response.data.success) return [];
                return response.data.data.roomTypes ?? [];
            },
        });

    const {data: amenities = [], isLoading: amenitiesLoading, error: amenitiesError} =
        useQuery<AmenityWithDetails[]>({
            queryKey: ['amenities'],
            queryFn: async () => {
                const response = await axios.get('/api/admin/amenities');
                if (!response.data.success) return [];
                return response.data.data.amenities ?? [];
            },
        });

    const {data: roomImages = [], isLoading: imagesLoading, refetch: refetchImages} = useQuery<RoomImage[]>({
        queryKey: ['roomImages', selectedRoomForImages?.id],
        queryFn: async () => {
            if (!selectedRoomForImages) return [];
            const response = await axios.get(`/api/admin/rooms/${selectedRoomForImages.id}/images`);
            return response.data.success ? response.data.data : [];
        },
        enabled: !!selectedRoomForImages,
    });

    // Room mutations
    const createRoomMutation = useMutation({
        mutationFn: (formData: CreateRoomForm) =>
            axios.post('/api/admin/rooms', {
                ...formData,
                imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['rooms']});
            setRoomDialogOpen(false);
            resetRoomForm();
        },
        onError: (error) => {
            console.error('Create room error:', error);
        },
    });

    const updateRoomMutation = useMutation({
        mutationFn: (formData: CreateRoomForm) =>
            axios.put(`/api/admin/rooms/${editingRoom?.id}`, {
                ...formData,
                imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['rooms']});
            setRoomDialogOpen(false);
            resetRoomForm();
            setEditingRoom(null);
        },
        onError: (error) => {
            console.error('Update room error:', error);
        },
    });

    const deleteRoomMutation = useMutation({
        mutationFn: (roomId: number) => axios.delete(`/api/admin/rooms/${roomId}`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['rooms']});
        },
        onError: (error) => {
            console.error('Delete room error:', error);
        },
    });

    // Room Type mutations
    const createRoomTypeMutation = useMutation({
        mutationFn: (formData: CreateRoomTypeForm) => axios.post('/api/admin/room-types', formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['roomTypes']});
            setRoomTypeDialogOpen(false);
            resetRoomTypeForm();
        },
        onError: (error) => {
            console.error('Create room type error:', error);
        },
    });

    const updateRoomTypeMutation = useMutation({
        mutationFn: (formData: CreateRoomTypeForm) => axios.put(`/api/admin/room-types/${editingRoomType?.id}`, formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['roomTypes']});
            setRoomTypeDialogOpen(false);
            resetRoomTypeForm();
            setEditingRoomType(null);
        },
        onError: (error) => {
            console.error('Update room type error:', error);
        },
    });

    const deleteRoomTypeMutation = useMutation({
        mutationFn: (roomTypeId: number) => axios.delete(`/api/admin/room-types/${roomTypeId}`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['roomTypes']});
        },
        onError: (error) => {
            console.error('Delete room type error:', error);
        },
    });

    // Amenity mutations
    const createAmenityMutation = useMutation({
        mutationFn: (formData: CreateAmenityForm) => axios.post('/api/admin/amenities', formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['amenities']});
            setAmenityDialogOpen(false);
            resetAmenityForm();
        },
        onError: (error) => {
            console.error('Create amenity error:', error);
        },
    });

    const updateAmenityMutation = useMutation({
        mutationFn: (formData: CreateAmenityForm) => axios.put(`/api/admin/amenities/${editingAmenity?.id}`, formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['amenities']});
            setAmenityDialogOpen(false);
            resetAmenityForm();
            setEditingAmenity(null);
        },
        onError: (error) => {
            console.error('Update amenity error:', error);
        },
    });

    const deleteAmenityMutation = useMutation({
        mutationFn: (amenityId: number) => axios.delete(`/api/admin/amenities/${amenityId}`),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['amenities']});
        },
        onError: (error) => {
            console.error('Delete amenity error:', error);
        },
    });

    // Image mutations
    const addImageMutation = useMutation({
        mutationFn: ({roomId, imageData}: { roomId: number; imageData: ImageForm }) =>
            axios.post(`/api/admin/rooms/${roomId}/images`, imageData),
        onSuccess: async () => {
            await refetchImages();
            setImageForm({imageUrl: '', caption: ''});
        },
        onError: (error) => {
            console.error('Add image error:', error);
        },
    });

    const addBulkImagesMutation = useMutation({
        mutationFn: ({roomId, images}: { roomId: number; images: ImageForm[] }) =>
            axios.post(`/api/admin/rooms/${roomId}/images/bulk`, {
                images: images.filter(img => img.imageUrl.trim() !== ''),
            }),
        onSuccess: async () => {
            await refetchImages();
            setBulkImages([{imageUrl: '', caption: ''}]);
            setBulkImageDialogOpen(false);
        },
        onError: (error) => {
            console.error('Add bulk images error:', error);
        },
    });

    const deleteImageMutation = useMutation({
        mutationFn: ({roomId, imageId}: { roomId: number; imageId: number }) =>
            axios.delete(`/api/admin/rooms/${roomId}/images/${imageId}`),
        onSuccess: async () => {
            await refetchImages();
        },
        onError: (error) => {
            console.error('Delete image error:', error);
        },
    });

    // Helper functions
    const resetRoomForm = () => {
        setRoomForm({
            roomNumber: '',
            roomTypeId: null,
            floor: 1,
            imageUrls: [''],
            amenityIds: [],
        });
    };

    const resetRoomTypeForm = () => {
        setRoomTypeForm({
            name: '',
            description: '',
            basePrice: 0,
            maxGuests: 1,
            imageUrl: '',
        });
    };

    const resetAmenityForm = () => {
        setAmenityForm({
            name: '',
            icon: '',
            description: '',
            isActive: true,
        });
    };

    const openRoomDialog = (room?: Room) => {
        if (room) {
            setEditingRoom(room);
            setRoomForm({
                roomNumber: room.roomNumber,
                roomTypeId: room.roomTypeId,
                floor: room.floor || undefined,
                imageUrls: room.images.length > 0 ? room.images.map(img => img.imageUrl) : [''],
                amenityIds: room.amenities.map(a => a.amenity.id),
            });
        } else {
            setEditingRoom(null);
            resetRoomForm();
        }
        setRoomDialogOpen(true);
    };

    const openRoomTypeDialog = (roomType?: RoomTypeWithDetails) => {
        if (roomType) {
            setEditingRoomType(roomType);
            setRoomTypeForm({
                name: roomType.name,
                description: roomType.description || '',
                basePrice: roomType.basePrice.toNumber(),
                maxGuests: roomType.maxGuests,
                imageUrl: roomType.imageUrl || '',
            });
        } else {
            setEditingRoomType(null);
            resetRoomTypeForm();
        }
        setRoomTypeDialogOpen(true);
    };

    const openAmenityDialog = (amenity?: AmenityWithDetails) => {
        if (amenity) {
            setEditingAmenity(amenity);
            setAmenityForm({
                name: amenity.name,
                icon: amenity.icon || '',
                description: amenity.description || '',
                isActive: amenity.isActive,
            });
        } else {
            setEditingAmenity(null);
            resetAmenityForm();
        }
        setAmenityDialogOpen(true);
    };

    const openImageDialog = (room: Room) => {
        setSelectedRoomForImages(room);
        setImageDialogOpen(true);
    };

    const openBulkImageDialog = (room: Room) => {
        setSelectedRoomForImages(room);
        setBulkImageDialogOpen(true);
    };

    const addImageUrl = () => {
        setRoomForm(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ''],
        }));
    };

    const removeImageUrl = (index: number) => {
        setRoomForm(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }));
    };

    const updateImageUrl = (index: number, value: string) => {
        setRoomForm(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.map((url, i) => (i === index ? value : url)),
        }));
    };

    const toggleAmenity = (amenityId: number) => {
        setRoomForm(prev => ({
            ...prev,
            amenityIds: prev.amenityIds.includes(amenityId)
                ? prev.amenityIds.filter(id => id !== amenityId)
                : [...prev.amenityIds, amenityId],
        }));
    };

    const addBulkImage = () => {
        setBulkImages(prev => [...prev, {imageUrl: '', caption: ''}]);
    };

    const removeBulkImage = (index: number) => {
        setBulkImages(prev => prev.filter((_, i) => i !== index));
    };

    const updateBulkImage = (index: number, field: 'imageUrl' | 'caption', value: string) => {
        setBulkImages(prev => prev.map((img, i) => (i === index ? {...img, [field]: value} : img)));
    };

    if (roomsLoading || roomTypesLoading || amenitiesLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500"/>
                <span className="ml-2 text-slate-300">Loading data...</span>
            </div>
        );
    }

    const error = roomsError || roomTypesError || amenitiesError;

    return (
        <div className="space-y-6">
            {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400"/>
                    <AlertDescription className="text-red-300">{error.message}</AlertDescription>
                </Alert>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-slate-700/50">
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'rooms' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    Rooms
                </button>
                <button
                    onClick={() => setActiveTab('roomTypes')}
                    className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'roomTypes' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    Room Types
                </button>
                <button
                    onClick={() => setActiveTab('amenities')}
                    className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'amenities' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    Amenities
                </button>
            </div>

            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
                <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-light text-slate-100">Room Management</CardTitle>
                        <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => openRoomDialog()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Add Room
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-slate-100">
                                <DialogHeader>
                                    <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="roomNumber">Room Number</Label>
                                            <Input
                                                id="roomNumber"
                                                value={roomForm.roomNumber}
                                                onChange={(e) => setRoomForm(prev => ({
                                                    ...prev,
                                                    roomNumber: e.target.value
                                                }))}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="floor">Floor</Label>
                                            <Input
                                                id="floor"
                                                type="number"
                                                value={roomForm.floor || ''}
                                                onChange={(e) =>
                                                    setRoomForm(prev => ({
                                                        ...prev,
                                                        floor: e.target.value ? parseInt(e.target.value) : undefined,
                                                    }))
                                                }
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="roomType">Room Type</Label>
                                        <Select
                                            value={roomForm.roomTypeId?.toString() || ''}
                                            onValueChange={(value) => setRoomForm(prev => ({
                                                ...prev,
                                                roomTypeId: parseInt(value)
                                            }))}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue placeholder="Select room type"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-700 border-slate-600">
                                                {roomTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.name} - ${type.basePrice.toString()}/night
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Image URLs</Label>
                                        {roomForm.imageUrls.map((url, index) => (
                                            <div key={index} className="flex gap-2 mt-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => updateImageUrl(index, e.target.value)}
                                                    placeholder="Image URL"
                                                    className="bg-slate-700 border-slate-600"
                                                />
                                                {roomForm.imageUrls.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeImageUrl(index)}
                                                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addImageUrl}
                                            className="mt-2 border-slate-600 text-slate-300"
                                        >
                                            Add Image
                                        </Button>
                                    </div>

                                    <div>
                                        <Label>Amenities</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                                            {amenities.filter(amenity => amenity.isActive).map((amenity) => (
                                                <div key={amenity.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`amenity-${amenity.id}`}
                                                        checked={roomForm.amenityIds.includes(amenity.id)}
                                                        onCheckedChange={() => toggleAmenity(amenity.id)}
                                                    />
                                                    <Label htmlFor={`amenity-${amenity.id}`} className="text-sm flex items-center gap-1">
                                                        {amenity.icon && <span className="text-xs">{amenity.icon}</span>}
                                                        {amenity.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => (editingRoom ? updateRoomMutation.mutate(roomForm) : createRoomMutation.mutate(roomForm))}
                                        className="bg-purple-600 hover:bg-purple-700"
                                        disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
                                    >
                                        {createRoomMutation.isPending || updateRoomMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        ) : editingRoom ? (
                                            'Update Room'
                                        ) : (
                                            'Create Room'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-700/30">
                                    <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                        <TableHead className="text-slate-300 font-light">Room No</TableHead>
                                        <TableHead className="text-slate-300 font-light">Type</TableHead>
                                        <TableHead className="text-slate-300 font-light">Floor</TableHead>
                                        <TableHead className="text-slate-300 font-light">Status</TableHead>
                                        <TableHead className="text-slate-300 font-light">Amenities</TableHead>
                                        <TableHead className="text-slate-300 font-light">Images</TableHead>
                                        <TableHead className="text-slate-300 font-light">Price/Night</TableHead>
                                        <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rooms.map((room) => (
                                        <TableRow key={room.id}
                                                  className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                            <TableCell
                                                className="font-medium text-slate-200">{room.roomNumber}</TableCell>
                                            <TableCell className="text-slate-300">{room.roomType.name}</TableCell>
                                            <TableCell>
                                                <Badge>{room.floor || 'N/A'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={room.isActive ? 'default' : 'secondary'}>{room.isActive ? 'Active' : 'Inactive'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {room.amenities.slice(0, 3).map((roomAmenity) => (
                                                        <Badge key={roomAmenity.amenity.id} variant="outline" className="text-xs">
                                                            {roomAmenity.amenity.icon && <span className="mr-1">{roomAmenity.amenity.icon}</span>}
                                                            {roomAmenity.amenity.name}
                                                        </Badge>
                                                    ))}
                                                    {room.amenities.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{room.amenities.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {room.images.length} images
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openImageDialog(room)}
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent h-6 px-2"
                                                    >
                                                        <ImagesIcon className="h-3 w-3"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="text-amber-400 font-medium">${room.roomType.basePrice.toString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openRoomDialog(room)}
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                                    >
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this room?')) {
                                                                deleteRoomMutation.mutate(room.id);
                                                            }
                                                        }}
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 bg-transparent transition-all duration-300"
                                                        disabled={deleteRoomMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Room Types Tab */}
            {activeTab === 'roomTypes' && (
                <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-light text-slate-100">Room Type Management</CardTitle>
                        <Dialog open={roomTypeDialogOpen} onOpenChange={setRoomTypeDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => openRoomTypeDialog()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Add Room Type
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg bg-slate-800 border-slate-700 text-slate-100">
                                <DialogHeader>
                                    <DialogTitle>{editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="typeName">Name</Label>
                                        <Input
                                            id="typeName"
                                            value={roomTypeForm.name}
                                            onChange={(e) => setRoomTypeForm(prev => ({...prev, name: e.target.value}))}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={roomTypeForm.description}
                                            onChange={(e) => setRoomTypeForm(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="basePrice">Base Price</Label>
                                            <Input
                                                id="basePrice"
                                                type="text"
                                                value={roomTypeForm.basePrice}
                                                onChange={(e) => setRoomTypeForm(prev => ({
                                                    ...prev,
                                                    basePrice: parseFloat(e.target.value) || 0
                                                }))}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="maxGuests">Max Guests</Label>
                                            <Input
                                                id="maxGuests"
                                                type="number"
                                                value={roomTypeForm.maxGuests}
                                                onChange={(e) => setRoomTypeForm(prev => ({
                                                    ...prev,
                                                    maxGuests: parseInt(e.target.value) || 1
                                                }))}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="imageUrl">Image URL</Label>
                                        <Input
                                            id="imageUrl"
                                            value={roomTypeForm.imageUrl}
                                            onChange={(e) => setRoomTypeForm(prev => ({
                                                ...prev,
                                                imageUrl: e.target.value
                                            }))}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => (editingRoomType ? updateRoomTypeMutation.mutate(roomTypeForm) : createRoomTypeMutation.mutate(roomTypeForm))}
                                        className="bg-purple-600 hover:bg-purple-700"
                                        disabled={createRoomTypeMutation.isPending || updateRoomTypeMutation.isPending}
                                    >
                                        {createRoomTypeMutation.isPending || updateRoomTypeMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        ) : editingRoomType ? (
                                            'Update Room Type'
                                        ) : (
                                            'Create Room Type'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-700/30">
                                    <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                        <TableHead className="text-slate-300 font-light">Name</TableHead>
                                        <TableHead className="text-slate-300 font-light">Description</TableHead>
                                        <TableHead className="text-slate-300 font-light">Base Price</TableHead>
                                        <TableHead className="text-slate-300 font-light">Max Guests</TableHead>
                                        <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roomTypes.map((roomType) => (
                                        <TableRow key={roomType.id}
                                                  className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                            <TableCell
                                                className="font-medium text-slate-200">{roomType.name}</TableCell>
                                            <TableCell
                                                className="text-slate-300 max-w-xs truncate">{roomType.description || 'N/A'}</TableCell>
                                            <TableCell
                                                className="text-amber-400 font-medium">${roomType.basePrice.toString()}</TableCell>
                                            <TableCell className="text-slate-300">{roomType.maxGuests}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openRoomTypeDialog(roomType)}
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                                    >
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this room type?')) {
                                                                deleteRoomTypeMutation.mutate(roomType.id);
                                                            }
                                                        }}
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 bg-transparent transition-all duration-300"
                                                        disabled={deleteRoomTypeMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Amenities Tab */}
            {activeTab === 'amenities' && (
                <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-light text-slate-100">Amenity Management</CardTitle>
                        <Dialog open={amenityDialogOpen} onOpenChange={setAmenityDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => openAmenityDialog()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                                >
                                    <Plus className="h-4 w-4"/>
                                    Add Amenity
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg bg-slate-800 border-slate-700 text-slate-100">
                                <DialogHeader>
                                    <DialogTitle>{editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="amenityName">Name</Label>
                                        <Input
                                            id="amenityName"
                                            value={amenityForm.name}
                                            onChange={(e) => setAmenityForm(prev => ({...prev, name: e.target.value}))}
                                            placeholder="WiFi, Pool, Gym, etc."
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="amenityIcon">Icon (Emoji)</Label>
                                        <Input
                                            id="amenityIcon"
                                            value={amenityForm.icon}
                                            onChange={(e) => setAmenityForm(prev => ({...prev, icon: e.target.value}))}
                                            placeholder="📶 🏊‍♂️ 💪 etc."
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="amenityDescription">Description</Label>
                                        <Textarea
                                            id="amenityDescription"
                                            value={amenityForm.description}
                                            onChange={(e) => setAmenityForm(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))}
                                            placeholder="Brief description of the amenity"
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="amenityActive"
                                            checked={amenityForm.isActive}
                                            onCheckedChange={(checked) => setAmenityForm(prev => ({
                                                ...prev,
                                                isActive: checked as boolean
                                            }))}
                                        />
                                        <Label htmlFor="amenityActive">Active</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => (editingAmenity ? updateAmenityMutation.mutate(amenityForm) : createAmenityMutation.mutate(amenityForm))}
                                        className="bg-purple-600 hover:bg-purple-700"
                                        disabled={createAmenityMutation.isPending || updateAmenityMutation.isPending}
                                    >
                                        {createAmenityMutation.isPending || updateAmenityMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        ) : editingAmenity ? (
                                            'Update Amenity'
                                        ) : (
                                            'Create Amenity'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-700/30">
                                    <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                        <TableHead className="text-slate-300 font-light">Name</TableHead>
                                        <TableHead className="text-slate-300 font-light">Icon</TableHead>
                                        <TableHead className="text-slate-300 font-light">Description</TableHead>
                                        <TableHead className="text-slate-300 font-light">Status</TableHead>
                                        <TableHead className="text-slate-300 font-light">Rooms Using</TableHead>
                                        <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {amenities.map((amenity) => (
                                        <TableRow key={amenity.id}
                                                  className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                            <TableCell className="font-medium text-slate-200">{amenity.name}</TableCell>
                                            <TableCell className="text-2xl">{amenity.icon || '—'}</TableCell>
                                            <TableCell
                                                className="text-slate-300 max-w-xs truncate">{amenity.description || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={amenity.isActive ? 'default' : 'secondary'}>{amenity.isActive ? 'Active' : 'Inactive'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {amenity._count?.rooms || 0} rooms
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openAmenityDialog(amenity)}
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                                    >
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this amenity?')) {
                                                                deleteAmenityMutation.mutate(amenity.id);
                                                            }
                                                        }}
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 bg-transparent transition-all duration-300"
                                                        disabled={deleteAmenityMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Image Management Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-slate-100">
                    <DialogHeader>
                        <DialogTitle>Manage Images - Room {selectedRoomForImages?.roomNumber}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-4 p-4 border border-slate-700/50 rounded-lg">
                            <h3 className="text-lg font-medium text-slate-200">Add Single Image</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="newImageUrl">Image URL</Label>
                                    <Input
                                        id="newImageUrl"
                                        value={imageForm.imageUrl}
                                        onChange={(e) => setImageForm(prev => ({...prev, imageUrl: e.target.value}))}
                                        placeholder="https://example.com/image.jpg"
                                        className="bg-slate-700 border-slate-600"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="newImageCaption">Caption (Optional)</Label>
                                    <Input
                                        id="newImageCaption"
                                        value={imageForm.caption}
                                        onChange={(e) => setImageForm(prev => ({...prev, caption: e.target.value}))}
                                        placeholder="Image caption"
                                        className="bg-slate-700 border-slate-600"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        if (selectedRoomForImages && imageForm.imageUrl.trim()) {
                                            addImageMutation.mutate({
                                                roomId: selectedRoomForImages.id,
                                                imageData: imageForm,
                                            });
                                        }
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700"
                                    disabled={addImageMutation.isPending || !imageForm.imageUrl.trim()}
                                >
                                    {addImageMutation.isPending ?
                                        <Loader2 className="h-4 w-4 animate-spin"/> : 'Add Image'}
                                </Button>
                                <Button
                                    onClick={() => openBulkImageDialog(selectedRoomForImages!)}
                                    variant="outline"
                                    className="border-slate-600 text-slate-300"
                                >
                                    Bulk Add Images
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-slate-200">Current Images ({roomImages.length})</h3>
                            {imagesLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-purple-500"/>
                                    <span className="ml-2 text-slate-300">Loading images...</span>
                                </div>
                            ) : roomImages.length === 0 ? (
                                <div className="text-center p-8 text-slate-400">No images found for this room</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                                    {roomImages.map((image) => (
                                        <div key={image.id}
                                             className="relative group border border-slate-700/50 rounded-lg overflow-hidden">
                                            <Image
                                                width={400}
                                                height={400}
                                                src={image.imageUrl}
                                                alt={image.caption || 'Room image'}
                                                className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setPreviewImageUrl(image.imageUrl)}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/api/placeholder/300/200';
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setPreviewImageUrl(image.imageUrl)}
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                                                    >
                                                        <Eye className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this image?')) {
                                                                deleteImageMutation.mutate({
                                                                    roomId: selectedRoomForImages!.id,
                                                                    imageId: image.id,
                                                                });
                                                            }
                                                        }}
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 bg-transparent"
                                                        disabled={deleteImageMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                            {image.caption && (
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{image.caption}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setImageDialogOpen(false);
                                setSelectedRoomForImages(null);
                                setImageForm({imageUrl: '', caption: ''});
                            }}
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Image Upload Dialog */}
            <Dialog open={bulkImageDialogOpen} onOpenChange={setBulkImageDialogOpen}>
                <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-slate-100">
                    <DialogHeader>
                        <DialogTitle>Bulk Add Images - Room {selectedRoomForImages?.roomNumber}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {bulkImages.map((image, index) => (
                            <div key={index}
                                 className="grid grid-cols-2 gap-4 p-4 border border-slate-700/50 rounded-lg">
                                <div>
                                    <Label>Image URL {index + 1}</Label>
                                    <Input
                                        value={image.imageUrl}
                                        onChange={(e) => updateBulkImage(index, 'imageUrl', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="bg-slate-700 border-slate-600"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="flex-1">
                                        <Label>Caption (Optional)</Label>
                                        <Input
                                            value={image.caption}
                                            onChange={(e) => updateBulkImage(index, 'caption', e.target.value)}
                                            placeholder="Image caption"
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                    {bulkImages.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeBulkImage(index)}
                                            className="ml-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                        <Button variant="outline" onClick={addBulkImage} className="border-slate-600 text-slate-300">
                            <Plus className="h-4 w-4 mr-2"/>
                            Add Another Image
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setBulkImageDialogOpen(false);
                                    setBulkImages([{imageUrl: '', caption: ''}]);
                                }}
                                className="border-slate-600 text-slate-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (selectedRoomForImages) {
                                        addBulkImagesMutation.mutate({
                                            roomId: selectedRoomForImages.id,
                                            images: bulkImages,
                                        });
                                    }
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                                disabled={addBulkImagesMutation.isPending || !bulkImages.some(img => img.imageUrl.trim())}
                            >
                                {addBulkImagesMutation.isPending ?
                                    <Loader2 className="h-4 w-4 animate-spin"/> : 'Add All Images'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
                <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            Image Preview
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex justify-center">
                        {previewImageUrl && (
                            <Image
                                height={400}
                                width={400}
                                src={previewImageUrl}
                                alt="Preview"
                                className="max-w-full max-h-96 object-contain rounded-lg"
                                onError={(e) => {
                                    e.currentTarget.src = '/api/placeholder/400/300';
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}