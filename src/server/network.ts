import { Networking } from "@flamework/networking";
import { GlobalEvents, GlobalFunctions } from "shared/network";
import { ServerSettings } from "./ServerSettings";

const rateLimits = new Map<Player, { count: number; lastReset: number }>();

function rateLimiter<I extends Array<unknown>>(): Networking.EventMiddleware<I> {

	return (processNext, event) => {
		print("Loaded middleware for", event.name);
        return (player, ...args) => {
            if(!player) { return; }
            const now = tick();
            const limitData = rateLimits.get(player) ?? { count: 0, lastReset: now };

            // If more than a second is proceeded, then the counter will be reseted
            if (now - limitData.lastReset >= ServerSettings.RATE_LIMITS.FLASHLIGHT.UN_EQUIP) {
                limitData.count = 0;
                limitData.lastReset = now;
            }

            // Increase the counter and check if the player is over the limit
            limitData.count += 1;
            rateLimits.set(player, limitData);
            if (limitData.count > 1) {
                print(`Player ${player.Name} triggered the event ${event.name} too quickly and has been blocked.`);
                return;
            }

            processNext(player, ...args);
        };
	};
}

export const Events = GlobalEvents.createServer({
	middleware: {
		items: {
            flashlight: {
                clickedEvent: [rateLimiter()],
            },
        },
	}
});
export const Functions = GlobalFunctions.createServer({});
