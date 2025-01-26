import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "./RoomGenerationService";

@Service()
export class GameService implements OnStart {
	private readonly START_ROOMS = 10;
    private readonly TOTAL_ROOMS = 100;
    private readonly MAX_ACTIVE_ROOMS = 10;

    constructor(private roomGenerationService: RoomGenerationService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise Game");
        
        this.roomGenerationService.generateLobby();
        this.generateInitialRooms();

        this.logger.Info("Initialised Game");
    }

    private generateInitialRooms() {
        for(let i = 0; i < this.START_ROOMS; i++) {
            this.roomGenerationService.generateRoom();
        }
    }
}