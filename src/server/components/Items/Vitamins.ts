import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";
import { SharedSettings } from "shared/SharedSettings";

interface IVitaminsComponent extends IToolComponent {
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

interface IVitaminsAttributes extends IToolAttributes {}

@Component({
    tag: "Vitamins",
})
export class Vitamins extends AbstractToolBaseComponent<IVitaminsAttributes, IVitaminsComponent> implements OnStart{

    private activateConnection: RBXScriptConnection | undefined;

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.setStackable(ServerSettings.ITEMS.VITAMINS.STACKABLE);
    }
    
    onStart(): void {

    }


    protected onActivated(player: Player): void {
        if(!player) { return; }

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

        animationTrack.Play();

        animationTrack.KeyframeReached.Connect((keyframeName) => {
            if(keyframeName === "Pause") {
                animationTrack.AdjustSpeed(0);
            }
        });

        return animationTrack.Stopped;
    }

    destroy(): void {
        super.destroy();
        if(this.activateConnection) {
            this.activateConnection.Disconnect();
        }
    }
}