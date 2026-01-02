export interface RouteRequest {
    name: string;
    origin: string;
    destination: string;
    distanceKm: number;
    estimatedMinutes: number;
    pickupStops: RouteStopRequest[];
    dropoffStops: RouteStopRequest[];
    isActive: boolean;
}

export interface RouteStopRequest {
    stationId: string;
    duration: number;
    isOrigin: boolean;
    isDestination: boolean;
}

export interface RouteResponse {
    id: string;
    details: {
        name: string;
        origin: string;
        destination: string;
        distanceKm: number;
        estimatedMinutes: number;
    };
    pickup_points: RouteStopResponse[];
    dropoff_points: RouteStopResponse[];
    from: RouteStopResponse;
    to: RouteStopResponse;
    isActive: boolean;
}

export interface RouteStopResponse {
    id: string;
    name: string;
    address: string;
    duration: number;
}