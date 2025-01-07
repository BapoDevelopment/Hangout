import { Service, OnStart, Dependency } from "@flamework/core";
import { ServerStorage, Workspace } from "@rbxts/services";
import { roomInfos } from "./RoomInfos";
import { Components } from "@flamework/components";
import { Room } from "server/components/Room";
import type { Logger } from "@rbxts/log/out/Logger";
import { VoidMonster } from "server/services/VoidMonster";

@Service()
export class RoomGenerationService implements OnStart {
	private readonly ROOM_STORAGE = ServerStorage.WaitForChild("Rooms") as Folder;
	private readonly REGULAR_ROOM_STORAGE = this.ROOM_STORAGE.WaitForChild("Regular") as Folder;
	private readonly NECESSARY_ROOM_STORAGE = this.ROOM_STORAGE.WaitForChild("Necessary") as Folder;
	private readonly START_ROOMS = 3;
	private readonly MAX_ACTIVE_ROOMS = 5;
	private readonly MAX_ATTEMPTS = 10; // Max tries to generate a new room, before the old one is deleted

	private components = Dependency<Components>();
	private roomCunter: number = 0;
	private lobby: Model | undefined;
	private activeRooms: Model[] = [];
	private lastTurnDirection = math.random() < 0.5 ? "LEFT" : "RIGHT";	
	private YDimensionShift = 50;

	constructor(private voidMonster: VoidMonster, private readonly logger: Logger) {}

	onStart(): void {
		this.logger.Info("Generating Lobby and initial Rooms.");
		this.lobby = this.NECESSARY_ROOM_STORAGE.FindFirstChild("Lobby") as Model;
		this.lobby.Parent = Workspace;
		let previousRoom = this.lobby;
		this.generateInitialRooms(previousRoom);
		this.logger.Info("Lobby and initial Rooms Generation finished.");
	}

	private generateInitialRooms(previousRoom: Model) {
		let initialGeneratedRooms = 0;
		while(initialGeneratedRooms < this.START_ROOMS) {
			previousRoom = this.generateRoom(previousRoom, 0);
			initialGeneratedRooms++;
		}
	}

	private generateRoom(previousRoom: Model, attempt: number): Model {
		attempt += 1;
		const previousExit = previousRoom.WaitForChild("Markers").WaitForChild("Exit") as BasePart;

		let randomRoom: Model = this.getRandomRoom(previousRoom) as Model;

		// Move Room
		randomRoom.PivotTo(previousExit.CFrame);
		randomRoom.Name = tostring(this.roomCunter);
		randomRoom.Parent = Workspace;

		// Create Room Component
		let roomComponent: Room | undefined;
		roomComponent = this.components.getComponent<Room>(randomRoom);
		if(roomComponent) {
			roomComponent.setNumber(this.roomCunter);
			this.roomCunter += 1;			
		}
		this.components.onComponentAdded<Room>((value, instance) => {
			if(instance === randomRoom) {
				roomComponent = value;
				roomComponent.setNumber(this.roomCunter);
				this.roomCunter += 1;
			}
		});

		this.checkAndDestroyOldRooms();

		this.activeRooms.push(randomRoom);
		// Check for Collision
		if (this.isRoomColliding(previousRoom, randomRoom) === false) { // valid room
			return randomRoom;
		} else if(attempt < this.MAX_ATTEMPTS) { // try to generate a new one		
			this.logger.Info("Max regeneration attempts exceeded, destroying room.")	
			randomRoom.Destroy();
			this.roomCunter -= 1;
			this.activeRooms.pop();
			return this.generateRoom(previousRoom, attempt);
		} else { // if regeneration wont work, then move room in y dimension
			this.solveOverlapping(previousRoom, randomRoom);
			return randomRoom;
		}
	}

	public generateNextRoom(): Model {
		const lastRoom: Model = this.activeRooms[this.activeRooms.size() - 1]
		return this.generateRoom(lastRoom, 0);
	}

	private getRandomRoom(previousRoom: Model): Model {
		let totalWeight: number = 0;
		for (let i = 0; i < roomInfos.size(); i++) {
			totalWeight += roomInfos[i].weight;
		}

		const randomWeight: number = math.random(0, totalWeight);
		let currentWeight: number = 0;
		let randomRoom: Model = this.REGULAR_ROOM_STORAGE.FindFirstChild("Room1") as Model;
		for (let i = 1; i < roomInfos.size(); i++) {
			currentWeight += roomInfos[i].weight;
			if (randomWeight <= currentWeight) {
				randomRoom = this.REGULAR_ROOM_STORAGE.GetChildren()[i - 1] as Model;
				break;
			}
		}

		let direction = roomInfos.filter(room => room.name === randomRoom.Name)[0].direction;
		let hasStairs = roomInfos.filter(room => room.name === randomRoom.Name)[0].stairs;
		let prevHasStairs = roomInfos.filter(room => room.name === randomRoom.Name)[0].stairs;

		if ((previousRoom.Name === randomRoom.Name)
			|| (direction && direction === this.lastTurnDirection)
			|| (hasStairs && prevHasStairs)) {
				return this.getRandomRoom(previousRoom);
			} else {
				if (direction) {
					this.lastTurnDirection = direction;
				}

				return randomRoom.Clone();
			}
	}

	private checkAndDestroyOldRooms(): void {
		while (this.activeRooms.size() > this.MAX_ACTIVE_ROOMS) {
			const oldestRoom = this.activeRooms.shift();
			if (oldestRoom) {
				const players: Player[] | undefined = this.components.getComponent<Room>(oldestRoom)?.getPlayers();
				if(players) {
					this.voidMonster.attack(players, this.activeRooms);
				}
				this.logger.Info(`Destroying room: ${oldestRoom.Name}`);
				oldestRoom.Destroy();
			}
		}
		if(this.roomCunter > this.activeRooms.size() + 1 && !(this.lobby?.Parent === undefined)) {
			if(this.lobby) {
				this.lobby.Destroy();
			}
			this.logger.Debug("Destroyed Lobby.");
		}
	}

	private isRoomColliding(previousRoom: Model, nextRoom: Model): boolean {
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
			if (previousRoom.GetDescendants().includes(part) === false && nextRoom.GetDescendants().includes(part) === false) {
				hasCollision = true;
				break;
			}
		}

		boundingBox.Destroy();
		return hasCollision;
	}
	
	private solveOverlapping(previousRoom: Model, nextRoom: Model) {
		// change behaviour of door collision to glitch for the previous room
		this.logger.Info("Resolve room " + tostring(this.roomCunter));
		let PrimaryPart: BasePart = nextRoom.PrimaryPart as BasePart;
		nextRoom.PivotTo(PrimaryPart.CFrame.mul(new CFrame(0, this.YDimensionShift, 0)));
		this.YDimensionShift += 50;
	}
}