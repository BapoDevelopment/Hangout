import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { SuperRoom, IRoomAttributes, IRoomComponent } from "./Room/SuperRoom";
import { ServerSettings } from "server/ServerSettings";
import { CollectionService, RunService, Workspace } from "@rbxts/services";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "./SuperDoor";
import { AudioService } from "server/services/AudioService";

interface IRushComponent extends Model {
    Primary: Part & {
        Spawn: Sound;
        Despawn: Sound;
        Move: Sound;
        Attachment0: Attachment;
        LinearVelocity: LinearVelocity;
        ParticleEmitter: ParticleEmitter;
        BillboardGui: BillboardGui & {
            ImageLabel: ImageLabel;
        };
    };
}

@Component({
    tag: "Rush",
})
export class Rush extends BaseComponent<{}, IRushComponent> implements OnStart {

    private rooms: SuperRoom<IRoomAttributes, IRoomComponent>[];
    private roomCounter: number = 0;
    private waypointCounter: number = 0;
    private lerpConnection: RBXScriptConnection | undefined;

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();
        this.rooms = new Array<SuperRoom<IRoomAttributes, IRoomComponent>>();
    }

    onStart(): void {}

    public spawn(rooms: SuperRoom<IRoomAttributes, IRoomComponent>[]): void {
        if(!rooms) { return; }
        this.rooms = rooms;

        let firstWaypoint = this.getWaypoint(this.rooms[0], 1);
        if(!firstWaypoint) { return; }
        this.instance.PivotTo(firstWaypoint.CFrame);
        this.updateWaypointCounter();
        
        this.audioService.playSound(this.instance.Primary.Spawn);
        this.move();
        this.audioService.playSound(this.instance.Primary.Move);
    }

    private move(): void {
        if(this.roomCounter > ServerSettings.ENTITIES.RUSH.SPAWN_N_ROOMS_BEFORE + ServerSettings.ENTITIES.RUSH.MOVE_THROUGHT_N_ROOMS_FROM) { return; }

        const waypoint: BasePart | undefined = this.getWaypoint(this.rooms[this.roomCounter], this.waypointCounter);
        if(!waypoint) { return; }
        this.lerpConnection = this.lerpTo(waypoint);
    }

    private getWaypoint(room: SuperRoom<IRoomAttributes, IRoomComponent>, number: number): BasePart | undefined {
        const name = tostring(number);
        if(!room) { return; }
        const waypoints: Folder = room.getRushWaypoints();
        if(!waypoints) { return; }
        
        let firstWaypoint: BasePart | undefined;
        waypoints.GetChildren().forEach(waypoint => {
            if(waypoint.Name === name) {
                firstWaypoint = waypoint as BasePart;
            }
        });
        return firstWaypoint;
    }

    private lerpTo(target: BasePart): RBXScriptConnection | undefined {
        if(!this.instance.PrimaryPart || !target) { return; }
        if(!this.instance.PrimaryPart) { return; }

        let alpha: number = 0;
        let distance: number = this.instance.PrimaryPart.Position.sub(target.Position).Magnitude;
        let relativeSpeed = distance / ServerSettings.ENTITIES.RUSH.SPEED;
        let startPos = this.instance.PrimaryPart.CFrame;

        const connection: RBXScriptConnection = RunService.Heartbeat.Connect((delta) => {
            if(!this.instance.PrimaryPart) { return; }
            if(!target) { return; }

            const goalCFrame = startPos.Lerp(target.CFrame, alpha);
            this.instance.PrimaryPart.PivotTo(goalCFrame);
            alpha += delta / relativeSpeed;

            this.attack()

            if(alpha >= 1) {
                connection.Disconnect();
                this.updateWaypointCounter();
                this.move();
            }
        });

        return connection;
    }

    private attack(): void {
        const room: SuperRoom<IRoomAttributes, IRoomComponent> = this.rooms[this.roomCounter];
        if(!room) { return; }

        const players: Player[] | undefined = room.getPlayers();
        if(!players) { return; }
        players.forEach(player => {
            if(!player.Character) { return; }
            const to: Vector3 | undefined = player.Character.PrimaryPart?.Position as Vector3;
            if(!to) { return; }
            if(!this.instance.PrimaryPart) { return; }
            
            const from = this.instance.PrimaryPart.Position;
            const direction = to.sub(from);

            const raycastParams = new RaycastParams();
            raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
            raycastParams.FilterDescendantsInstances = CollectionService.GetTagged("IgnoreRush");;
        
            const result = Workspace.Raycast(from, direction, raycastParams);
            if(result && result.Instance.IsDescendantOf(player.Character)) {
                const humanoid: Humanoid |undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
                if(humanoid) {
                    const inWardrobe = player.Character.GetAttribute("InWardrobe") as boolean | undefined;
                    const underBed = player.Character.GetAttribute("UnderBed") as boolean | undefined;
                    if(inWardrobe !== true && underBed !== true) {
                        humanoid.TakeDamage(humanoid.Health);
                        this.logger.Debug("Rush killed player: " + tostring(player.Character) + " w: " + tostring(inWardrobe) + " b: " + tostring(underBed));
                    }
                }
            }
        });
    }

    private updateWaypointCounter(): void {
        this.waypointCounter++;
        if(this.waypointCounter > this.rooms[this.roomCounter].getRushWaypoints().GetChildren().size()) {
            this.roomCounter++;
            this.waypointCounter = 1;
            if(this.roomCounter < this.rooms.size()) {
                const door: SuperDoor<IDoorAttributes, IDoorComponent> | undefined = this.rooms[this.roomCounter].getDoor();
                if(door) {
                    door.openByRush();
                }
            } else {
                this.audioService.playSoundWithCallback(this.instance.Primary.Despawn, () => {
                    this.destroy();
                });
            }
        }
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
        if(this.lerpConnection) {
            this.lerpConnection.Disconnect();
        }
    }
}