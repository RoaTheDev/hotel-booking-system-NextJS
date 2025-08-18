import { notFound } from "next/navigation";
import { RoomWithDetails } from "@/types/roomTypes";
import ClientRoomDetail from "./clientRoomDetailPage";

async function fetchRoom(roomId: string): Promise<RoomWithDetails> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`);

    if (!res.ok) notFound(); // throws 404

    const data = await res.json();
    if (!data.success) notFound(); // throws 404

    return data.data;
}

interface RoomPageProps {
    params: Promise<{ id: string }>; // Updated to use Promise
}

export default async function RoomDetailPage({ params }: RoomPageProps) {
    const { id } = await params; // Await the params to get the id
    const room = await fetchRoom(id);
    return <ClientRoomDetail room={room} />;
}