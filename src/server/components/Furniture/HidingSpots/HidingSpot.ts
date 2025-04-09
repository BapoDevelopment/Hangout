import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services";

export enum HidingSpotState {
    OPEN = "true",
    BLOCKED = "false"
}

export interface IHidingSpotComponent extends Instance {
    Primary: Part & {
        open: Sound;
    };
    Build: Model;
    Markers: Model & {
        Spot: Part,
    };
    Blocker: Part;
}

export interface IHidableAttributes {}

@Component()
export class HidingSpot<A extends IHidableAttributes, I extends IHidingSpotComponent> extends BaseComponent <A, I> implements OnStart {

    protected state: HidingSpotState = HidingSpotState.OPEN;
    protected playerInside: Player | undefined;
    protected leaveHidingSpotConnection: RBXScriptConnection | undefined;
    protected characterLeaveHidingConnection: RBXScriptConnection | undefined;
    protected openPromt: ProximityPrompt | undefined;
    protected openPromtConnection: RBXScriptConnection | undefined;
    protected readonly logger: Logger | undefined;
    protected obliterator = new Janitor();
    
    constructor() {
        super();
        this.obliterator.Add(this.instance);
    }

    onStart(): void {}
    
    protected createProximityPromt(parent: Attachment): void {
        this.openPromt = new Instance("ProximityPrompt");
        this.openPromt.ActionText = "Enter";
        this.openPromt.MaxActivationDistance = 5;
        this.openPromt.Parent = parent;
        this.obliterator.Add(this.openPromt);

        this.obliterator.Add(this.openPromtConnection = this.openPromt.Triggered.Connect((player) => {
            this.enterPlayer(player);
        }), "Disconnect");
    }

    protected destroyProximityPromt(): void {
        this.openPromt?.Destroy();
        this.openPromtConnection?.Disconnect();
    }

    protected enterPlayer(player: Player): void {
        if(this.logger) { this.logger.Warn("Calling enterPlayer() on HidingSpot.ts."); }
    }

    protected exitPlayer(player: Player): void {
        if(this.logger) { this.logger.Warn("Calling exitPlayer() on HidingSpot.ts."); }
    }

    protected moveCharacterToMarkerCFrame(character: Model, markerCFrame: CFrame, duration: number): RBXScriptSignal | undefined {
        let tweenInfo = new TweenInfo(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const humanoidRootPart: Part | undefined = character.FindFirstChild("HumanoidRootPart") as Part;
        let humanoidTargetProperties = {
            CFrame: markerCFrame
        }
        let tween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
        this.obliterator.Add(tween);
        tween.Play();
        return tween.Completed;
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
        this.obliterator.Cleanup();
    }
}