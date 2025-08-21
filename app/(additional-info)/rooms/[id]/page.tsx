import { notFound } from "next/navigation";
import { RoomWithDetails } from "@/types/roomTypes";
import ClientRoomDetail from "./clientRoomDetailPage";
async function fetchRoom(roomId: string): Promise<RoomWithDetails> {
    // Fix 1: Better environment detection and URL construction
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseURL = isDevelopment
        ? "http://localhost:3000"
        : `https://${process.env.VERCEL_URL}`;


    try {
        const res = await fetch(`${baseURL}/api/rooms/${roomId}`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });


        if (!res.ok) {
            console.error(`API request failed with status: ${res.status}`);
            notFound();
        }

        const data = await res.json();

        if (!data.success) {
            notFound();
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching room:', error);
        notFound();
    }
}

interface RoomPageProps {
    params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: RoomPageProps) {
    const { id } = await params;

    if (!id) {
        console.error('Invalid room ID:', id);
        notFound();
    }

    const room = await fetchRoom(id);
    return <ClientRoomDetail room={room} />;
}