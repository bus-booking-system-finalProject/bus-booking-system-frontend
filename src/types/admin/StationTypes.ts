export type StationRequest = Omit<StationResponse, 'id'>;

export interface StationResponse {
    id: string;
    name: string;
    address: string;
    ward: string;
    city: string;
}