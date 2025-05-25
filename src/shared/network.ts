import { Networking } from "@flamework/networking";
interface ClientToServerEvents {
    punch(): void;
    collectMoney(money: Part): void;
}

interface ServerToClientEvents {
    spawnedMoney(money: Part[]): void;
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
