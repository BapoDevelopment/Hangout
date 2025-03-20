import { Service, OnStart, Dependency } from "@flamework/core";
import type { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "./RoomGenerationService";
import { ServerSettings } from "server/ServerSettings";
import { ReplicatedStorage } from "@rbxts/services";
import { Rush } from "server/components/Entities/RushMonster";
import { Components } from "@flamework/components";
import { IRoomAttributes, IRoomComponent, SuperRoom } from "server/components/Room/SuperRoom";

@Service()
export class GameService implements OnStart {

    constructor(private roomGenerationService: RoomGenerationService, private readonly logger: Logger) {}

    onStart(): void {
        this.logger.Info("Initialise Game");
        
        this.roomGenerationService.generateLobby();
        this.roomGenerationService.generateInitialRooms();

        this.logger.Info("Initialised Game");
    }

    public onDoorOpened(number: number, openedByPlayer: boolean): void {
        const roomCounter: number = this.roomGenerationService.getRoomCounter();
        if(roomCounter === ServerSettings.GAME.LAST_ROOM) {
            this.roomGenerationService.generateRoom100();
        }else if(roomCounter < ServerSettings.GAME.TOTAL_ROOMS) {
            this.roomGenerationService.generateRoom();
        }
        this.roomGenerationService.checkAndDestroyOldRooms();
        this.roomGenerationService.blockLastDoor();

        if(openedByPlayer) {
            this.spawnEntities(number);
        }
    }

    private spawnEntities(roomNumber: number): void {
        const rushSpawnRate: number = roomNumber < 50 ? ServerSettings.ENTITIES.RUSH.SPAWN_RATES_IN_PERCENT.BEFORE_ROOM_50 : ServerSettings.ENTITIES.RUSH.SPAWN_RATES_IN_PERCENT.AFTER_ROOM_50;
        if(math.random() * 100 <= rushSpawnRate) {
            this.spawnRush(roomNumber);
        }
    }

    private spawnRush(roomNumber: number): void {
        let rushModel: Model = ReplicatedStorage.Monsters.Rush.Clone();
        rushModel.Parent = game.Workspace;
        const components = Dependency<Components>();
        components.waitForComponent<Rush>(rushModel).then((rush) => {
            let rooms: SuperRoom<IRoomAttributes, IRoomComponent>[] = new Array<SuperRoom<IRoomAttributes, IRoomComponent>>();
            for(let i=0; i < ServerSettings.ENTITIES.RUSH.SPAWN_N_ROOMS_BEFORE + ServerSettings.ENTITIES.RUSH.MOVE_THROUGHT_N_ROOMS_FROM; i++) {
                const room: SuperRoom<IRoomAttributes, IRoomComponent> | undefined = this.roomGenerationService.getRoom((roomNumber - ServerSettings.ENTITIES.RUSH.SPAWN_N_ROOMS_BEFORE) + i);
                if(room) {
                    rooms.push(room);
                }
            }
            const currentRoom: SuperRoom<IRoomAttributes, IRoomComponent> | undefined = this.roomGenerationService.getRoom(roomNumber + 1);
            if(currentRoom) {
                currentRoom.flickerLamps();
            };
            rush.spawn(rooms);
        });
    }
}