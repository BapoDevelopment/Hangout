import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { ProfileStoreService } from "./ProfileStoreService";

@Service()
export class DataService implements OnStart{

    constructor(private profileStoreService: ProfileStoreService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise DataService");

        this.logger.Info("Initialised DataService");
    }

    public addCash(player: Player, amount: number): boolean {
        return this.profileStoreService.increaseProfileField(player, "Cash", amount, true);
    }

    public subCash(player: Player, amount: number): boolean {
        return this.profileStoreService.decreaseProfileField(player, "Cash", amount, true);
    }

    public getCash(player: Player): number {
        const value: number | undefined = this.profileStoreService.getProfileField(player, "Cash");
        return value ? value : 0;
    }
}