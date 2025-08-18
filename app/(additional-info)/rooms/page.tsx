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
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            console.warn('API_URL not configured, using fallback data');
            return {
                success: true,
                message: "Fallback data",
                data: {
                    rooms: [],
                    pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 }
                }
            };
        }

        const params = new URLSearchParams({
            page: "1",
            limit: "10",
            sortBy: "price",
            sortOrder: "asc",
        });

        const response = await fetch(`${apiUrl}/rooms/?${params}`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to fetch initial rooms:', error);
        // Return fallback data instead of throwing
        return {
            success: false,
            message: "Failed to load rooms",
            data: {
                rooms: [],
                pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 }
            }
        };
    }
}
export default async function RoomsPage() {
    const initialData = await fetchInitialRooms();
    return <ClientRoomPage initialData={initialData} />;
}