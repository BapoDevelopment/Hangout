import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "./RoomGenerationService";

@Service()
export class GameService implements OnStart {

    constructor(private roomGenerationService: RoomGenerationService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise Game");
        
        this.roomGenerationService.generateLobby();
        this.roomGenerationService.generateInitialRooms();

        this.logger.Info("Initialised Game");
    }
}