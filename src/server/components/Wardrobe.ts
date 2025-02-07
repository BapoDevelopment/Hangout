import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services"
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";

enum WardrobeState {
    OPEN = "true",
    BLOCKED = "false"
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
    private playerInside: Player | undefined;
    private leaveWardrobeConnection: RBXScriptConnection | undefined;

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();
    }

    onStart(): void {
        this.leaveWardrobeConnection = Events.leaveWardrobe.connect((player) => {
            if(this.playerInside === player) {
                this.exitPlayer(player);
            }
        });
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

                tween.Completed.Connect(() => {
                    if(player.Character) {
                        player.Character.SetAttribute("InWardrobe", true);
                        this.playerInside = player;
                    }
                });
            });
        });

        //Play open Sound
        const openSound: Sound = this.instance.FindFirstChild("open") as Sound;
        this.audioService.playSound(openSound);
    }

    private exitPlayer(player: Player): void {
        //Check validty of action
        if(!player.Character) {
            this.state = WardrobeState.OPEN;
            this.playerInside = undefined;
            return;
        }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }
        player.Character.SetAttribute("InWardrobe", false);

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

        if(!player.Character) {
            this.state = WardrobeState.OPEN;
            this.playerInside = undefined;
            return;
        }

        //Move Player
        tweenInfo = new TweenInfo(0.18, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
        let humanoidTargetProperties = {
            CFrame: this.instance.Markers.Entrance.CFrame.mul(CFrame.Angles(0, math.rad(180), 0))
        }
        const playerTween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
        playerTween.Play();

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

            tween.Completed.Connect(() => {
                if(player.Character) {
                    this.state = WardrobeState.OPEN;
                    this.playerInside = undefined;
                    player.Character.SetAttribute("InWardrobe", false);
                }
            });
        });
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
        this.leaveWardrobeConnection?.Disconnect();
    }
}