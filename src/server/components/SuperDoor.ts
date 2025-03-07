import { BaseComponent } from "@flamework/components/out/baseComponent";
import { Component } from "@flamework/components/out/components";
import { OnStart } from "@flamework/core/out/flamework";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services";
import { DoorState } from "server/Enum/DoorState";
import { AudioService } from "server/services/AudioService";
import { GameService } from "server/services/GameService";

export interface IDoorComponent extends Instance {
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

export interface IDoorAttributes {
    Number: number;
}

@Component()
export class SuperDoor<A extends IDoorAttributes, I extends IDoorComponent> extends BaseComponent<A, I> implements OnStart {
    
    protected state: DoorState = DoorState.UNOPEN;
    protected gameService: GameService | undefined;
    protected audioService: AudioService | undefined;
    protected readonly logger: Logger | undefined;

    onStart(): void {}

    public setNumber(number: number): void {
        this.attributes.Number = number;
        let prefix: string = "";

        if(this.attributes.Number < 10) {
            prefix = "00";
        } else if (this.attributes.Number >= 10 && this.attributes.Number < 100) {
            prefix = "0";
        }
        
        this.instance.Build.Leaf.Sign.SurfaceGui.TextLabel.Text = prefix + tostring(this.attributes.Number);
    }

    public openByRush() {
        this.openDoor();
        if(this.logger) { this.logger.Debug("Rush opened Door " + tostring(this.attributes.Number)); }
    }

    protected openByPlayer(player: Player) {
        this.openDoor();
        if(this.logger) { this.logger.Debug(tostring(player) + " opened Door " + tostring(this.attributes.Number)); }
    }

    private openDoor() {
        if(this.state === DoorState.OPEN) {
            this.logger?.Warn("Door already opened.");
            return;
        }
        this.state = DoorState.OPEN;

        const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const targetProperties = {
            CFrame: this.instance.Hinge.CFrame.mul(CFrame.Angles(0, 9, 0))
        }
        const tween = TweenService.Create(this.instance.Hinge, tweenInfo, targetProperties);
        tween.Play();
        
        if(this.audioService) { this.audioService.playSound(this.instance.open); }
        if(this.gameService) { this.gameService.onDoorOpened(this.attributes.Number); }
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}