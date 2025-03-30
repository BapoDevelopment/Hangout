import { Service, Dependency } from "@flamework/core";
import { ServerStorage, Workspace } from "@rbxts/services";
import { roomInfos } from "./RoomInfos";
import { Components } from "@flamework/components";
import { Room } from "server/components/Room/Room";
import type { Logger } from "@rbxts/log/out/Logger";
import { VoidMonster } from "server/services/VoidMonster";
import { RoomService } from "./RoomService";
import { Lobby } from "server/components/Room/Lobby";
import { IRoomAttributes, IRoomComponent, SuperRoom } from "server/components/Room/SuperRoom";
import { ServerSettings } from "server/ServerSettings";

@Service()
export class RoomGenerationService {
	private components = Dependency<Components>();
	private roomCunter: number = 0;
	private activeRooms: SuperRoom<IRoomAttributes, IRoomComponent>[] = [];
	private lastTurnDirection = math.random() < 0.5 ? "LEFT" : "RIGHT";	
	private YDimensionShift = 50;

	constructor(private roomService: RoomService, private voidMonster: VoidMonster, private readonly logger: Logger) {}

	public generateLobby(): void {
		let lobbyModel = ServerStorage.Rooms.Necessary.Lobby.Clone();
		lobbyModel.Parent = Workspace;
		const lobbyComponent: Lobby = this.components.addComponent<Lobby>(lobbyModel);
		this.activeRooms.push(lobbyComponent);
	}
	
	public generateInitialRooms() {
		for(let i = 0; i < ServerSettings.GAME.START_ROOMS; i++) {
			this.generateRoom();
		}
	}

	public generateRoom(): Room {
		let previousRoom = this.activeRooms[this.activeRooms.size() - 1];
		// Create Room Model
		let roomModel: Model = this.getRandomRoomModel() as Model;
		roomModel.PivotTo(previousRoom.instance.Markers.Exit.CFrame);
		roomModel.Name = tostring(this.roomCunter);
		roomModel.Parent = Workspace;
		
		if(this.isRoomColliding(roomModel)) {
			this.solveOverlapping(roomModel);
		}
		
		// Create Room Component
		let roomComponent: Room = this.components.addComponent<Room>(roomModel);
		roomComponent.setNumber(this.roomCunter);
		this.roomService.furniture(roomComponent);
		this.roomService.addRandomItems(roomComponent);
		if(roomComponent.isLocked() === false) {
			this.roomService.addRegularDoor(roomComponent);
		}
		roomComponent.setNumber(this.roomCunter);

		this.activeRooms.push(roomComponent);

		this.roomCunter += 1;
		return roomComponent;
	}

	public getRoomCounter(): number {
		return this.roomCunter;
	}

	public generateRoom100(): void {
		this.logger.Info("Generating Room 100.");

		let previousRoom = this.activeRooms[this.activeRooms.size() - 1];
		const room100: Model = ServerStorage.Rooms.Necessary.Room100.Clone();
		room100.PivotTo(previousRoom.instance.Markers.Exit.CFrame);
		room100.Parent = Workspace;
		this.roomCunter += 1;
	}

	private getRandomRoomModel(): Model {
		let totalWeight: number = 0;
		for (let i = 0; i < roomInfos.size(); i++) {
			totalWeight += roomInfos[i].weight;
		}

		const randomWeight: number = math.random(0, totalWeight);
		let currentWeight: number = 0;
		let randomRoom: Model = ServerStorage.Rooms.Regular.Room1;
		for (let i = 1; i < roomInfos.size(); i++) {
			currentWeight += roomInfos[i].weight;
			if (randomWeight <= currentWeight) {
				randomRoom =ServerStorage.Rooms.Regular.GetChildren()[i - 1] as Model;
				break;
			}
		}

		let direction = roomInfos.filter(room => room.name === randomRoom.Name)[0].direction;
		let hasStairs = roomInfos.filter(room => room.name === randomRoom.Name)[0].stairs;
		let prevHasStairs = roomInfos.filter(room => room.name === randomRoom.Name)[0].stairs;

		if ((direction && direction === this.lastTurnDirection)
			|| (hasStairs && prevHasStairs)) {
				return this.getRandomRoomModel();
			} else {
				if (direction) {
					this.lastTurnDirection = direction;
				}

				return randomRoom.Clone();
			}
	}

	public checkAndDestroyOldRooms(): void {
		while (this.activeRooms.size() > ServerSettings.GAME.MAX_ACTIVE_ROOMS) {
			const oldestRoom: SuperRoom<IRoomAttributes, IRoomComponent> | undefined = this.activeRooms.shift();
			if (oldestRoom) {
				const players: Player[] | undefined = oldestRoom.getPlayers();
				if(players) {
					if(players.size() > 0) {
						this.voidMonster.attack(players, this.activeRooms);
					}
				}
				this.logger.Info(`Destroying room: ${oldestRoom.getName()}`);
				oldestRoom.destroy();
			}
		}
	}

	public blockLastDoor(): void {
		const oldestRoom: SuperRoom<IRoomAttributes, IRoomComponent> | undefined = this.activeRooms[0];
		assert(oldestRoom, "Unable to block last door, because there is no last room.");

		const blockedDoor: Model = ServerStorage.Doors.Blocked.Clone();
		
		const entranceMarker: Part = oldestRoom.instance.Markers.FindFirstChild("Entrance") as Part;
		if(entranceMarker) {
			blockedDoor.PivotTo(entranceMarker.CFrame);
			blockedDoor.Parent = oldestRoom.instance;
		}
	}

	private isRoomColliding(nextRoom: Model): boolean {
		let previousRoom = this.activeRooms[this.activeRooms.size() - 1];

		const [position, size] = nextRoom.GetBoundingBox();
		const boundingBox = new Instance("Part");
		boundingBox.Size = size;
		boundingBox.CFrame = position;
		boundingBox.Anchored = true;
		boundingBox.Transparency = 0.5;

		boundingBox.Parent = game.Workspace;

		const touchingParts = boundingBox.GetTouchingParts();

		let hasCollision = false;
	
		for (let i = 0; i < touchingParts.size(); i++) {
			const part = touchingParts[i];
			if (previousRoom.instance.GetDescendants().includes(part) === false && nextRoom.GetDescendants().includes(part) === false) {
				hasCollision = true;
				break;
			}
		}

		boundingBox.Destroy();
		return hasCollision;
	}
	
	private solveOverlapping(nextRoom: Model) {
		// change behaviour of door collision to glitch for the previous room
		this.logger.Info("Resolve room " + tostring(this.roomCunter));
		let PrimaryPart: BasePart = nextRoom.PrimaryPart as BasePart;
		nextRoom.PivotTo(PrimaryPart.CFrame.mul(new CFrame(0, this.YDimensionShift, 0)));
		this.YDimensionShift += 50;
	}

	public getRoom(number: number): SuperRoom<IRoomAttributes, IRoomComponent> | undefined {
		const rooms: SuperRoom<IRoomAttributes, IRoomComponent>[] | undefined = this.activeRooms.filter((room) => {
			if(room.attributes.Number === number) {
				return true;
			}
		});
		if(rooms) {
			return rooms[0];
		}
		return undefined;
	}
}