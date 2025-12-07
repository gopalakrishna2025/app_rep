import { TripOption, BookedTicket, TransportMode } from '../types';

// Mock database generators
const OPERATORS: Record<TransportMode, string[]> = {
  flight: ['SkyWings', 'Global Air', 'JetStream', 'AeroSpeed'],
  train: ['RailConnect', 'SpeedLink', 'CityExpress', 'IronHorse'],
  bus: ['RoadRunner', 'MegaBus', 'GreyCoach', 'QuickShuttle']
};

const LOCATIONS = ['New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'San Francisco', 'Singapore', 'Sydney'];

const generateRandomTime = (startHour: number): string => {
  const h = Math.floor(Math.random() * (23 - startHour) + startHour);
  const m = Math.floor(Math.random() * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const generateDuration = (mode: TransportMode): string => {
  if (mode === 'flight') return `${Math.floor(Math.random() * 10 + 1)}h ${Math.floor(Math.random() * 60)}m`;
  if (mode === 'train') return `${Math.floor(Math.random() * 5 + 1)}h ${Math.floor(Math.random() * 60)}m`;
  return `${Math.floor(Math.random() * 8 + 2)}h ${Math.floor(Math.random() * 60)}m`;
};

const generatePrice = (mode: TransportMode): string => {
  if (mode === 'flight') return `$${Math.floor(Math.random() * 500 + 150)}`;
  if (mode === 'train') return `$${Math.floor(Math.random() * 100 + 50)}`;
  return `$${Math.floor(Math.random() * 50 + 20)}`;
};

// --- Exported Tools ---

export const searchTrips = async (
  origin: string,
  destination: string,
  date: string,
  mode: TransportMode = 'flight'
): Promise<TripOption[]> => {
  console.log(`Searching ${mode} from ${origin} to ${destination} on ${date}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const results: TripOption[] = [];
  const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 results

  for (let i = 0; i < count; i++) {
    const operator = OPERATORS[mode][Math.floor(Math.random() * OPERATORS[mode].length)];
    results.push({
      id: `${mode.toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      mode,
      operator,
      departureTime: generateRandomTime(6),
      arrivalTime: generateRandomTime(12),
      duration: generateDuration(mode),
      price: generatePrice(mode),
      origin,
      destination,
      date
    });
  }
  return results;
};

export const bookTrip = async (
  tripId: string,
  passengerName: string,
  tripDetails: Partial<TripOption>
): Promise<BookedTicket> => {
  console.log(`Booking trip ${tripId} for ${passengerName}`);
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    ...tripDetails as TripOption, // In a real app we'd lookup by ID, here we trust the passed context or mock it
    id: tripId,
    ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    passengerName,
    seatNumber: `${Math.floor(Math.random() * 30) + 1}${['A','B','C','D'][Math.floor(Math.random()*4)]}`,
    status: 'CONFIRMED',
    qrCodeData: `TICKET:${tripId}|${passengerName}`
  };
};
