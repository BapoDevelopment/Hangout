import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";

interface IFlashlightComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        SpotLight: SpotLight;
        Switch: Instance & {
            Sound: Sound;
            On: BasePart;
            Off: BasePart;
        };
    };
}

interface IFlashlightAttributes extends IToolAttributes {
    Battery: number;
    On: boolean;
}

@Component({
    tag: "Flashlight",
})
export class Flashlight extends AbstractToolBaseComponent<IFlashlightAttributes, IFlashlightComponent> implements OnStart{

    private activateConnection: RBXScriptConnection | undefined;
    private holder: Player | undefined;

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.obliterator.Add(this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        }), "Disconnect");

        this.setStackable(ServerSettings.ITEMS.TOOLS.FLASHLIGHT.STACKABLE);

        this.obliterator.Add(this.instance);
    }
    
    onStart(): void {}

    protected onProximityPromtActivated(player: Player): boolean {
        const flashlightEquipped: boolean = super.onProximityPromtActivated(player);
        if(!flashlightEquipped) { return false; }

        this.holder = player;

        this.activateConnection = Events.items.flashlight.clickedEvent.connect((player) => {
            this.logger.Info("recieved flashlgiht click");
            this.onActivated(player);
        });
        this.obliterator.Add(this.activateConnection, "Disconnect");

        return flashlightEquipped;
    }

    protected onActivated(player: Player): void {
        if(!player) { return; }

        if(!this.attributes.On) {
            this.turnOn(player);
        } else {
            this.turnOff(player);
        }
    }

    protected onUnequip(): void {
        if(this.holder) {
            this.turnOff(this.holder);
        }
    }

    private turnOn(player: Player): void {
        if(this.attributes.Battery <= 0) { return; }

        this.attributes.On = true;
        this.instance.Handle.SpotLight.Enabled = true;
        this.instance.Handle.Switch.On.Transparency = 0;
        this.instance.Handle.Switch.Off.Transparency = 1;        
        this.audioService.playSound(this.instance.Handle.Switch.Sound);
        this.drainBattery(player);

        //this.animate(player, SharedSettings.ANIMATIONS.ITEMS.FLASHLIGHT.ON);
    }

    private turnOff(player: Player): void {
        this.attributes.On = false;
        this.instance.Handle.SpotLight.Enabled = false;
        this.instance.Handle.Switch.On.Transparency = 1;
        this.instance.Handle.Switch.Off.Transparency = 0;        
        this.audioService.playSound(this.instance.Handle.Switch.Sound);

        //this.animate(player, SharedSettings.ANIMATIONS.ITEMS.FLASHLIGHT.OFF);
    }

    private drainBattery(player: Player): void {
        this.obliterator.Add(task.spawn(() => {
            while (this.attributes.On && this.attributes.Battery > 0) {
                this.attributes.Battery -= ServerSettings.ITEMS.TOOLS.FLASHLIGHT.BATTERY_DRAIN_PER_MILLISECOND;
                if (this.attributes.Battery <= 0) {
                    this.attributes.Battery = 0;
                    this.turnOff(player);
                    break;
                }
                task.wait(0.001); // 0.001 =^ 1 Millisecond
            }
        }));
    }

    private animate(player: Player, animationId: string): RBXScriptSignal | undefined {
        if(!player) { return; }
        if(!player.Character) { return; }
        
        const humanoid: Humanoid | undefined = player.Character.WaitForChild("Humanoid") as Humanoid;
        humanoid.GetPlayingAnimationTracks().forEach(track => {
            track.Stop();
        });
        
        let animation: Animation = new Instance("Animation");
        animation.AnimationId = animationId;
                
        const animator: Animator | undefined = humanoid.WaitForChild("Animator") as Animator;
        if(!animator) { return; }

        const animationTrack: AnimationTrack = animator.LoadAnimation(animation);
        this.obliterator.Add(animationTrack);

        animationTrack.Play();

        this.obliterator.Add(animationTrack.KeyframeReached.Connect((keyframeName) => {
            if(keyframeName === "Pause") {
                animationTrack.AdjustSpeed(0);
            }
        }), "Disconnect");

        return animationTrack.Stopped;
    }

    destroy(): void {
        super.destroy();
        this.obliterator.Cleanup();
    }
}