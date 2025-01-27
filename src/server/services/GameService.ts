import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "./RoomGenerationService";
import { ServerSettings } from "server/ServerSettings";

@Service()
export class GameService implements OnStart {

    constructor(private roomGenerationService: RoomGenerationService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise Game");
        
        this.roomGenerationService.generateLobby();
        this.generateInitialRooms();

        this.logger.Info("Initialised Game");
    }

    private generateInitialRooms() {
        for(let i = 0; i < ServerSettings.GAME.START_ROOMS; i++) {
            this.roomGenerationService.generateRoom();
        }
    }
}