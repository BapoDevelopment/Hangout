import { OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Events } from "server/network";

@Service()
export class CashService implements OnStart{
    constructor(private readonly logger: Logger) {}
    
    onStart(): void {
        this.logger.Debug("CashService initialised.")
    }

    public collectedCoins(player: Player, cash: number) {
        this.giveCash(player, cash);
    }

    private giveCash(player: Player, cash: number) {
        Events.ressources.collectedCoins(player, cash);
    }
}
