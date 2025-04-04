import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { ProfileStoreService } from "./ProfileStoreService";
import { Players } from "@rbxts/services";

@Service()
export class DatabaseService {

    constructor(private profileStoreService: ProfileStoreService, private readonly logger: Logger) {}

    public addCash(player: Player, amount: number): boolean {
        return this.profileStoreService.increaseProfileField(player, "Cash", amount);
    }

    public subCash(player: Player, amount: number): boolean {
        return this.profileStoreService.decreaseProfileField(player, "Cash", amount);
    }

    public getCash(player: Player): number {
        const value: number | undefined = this.profileStoreService.getProfileField(player, "Cash");
        return value ? value : 0;
    }
}