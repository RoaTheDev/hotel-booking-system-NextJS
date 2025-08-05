import { notFound } from "next/navigation";
import axios from "axios";
import { RoomWithDetails } from "@/lib/types/roomTypes";
import ClientRoomDetail from "./clientRoomDetailPage";

async function fetchRoom(roomId: string): Promise<RoomWithDetails> {
    try {
        console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`);
        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to fetch room");
        }
        return response.data.data;
    } catch {
        throw new Error("Room not found");
    }
}

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const room = await fetchRoom(id);
        return <ClientRoomDetail room={room} />;
    } catch {
        notFound();
    }
}
