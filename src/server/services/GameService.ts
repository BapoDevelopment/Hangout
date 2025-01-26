import { Service, OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "./RoomGenerationService";
import { ServerSettings } from "server/ServerSettings";

@Service()
export class GameService implements OnStart {
	private readonly START_ROOMS = 1000;
    private readonly TOTAL_ROOMS = 1000;
    private readonly MAX_ACTIVE_ROOMS = 1000;

    constructor(private roomGenerationService: RoomGenerationService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise Game");
        
        this.roomGenerationService.generateLobby();
        this.generateInitialRooms();

        this.logger.Info("Initialised Game");

        let count = 0
        let total = 10000

        for(let i = 1; i < total; i++) { 
            if(math.random() * 100 < ServerSettings.rooms.doorLockedProbability) {
                count = count + 1
            }
        }

        print("Erfolg: " + count)
        print("Prozentsatz: " + (count / total) * 100 + "%")
    }

    private generateInitialRooms() {
        for(let i = 0; i < this.START_ROOMS; i++) {
            this.roomGenerationService.generateRoom();
        }
    }
}