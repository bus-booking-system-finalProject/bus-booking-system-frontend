export type BusTypes = 'SEATER' | 'SLEEPER' | 'CABIN';

export interface BusModelRequest {
    name: string;
    totalDecks: number;
    gridRows: number;
    gridColumns: number;
    type: BusTypes;
    isLimousine: boolean;
    hasWC: boolean;
    seats: Seat[];
    keptImages?: string[];
}

export interface BusModelResponse {
    id: string;
    name: string;
    typeDisplay: string;
    type: BusTypes;
    isLimousine: boolean;
    hasWC: boolean;
    seatCapacity: number;
    images?: string[];
}

export interface BusRequest {
    plateNumber: string;
    busModelId: string;
    isActive: boolean;
}

export interface BusResponse {
    id: string;
    plateNumber: string;
    model: BusModelResponse;
    isActive: boolean;
}

export interface BusDetailsResponse {
    id: string;
    model: BusModelDetailsResponse;
    plateNumber: string;
    isActive: boolean;
}

export interface BusModelDetailsResponse {
    details: BusModelResponse;
    totalDecks: number;
    gridRows: number;
    gridColumns: number;
    seats: Seat[];
}

export interface Seat {
    code: string;
    row: number;
    col: number;
    deck: number;
}