import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Players, TweenService } from "@rbxts/services"
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";
import { CollisionGroupService } from "server/services/CollisionGroupService";
import { SharedSettings } from "shared/SharedSettings";

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
            Left: Model & {
                Leaf: Part,
            },
            Right: Model & {
                Leaf: Part,
            },
        };
    };
    Markers: Model & {
        Entrance: Part,
        Spot: Part,
    };
    Blocker: Part;
}

@Component({
    tag: "Wardrobe",
})
export class Wardrobe extends BaseComponent <{}, IWardrobeComponent> implements OnStart {

    private state: WardrobeState = WardrobeState.OPEN;
    private playerInside: Player | undefined;
    private leaveWardrobeConnection: RBXScriptConnection | undefined;
    private characterLeaveWardrobeConnection: RBXScriptConnection | undefined;
    private openPromt: ProximityPrompt | undefined;
    private openPromtConnection: RBXScriptConnection | undefined;
    private leftDoorDefaultPosition: CFrame | undefined;
    private rightDoorDefaultPosition: CFrame | undefined;

    constructor(private audioService: AudioService, private collisionGroupService: CollisionGroupService, private readonly logger: Logger) {
        super();
    }

    onStart(): void {
        this.leftDoorDefaultPosition = this.instance.Build.Doors.Left.Leaf.CFrame;
        this.rightDoorDefaultPosition = this.instance.Build.Doors.Right.Leaf.CFrame;

        this.leaveWardrobeConnection = Events.leaveWardrobe.connect((player) => {
            if(this.playerInside === player) {
                this.exitPlayer(player);
            }
        });
        this.createProximityPromt();
    }

    private createProximityPromt(): void {
        this.openPromt = new Instance("ProximityPrompt");
        this.openPromt.ActionText = "Enter";
        this.openPromt.MaxActivationDistance = 5;
        this.openPromt.Parent = this.instance.Primary.Toggle;

        this.openPromtConnection = this.openPromt.Triggered.Connect((player) => {
            this.open(player);
        });
    }

    private destroyProximityPromt(): void {
        this.openPromt?.Destroy();
        this.openPromtConnection?.Disconnect();
    }

    private open(player: Player): void {
        //Check validty of action
        if(this.state === WardrobeState.BLOCKED) { return; }
        if(!player.Character) { return; }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }

        this.state = WardrobeState.BLOCKED;
        this.destroyProximityPromt();
        player.Character.SetAttribute("InWardrobe", true);
        this.playerInside = player;
        this.collisionGroupService.setCollisionGroup(player.Character, "Wardrobe");
        this.characterLeaveWardrobeConnection = player.CharacterRemoving.Connect(() => {
            if(player === this.playerInside) {
                this.state = WardrobeState.OPEN;
                this.playerInside = undefined;
                this.createProximityPromt();
                this.closeWardrobe();
            }
        });

        const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
        if(humanoid) {
            humanoid.WalkSpeed = 0;
        }
        Events.playAnimationID(player, SharedSettings.ANIMATIONS.WARDROBE.ENTER);

        this.openWardrobe();

        //Play open Sound
        const openSound: Sound = this.instance.FindFirstChild("open") as Sound;
        this.audioService.playSound(openSound);

        //Move Player
        const playerMovedToEntrance: RBXScriptSignal | undefined = this.movePlayerToEntrance(player.Character);
        if(playerMovedToEntrance === undefined) { this.closeWardrobe(); return; }
        playerMovedToEntrance.Connect(() => {
            if(!player.Character) { this.closeWardrobe(); return; }

            const playerMovedToSpot: RBXScriptSignal | undefined = this.movePlayerToSpot(player.Character);
            if(playerMovedToSpot === undefined) { this.closeWardrobe(); return; }

            // Close wardrobe
            playerMovedToSpot.Connect(() => {
                this.closeWardrobe();
                
                if(player.Character) {
                    this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                }
            });
        });
    }

    private exitPlayer(player: Player): void {
        //Check validty of action
        if(this.state === WardrobeState.OPEN) { return; }
        if(!player.Character) { return; }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }

        this.characterLeaveWardrobeConnection?.Disconnect();

        this.collisionGroupService.setCollisionGroup(player.Character, "Wardrobe");
        Events.playAnimationID(player, SharedSettings.ANIMATIONS.WARDROBE.ENTER);

        this.openWardrobe();

        //Play open Sound
        const openSound: Sound = this.instance.FindFirstChild("open") as Sound;
        this.audioService.playSound(openSound);

        //Move Player
        const playerMovedToSpot: RBXScriptSignal | undefined = this.movePlayerToSpot(player.Character);
        if(playerMovedToSpot === undefined) { this.closeWardrobe(); return; }
        playerMovedToSpot.Connect(() => {
            if(!player.Character) { this.closeWardrobe(); return; }

            const playerMovedToEntrance: RBXScriptSignal | undefined = this.movePlayerToExit(player.Character);
            if(playerMovedToEntrance === undefined) { this.closeWardrobe(); return; }

            // Close wardrobe
            playerMovedToEntrance.Connect(() => {
                this.closeWardrobe();
                
                if(player.Character) {
                    this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                    const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
                    if(humanoid) {
                        humanoid.WalkSpeed = 96;
                    }
                }
            });
        });

        this.state = WardrobeState.OPEN;
        player.Character.SetAttribute("InWardrobe", false);
        this.playerInside = undefined;
        this.createProximityPromt();
    }

    private openWardrobe(): void {
        this.openLeftDoor();
        this.openRightDoor();
    }

    private closeWardrobe(): void {
        this.closeLeftDoor();
        this.closeRightDoor();
    }

    private openLeftDoor(): void {
        let leftDoor: Model = this.instance.Build.Doors.Left;
        if(!leftDoor.PrimaryPart) { return; }
        let tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        let targetProperties = {
            CFrame: this.leftDoorDefaultPosition?.mul(new CFrame(2.5, 0, 0))
        }
        let tween = TweenService.Create(leftDoor.PrimaryPart, tweenInfo, targetProperties);
        tween.Play();        
    }

    private openRightDoor(): void {
        let rightDoor: Model = this.instance.Build.Doors.Right;
        if(!rightDoor.PrimaryPart) { return; }
        let tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        let targetProperties = {
            CFrame: this.rightDoorDefaultPosition?.mul(new CFrame(-2.5, 0, 0))
        }
        let tween = TweenService.Create(rightDoor.PrimaryPart, tweenInfo, targetProperties);
        tween.Play();
    }

    private closeLeftDoor(): RBXScriptSignal | undefined {
        let leftDoor: Model = this.instance.Build.Doors.Left;
        if(!leftDoor.PrimaryPart) { return; }
        let tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        let targetProperties = {
            CFrame: this.leftDoorDefaultPosition
        }
        let tween = TweenService.Create(leftDoor.PrimaryPart, tweenInfo, targetProperties);
        tween.Play();
        return tween.Completed;  
    }

    private closeRightDoor(): RBXScriptSignal | undefined {
        let rightDoor: Model = this.instance.Build.Doors.Right;
        if(!rightDoor.PrimaryPart) { return; }
        let tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        let targetProperties = {
            CFrame: this.rightDoorDefaultPosition
        }
        let tween = TweenService.Create(rightDoor.PrimaryPart, tweenInfo, targetProperties);
        tween.Play();
        return tween.Completed;
    }

    private movePlayerToEntrance(character: Model): RBXScriptSignal {
        let tweenInfo = new TweenInfo(0.18, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const humanoidRootPart: Part | undefined = character.FindFirstChild("HumanoidRootPart") as Part;
        let humanoidTargetProperties = {
            CFrame: this.instance.Markers.Entrance.CFrame
        }
        let tween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
        tween.Play();
        return tween.Completed;
    }

    private movePlayerToExit(character: Model): RBXScriptSignal {
        let tweenInfo = new TweenInfo(0.18, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const humanoidRootPart: Part | undefined = character.FindFirstChild("HumanoidRootPart") as Part;
        let humanoidTargetProperties = {
            CFrame: this.instance.Markers.Entrance.CFrame.mul(CFrame.Angles(0, math.rad(180), 0))
        }
        let tween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
        tween.Play();
        return tween.Completed;
    }

    private movePlayerToSpot(character: Model): RBXScriptSignal | undefined {
        let tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const humanoidRootPart: Part | undefined = character.FindFirstChild("HumanoidRootPart") as Part;
        let humanoidTargetProperties = {
            CFrame: this.instance.Markers.Spot.CFrame
        }
        let tween = TweenService.Create(humanoidRootPart, tweenInfo, humanoidTargetProperties);
        tween.Play();
        return tween.Completed;
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
        this.leaveWardrobeConnection?.Disconnect();
        this.characterLeaveWardrobeConnection?.Disconnect();
    }
}