import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { Players } from "@rbxts/services";
import { Events } from "server/network";
import { DatabaseService } from "./DatabaseService";
import { CashService } from "./CashService";

@Service()
export class PlayerService implements OnStart {

    constructor(private cashService: CashService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise Game");

        Players.GetPlayers().forEach((player) => {
			task.spawn(() => {
				this.onPlayerAdded(player);
			})
		})

        Players.PlayerAdded.Connect((player) => {
            this.onPlayerAdded(player);
        });

        this.logger.Info("Initialised Game");
    }

    private onPlayerAdded(player: Player): void {
        this.sendGUIState(player);
    }

    private sendGUIState(player: Player): void {
        try {
            const cash: number = this.cashService.getCash(player);
            Events.ressources.setCash(player, cash);
            this.logger.Warn("Die Warnung soll nach dem laden des Profils kommen.");
        } catch (error) {
            this.logger.Error("PlayerService, sendGUIState: " + tostring(error));
        }
    }
}