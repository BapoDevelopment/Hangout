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
        this.roomGenerationService.generateInitialRooms();

        this.logger.Info("Initialised Game");
    }

    public onDoorOpened(): void {
        const roomCounter: number = this.roomGenerationService.getRoomCounter();
        if(roomCounter === ServerSettings.GAME.LAST_ROOM) {
            this.roomGenerationService.generateRoom100();
        }else if(roomCounter < ServerSettings.GAME.TOTAL_ROOMS) {
            this.roomGenerationService.generateRoom();
        }
        this.roomGenerationService.checkAndDestroyOldRooms();
        this.roomGenerationService.blockLastDoor();
    }
}