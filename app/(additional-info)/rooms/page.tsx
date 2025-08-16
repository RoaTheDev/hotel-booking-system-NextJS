import { ClientRoomPage } from "@/app/(additional-info)/rooms/clientRoomPage";
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

async function fetchInitialRooms(): Promise<RoomResponse> {
    const params = new URLSearchParams({
        page: "1",
        limit: "10",
        sortBy: "price",
        sortOrder: "asc",
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/?${params}`, {
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch rooms");
    }

    return response.json();
}


export  default async function RoomsPage() {

    const initialData =await fetchInitialRooms();
    return <ClientRoomPage initialData={initialData} />;
}