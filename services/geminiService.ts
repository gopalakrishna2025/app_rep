import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type, Tool } from "@google/genai";
import { GeoLocation } from "../types";
import { searchTrips, bookTrip } from "./mockTransportData";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to guide the persona
const SYSTEM_INSTRUCTION = `You are Wanderlust, an expert, friendly, and enthusiastic travel assistant. 
Your goal is to help users plan trips, find destinations, and discover local attractions.
- Use emojis effectively to make the conversation engaging 🌍✈️.
- Format your responses using Markdown for readability (bolding, lists).
- If the user asks about specific places or current events, use your tools to find real-time information.
- Be concise but helpful. 

*** REAL-TIME BOOKING CAPABILITIES ***
You have access to tools for searching and booking flights, trains, and buses.
1. When a user asks to travel, ask for origin, destination, and date if not provided.
2. Call 'search_trips' to find options.
3. Present the options clearly to the user (e.g., in a Markdown list or table).
4. When the user selects an option and provides a name, call 'book_trip'.
5. **IMPORTANT**: Upon receiving a successful booking confirmation from the 'book_trip' tool, you MUST output the full ticket JSON object inside a special block like this:
   
   \`\`\`json:ticket
   {
     "id": "...",
     "mode": "...",
     "operator": "...",
     "departureTime": "...",
     "arrivalTime": "...",
     "duration": "...",
     "price": "...",
     "origin": "...",
     "destination": "...",
     "date": "...",
     "ticketId": "...",
     "passengerName": "...",
     "seatNumber": "...",
     "status": "CONFIRMED"
   }
   \`\`\`
   
   Follow this JSON block with a friendly "Bon voyage!" message.
`;

// --- Tool Definitions ---

const searchTripsTool: FunctionDeclaration = {
  name: "search_trips",
  description: "Search for flights, trains, or buses between cities on a specific date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      origin: { type: Type.STRING, description: "City of origin" },
      destination: { type: Type.STRING, description: "City of destination" },
      date: { type: Type.STRING, description: "Date of travel (YYYY-MM-DD or human readable)" },
      mode: { type: Type.STRING, description: "Mode of transport: 'flight', 'train', or 'bus'", enum: ["flight", "train", "bus"] }
    },
    required: ["origin", "destination", "date"]
  }
};

const bookTripTool: FunctionDeclaration = {
  name: "book_trip",
  description: "Book a specific trip option for a passenger.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tripId: { type: Type.STRING, description: "The ID of the trip to book" },
      passengerName: { type: Type.STRING, description: "Full name of the passenger" },
      // We ask the model to pass back context details so our mock can reconstruct the ticket
      mode: { type: Type.STRING, description: "Transport mode" },
      operator: { type: Type.STRING },
      departureTime: { type: Type.STRING },
      price: { type: Type.STRING },
      origin: { type: Type.STRING },
      destination: { type: Type.STRING },
      date: { type: Type.STRING },
    },
    required: ["tripId", "passengerName"]
  }
};

const tools: Tool[] = [
  { googleSearch: {} },
  { googleMaps: {} },
  { functionDeclarations: [searchTripsTool, bookTripTool] }
];

let chatSession: Chat | null = null;

export const initializeChat = (modelName: string = 'gemini-2.5-flash') => {
  chatSession = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools,
    },
  });
  return chatSession;
};

// Recursive function to handle function calls within the stream
async function* processStreamResponse(
  stream: AsyncGenerator<GenerateContentResponse, void, unknown>
): AsyncGenerator<GenerateContentResponse, void, unknown> {
  
  let functionCallPart: any = null;
  let fullResponse: GenerateContentResponse | null = null;

  for await (const chunk of stream) {
    fullResponse = chunk; // Keep track of the latest chunk/response object
    
    // Check if there are function calls in this chunk or aggregated candidates
    // usage: chunk.candidates[0].content.parts[0].functionCall
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.functionCall) {
          functionCallPart = part.functionCall;
          break; // Found a function call
        }
      }
    }

    // Only yield text chunks to the UI to avoid showing raw function call JSON
    if (!functionCallPart) {
        yield chunk;
    }
  }

  // If a function call was detected, execute it and recurse
  if (functionCallPart && chatSession) {
    console.log("Function Call Detected:", functionCallPart.name, functionCallPart.args);
    
    let result: any;
    try {
        if (functionCallPart.name === 'search_trips') {
            const { origin, destination, date, mode } = functionCallPart.args;
            result = await searchTrips(origin, destination, date, mode || 'flight');
        } else if (functionCallPart.name === 'book_trip') {
            const { tripId, passengerName, ...details } = functionCallPart.args;
            result = await bookTrip(tripId, passengerName, details);
        } else {
            result = { error: "Unknown function" };
        }
    } catch (e) {
        console.error("Tool execution failed", e);
        result = { error: "Failed to execute tool" };
    }

    console.log("Function Result:", result);

    // Send the result back to the model
    // The model needs the function response to proceed
    const nextStream = await chatSession.sendMessageStream({
      message: [{
        functionResponse: {
          name: functionCallPart.name,
          response: { result: result } 
        }
      }]
    });

    // Recurse to process the model's reaction to the tool output
    yield* processStreamResponse(nextStream);
  }
}

export const sendMessageStream = async (
  message: string,
  location?: GeoLocation
): Promise<AsyncGenerator<GenerateContentResponse, void, unknown>> => {
  if (!chatSession) {
    initializeChat();
  }

  try {
    const resultStream = await chatSession!.sendMessageStream({
      message: message
    });
    
    // Wrap the stream to handle function calling loops transparently
    return processStreamResponse(resultStream);

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const createLocationAwareSession = (location: GeoLocation) => {
   chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools,
      toolConfig: {
        retrievalConfig: {
            latLng: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        }
      }
    },
  });
  return chatSession;
}