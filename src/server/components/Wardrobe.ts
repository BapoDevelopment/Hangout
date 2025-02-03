import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services"
import { AudioService } from "server/services/AudioService";

enum WardrobeState {
    OPEN = "true",
    BLOCKED = "false",
}

interface IWardrobeComponent extends Instance {
    open: Sound;
    Primary: Part & {
        Toggle: Attachment;
    };
    Build: Model & {
        Doors: Model & {
            Left: Model,
            Right: Model,
        };
    };
    Markers: Model & {
        Entrance: Part,
        Spot: Part,
    }
}

@Component({
    tag: "Wardrobe",
})
export class Wardrobe extends BaseComponent <{}, IWardrobeComponent> implements OnStart {

    private state: WardrobeState = WardrobeState.OPEN;

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();
    }

    onStart(): void {
        this.createProximityPromt();
    }

    private createProximityPromt(): void {
        const promt = new Instance("ProximityPrompt");
        promt.ActionText = "Enter";
        promt.MaxActivationDistance = 5;
        promt.Parent = this.instance.Primary.Toggle;

        promt.Triggered.Connect((player) => {
            this.open(player);
        });
    }

    private open(player: Player): void {
        //Check validty of action
        if(this.state === WardrobeState.BLOCKED) { return; }
        if(!player.Character) { return; }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }
        this.state = WardrobeState.BLOCKED;

        let leftDoor: Model = this.instance.Build.Doors.Left;
        let rightDoor: Model = this.instance.Build.Doors.Right;
        if(!leftDoor.PrimaryPart) { return; }
        if(!rightDoor.PrimaryPart) { return; }

        //Open wardrobe
        let tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        let targetProperties = {
            CFrame: leftDoor.PrimaryPart.CFrame.mul(new CFrame(2.5, 0, 0))
        }
        let tween = TweenService.Create(leftDoor.PrimaryPart, tweenInfo, targetProperties);
        tween.Play();

        targetProperties = {
            CFrame: rightDoor.PrimaryPart.CFrame.mul(new CFrame(-2.5, 0, 0))
        }
        tween = TweenService.Create(rightDoor.PrimaryPart, tweenInfo, targetProperties);
        tween.Play();

        //Move Player
        tweenInfo = new TweenInfo(0.18, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
        let humanoidTargetProperties = {
            CFrame: this.instance.Markers.Entrance.CFrame
        }
        tween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
        tween.Play();
        tween.Completed.Connect(() => {
            tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
            let humanoidTargetProperties = {
                CFrame: this.instance.Markers.Spot.CFrame
            }
            tween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
            tween.Play();

            // Close wardrobe
            tween.Completed.Connect(() => {
                let leftDoor: Model = this.instance.Build.Doors.Left;
                let rightDoor: Model = this.instance.Build.Doors.Right;
                if(!leftDoor.PrimaryPart) { return; }
                if(!rightDoor.PrimaryPart) { return; }

                tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
                targetProperties = {
                    CFrame: leftDoor.PrimaryPart.CFrame.mul(new CFrame(-2.5, 0, 0))
                }
                tween = TweenService.Create(leftDoor.PrimaryPart, tweenInfo, targetProperties);
                tween.Play();
        
                targetProperties = {
                    CFrame: rightDoor.PrimaryPart.CFrame.mul(new CFrame(2.5, 0, 0))
                }
                tween = TweenService.Create(rightDoor.PrimaryPart, tweenInfo, targetProperties);
                tween.Play();
            });
        });

        //Play open Sound
        const openSound: Sound = this.instance.FindFirstChild("open") as Sound;
        this.audioService.playSound(openSound);
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}