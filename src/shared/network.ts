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

interface ServerToClientEvents {}

interface ClientToServerFunctions {}

interface ServerToClientFunctions {}

export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();
export const GlobalFunctions = Networking.createFunction<ClientToServerFunctions, ServerToClientFunctions>();
