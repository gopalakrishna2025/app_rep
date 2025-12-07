
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content?: string;
      }[];
    }[];
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  groundingMetadata?: GroundingMetadata;
  timestamp: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export enum ChatStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR'
}

// --- Booking & Tool Types ---

export type TransportMode = 'flight' | 'train' | 'bus';

export interface TripOption {
  id: string;
  mode: TransportMode;
  operator: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
  origin: string;
  destination: string;
  date: string;
}

export interface BookedTicket extends TripOption {
  ticketId: string;
  passengerName: string;
  seatNumber: string;
  status: 'CONFIRMED';
  qrCodeData: string;
}

// Helper to check if a string is our custom JSON block
export const TICKET_BLOCK_REGEX = /```json:ticket\s*([\s\S]*?)\s*```/;