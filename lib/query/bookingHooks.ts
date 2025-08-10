import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {BookingWithDetails, CreateBookingData} from '@/lib/types/roomTypes'
import {ApiResponse} from '@/lib/types/commonTypes'
import axios from "axios";
import {BookingsResponse} from "@/app/api/(domain)/bookings/route";

export const useCreateBooking = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (bookingData: CreateBookingData): Promise<BookingWithDetails> => {
            const response = await axios.post<ApiResponse<BookingWithDetails>>(
                '/api/bookings',
                bookingData, {withCredentials: true}
            )
            return response.data.data!
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({queryKey: ['bookings']})
            await queryClient.invalidateQueries({queryKey: ['user-bookings']})

            toast.success('Booking created successfully!', {
                description: `Your booking for ${data.room.roomType.name} has been confirmed.`
            })
        },
        onError: (error) => {
            const errorMessage = error.message || 'Failed to create booking'
            toast.error('Booking Failed', {
                description: errorMessage
            })
        }
    })
}

export const useUserBookings = (params?: {
    page?: number
    limit?: number
    status?: string
}) => {
    return useQuery({
        queryKey: ['user-bookings', params],
        queryFn: async (): Promise<BookingsResponse> => {
            const searchParams = new URLSearchParams()
            if (params?.page) searchParams.append('page', params.page.toString())
            if (params?.limit) searchParams.append('limit', params.limit.toString())
            if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status)

            const response = await axios.get<ApiResponse<BookingsResponse>>(
                `/api/bookings?${searchParams.toString()}`,
                {withCredentials: true}
            )
            return response.data.data!
        },
        staleTime: 1000 * 60 * 5,
    })
}

export const useBooking = (bookingId: string) => {
    return useQuery({
        queryKey: ['booking', bookingId],
        queryFn: async (): Promise<BookingWithDetails> => {
            const response = await axios.get<ApiResponse<BookingWithDetails>>(
                `/api/bookings/${bookingId}`, {withCredentials: true}
            )
            return response.data.data!
        },
        enabled: !!bookingId,
    })
}

export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookingId: number) => {
            const response = await axios.delete<ApiResponse<BookingWithDetails>>(`/api/bookings/${bookingId}`);
            return response.data.data;
        },
        onSuccess: async ( bookingId) => {
            await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
        },
        onError: (error) => {
            console.error('Error cancelling booking:', error);
        },
    });
};