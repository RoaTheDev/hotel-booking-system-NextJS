import { notFound } from "next/navigation";
import { RoomWithDetails } from "@/types/roomTypes";
import ClientRoomDetail from "./clientRoomDetailPage";
async function fetchRoom(roomId: string): Promise<RoomWithDetails> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseURL = isDevelopment
        ? "http://localhost:3000/api"
        : `https://${process.env.VERCEL_URL}/api`;

    console.log(`Fetching room ${roomId} from: ${baseURL}/rooms/${roomId}`);

    try {
        const res = await fetch(`${baseURL}/rooms/${roomId}`, {
            cache: 'force-cache',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log(`API Response status: ${res.status}`);

        if (!res.ok) {
            console.error(`API request failed with status: ${res.status}`);
            notFound();
        }

        const data = await res.json();
        console.log('API Response data:', data);

        if (!data.success) {
            console.error('API returned unsuccessful response:', data);
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