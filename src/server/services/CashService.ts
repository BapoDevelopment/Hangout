import { OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
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

    public addCash(player: Player, cash: number): boolean {
        return this.dataBaseService.addCash(player, cash);
    }
}
