import { Networking } from "@flamework/networking";

interface ClientToServerEvents {
    leaveWardrobe(): void;
    leaveBed(): void;
}

interface ServerToClientEvents {
    layDown(): void;
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
