import { Component, BaseComponent } from "@flamework/components";
import { Zone } from "@rbxts/zone-plus";
import { TweenService } from "@rbxts/services";
import { Flamework, OnStart } from "@flamework/core";
import { AudioService } from "server/services/AudioService";
import { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "server/services/RoomGenerationService";

enum DoorState {
    UNOPEN = "UNOPEN",
    LOCKED = "LOCKED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    BLURRED = "BLURRED",
}

interface IDoorComponent extends Instance {
    SensorPart: Part;
    PrimaryPart: Part;
    Hinge: Part & {
        WeldConstraint: WeldConstraint;
    };
    Build: Instance & {
        Leaf: Instance & {
            Sign: Part & {
                SurfaceGui: SurfaceGui & {
                    TextLabel: TextLabel;
                };
            };
        };
    };
    open: Sound;
}
const instanceGuard = Flamework.createGuard<IDoorComponent>();

interface IDoorAttributes {
    Number: number;
}

@Component({
    tag: "Door",
    instanceGuard: instanceGuard,
})
export class Door extends BaseComponent <IDoorAttributes, IDoorComponent> implements OnStart {

    private state: DoorState = DoorState.UNOPEN;

    constructor(private roomGenerationService: RoomGenerationService
        , private audioService: AudioService
        , private readonly logger: Logger) {
        super();
    }

    onStart() {
        const doorModel = this.instance;

        if(doorModel) {
            if (doorModel.IsA("Model")) {
                const sensorZone = new Zone(this.instance.SensorPart);
                sensorZone.playerEntered.Connect((player: Player) => this.handleSensor(player));
            } else {
                this.logger.Warn("The tagged Door is not a Model!");
            }
        } else {
            this.logger.Warn("Door Model not initiliased.");
        }
    }
    
    public setNumber(Number: number): void {
        this.attributes.Number = Number;
        let prefix: string = "";

        if(this.attributes.Number < 10) {
            prefix = "00";
        } else if (this.attributes.Number >= 10 && this.attributes.Number < 100) {
            prefix = "0";
        }

        this.instance.Build.Leaf.Sign.SurfaceGui.TextLabel.Text = prefix + tostring(this.attributes.Number);
    }

    private handleSensor(player: Player) {
        if (this.state === DoorState.UNOPEN) {
            this.state = DoorState.OPEN;
            this.logger.Debug(tostring(player) + " opened Door " + tostring(this.attributes.Number));
            const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
            const targetProperties = {
                CFrame: this.instance.Hinge.CFrame.mul(CFrame.Angles(0, 9, 0))
            }
            const tween = TweenService.Create(this.instance.Hinge, tweenInfo, targetProperties);
            
            tween.Play();
            this.audioService.playSound(this.instance.open);
            
            this.roomGenerationService.generateNextRoom();
        }
    }
}