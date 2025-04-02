import { OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Cash } from "server/components/Items/Cash";
import { Events } from "server/network";

@Service()
export class CashService implements OnStart{
    constructor(private readonly logger: Logger) {}
    
    onStart(): void {
        this.logger.Debug("CashService initialised.")
    }

    public collectedCoins(player: Player, cash: Cash) {
    if(cash.instance.PrimaryPart !== undefined) {
            Events.ressources.collectedCoins(player, cash.attributes.Amount, cash.instance.PrimaryPart.Position);
        } else {
            this.giveCash(player, cash.attributes.Amount);
        }
    }

    private giveCash(player: Player, cash: number) {
        Events.ressources.giveCoins(player, cash);
    }
}
