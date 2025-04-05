import { OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Cash } from "server/components/Items/Cash";
import { Events } from "server/network";
import { DataService } from "./DataService";

@Service()
export class CashService implements OnStart{
    constructor(private dataBaseService: DataService, private readonly logger: Logger) {}
    
    onStart(): void {
        this.logger.Debug("CashService initialised.")
    }

    public getCash(player: Player): number {
        return this.dataBaseService.getCash(player);
    }

    public collectedCoins(player: Player, cash: Cash): boolean {
        if(cash.instance.PrimaryPart !== undefined) {
            Events.ressources.collectedCoins(player, cash.attributes.Amount, cash.instance.PrimaryPart.Position);
        }
        return this.addCash(player, cash.attributes.Amount);
    }

    private addCash(player: Player, cash: number): boolean {
        return this.dataBaseService.addCash(player, cash);
    }
}
