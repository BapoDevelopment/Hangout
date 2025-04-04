import { Networking } from "@flamework/networking";
interface ClientToServerEvents {
    leaveWardrobe(): void;
    leaveBed(): void;

    items: {
        flashlight: {
            clickedEvent(): void;
        },
        lighter: {
            clickedEvent(): void;
        },
        vitamins: {
            clickedEvent(): void;
        }
    }
}

interface ServerToClientEvents {
    ressources: {
        collectedCoins(amount: number, pos: Vector3): void;
        setCash(amount: number): void;
    }
}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
