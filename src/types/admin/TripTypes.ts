import z from "zod";

const tripSearchSchema = z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    date: z.string().optional(),
});

export interface TripCreateRequest {
    routeId: string;
    busId?: string;        // Optional, can be null
    busModelId?: string;   // Optional, used if busId is null
    departureTime: string; // ISO 8601 string (LocalDateTime)
    originalPrice: number; // BigDecimal
    discountPrice?: number; // BigDecimal, optional
    status?: string;       // TripStatus enum as string (e.g., 'SCHEDULED')
}

export interface TripUpdateRequest {
    busId?: string;
    departureTime: string;
    originalPrice: number;
    discountPrice?: number;
    status?: string;
}

export interface TripCreateResponse {
    id: string;
    route: {
        id: string;
        name: string;
    };
    bus: {
        id: string;
        name: string;
        plateNumber: string;
        busModel: {
            id: string;
            name: string;
            typeDisplay: string;
        };
    } | null;
    busModel: {
        id: string;
        name: string;
        typeDisplay: string;
    };
    departureTime: string;
    originalPrice: number;
    discountPrice: number;
    status: string;
    availableSeats: number;
}

export interface TripDetailsResponse extends TripCreateResponse {
    seatMap: SeatMapDto;
}

export interface SeatMapDto {
    totalDecks: number;
    gridRows: number;
    gridColumns: number;

}

export interface SeatDetailDto {
    seatCode: string;
    status: string;
    row: number;
    col: number;
    deck: number;
    passenger: PassengerDto;
}

export interface PassengerDto {
    name: string;
    email: string;
    phone: string;
}