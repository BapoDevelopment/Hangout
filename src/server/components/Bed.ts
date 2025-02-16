import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Players, TweenService } from "@rbxts/services"
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";
import { CollisionGroupService } from "server/services/CollisionGroupService";
import { SharedSettings } from "shared/SharedSettings";
import { HidingSpot, HidingSpotState, IHidingSpotComponent } from "./HidingSpot";

interface IBedComponent extends IHidingSpotComponent {
    open: Sound;
    Primary: Part & {
        FrontToggle: Attachment;
        LeftToggle: Attachment;
        RightToggle: Attachment;
    };
    Build: Model;
    Markers: Model & {
        Entrance: Model & {
            Front: Part;
            Left: Part;
            Right: Part;
        },
        Spot: Part & {
            ProximityPromtPosition: Attachment;
        }
    };
    Blocker: Part;
}

@Component({
    tag: "Bed",
})
export class Bed extends HidingSpot <{}, IBedComponent> implements OnStart {

    private exit: BasePart | undefined;

    constructor(private audioService: AudioService, private collisionGroupService: CollisionGroupService, protected readonly logger: Logger) {
        super();
    }

    onStart(): void {
        this.leaveHidingSpotConnection = Events.leaveBed.connect((player) => {
            if(this.playerInside === player) {
                this.exitPlayer(player);
            }
        });
        this.createProximityPromt(this.instance.Markers.Spot.ProximityPromtPosition);
    }

    protected enterPlayer(player: Player): void {
        //Check validty of action
        if(this.state === HidingSpotState.BLOCKED) { return; }
        if(!player.Character) { return; }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }

        this.state = HidingSpotState.BLOCKED;
        this.destroyProximityPromt();
        this.collisionGroupService.setCollisionGroup(player.Character, "Bed");
        this.characterLeaveHidingConnection = player.CharacterRemoving.Connect(() => {
            if(player === this.playerInside) {
                this.state = HidingSpotState.OPEN;
                this.playerInside = undefined;
                this.createProximityPromt(this.instance.Markers.Spot.ProximityPromtPosition);
            }
        });

        const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
        if(humanoid) {
            humanoid.WalkSpeed = 0;
        }
        Events.playAnimationID(player, SharedSettings.ANIMATIONS.BED.ENTER);

        //Play crouch Sound
        const crouchSound: Sound = this.instance.FindFirstChild("open") as Sound;
        this.audioService.playSound(crouchSound);

        //Move Player
        let nearestEntrance: BasePart | undefined = this.getNearestEntrance(this.instance.Markers.Entrance, player.Character);
        if(!nearestEntrance) {
           nearestEntrance = this.instance.Markers.Entrance.Front 
        }
        this.exit = nearestEntrance;
        const playerMovedToEntrance: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character,
            nearestEntrance.CFrame,
             0.46);
        if(playerMovedToEntrance === undefined) { return; }
        playerMovedToEntrance.Connect(() => {
            if(!player.Character) { return; }

            humanoid.ChangeState(Enum.HumanoidStateType.Physics);
            const moveToCFrame: CFrame = this.instance.Markers.Spot.CFrame.mul(CFrame.fromEulerAngles(math.rad(90), 0, 0));
            const playerMovedToSpot: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character, moveToCFrame, 0.5);
            if(playerMovedToSpot === undefined) { return; }

            // Close wardrobe
            playerMovedToSpot.Connect(() => {
                if(player.Character) {
                    const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
                    if(humanoidRootPart) {
                        //humanoidRootPart.Anchored = true;
                        
                    }
                    player.Character.SetAttribute("UnderBed", true);
                    this.playerInside = player;
                    this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                }
            });
        });
    }

    private applyBodyGyro(character: Model): void {
        const hrp = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
        this.logger.Info("A");
        if (hrp) {
            const gyro = new Instance("BodyGyro");
            gyro.MaxTorque = new Vector3(1e5, 1e5, 1e5);
            gyro.P = 3000;
            gyro.CFrame = hrp.CFrame.mul(CFrame.Angles(0, math.rad(180), 0));
            gyro.Parent = hrp;
            delay(0.5, () => {
                gyro.Destroy();
            });
            this.logger.Info("B");
        }
    }

    
    protected exitPlayer(player: Player): void {
        //Check validty of action
        if(this.state === HidingSpotState.OPEN) { return; }
        if(!player.Character) { return; }
        const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
        if(!humanoidRootPart) {
            return;
        }

        this.characterLeaveHidingConnection?.Disconnect();

        this.collisionGroupService.setCollisionGroup(player.Character, "Bed");
        Events.playAnimationID(player, SharedSettings.ANIMATIONS.BED.EXIT);

        //Play open Sound
        const crouchSound: Sound = this.instance.FindFirstChild("open") as Sound;
        this.audioService.playSound(crouchSound);

        //Move Player
        let exitTo: BasePart | undefined = this.exit;
        if(!exitTo) { exitTo = this.instance.Markers.Entrance.Front; }
        humanoidRootPart.Anchored = false;
        this.applyBodyGyro(player.Character);
        const playerMovedToEntrance: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character,
            exitTo.CFrame,
             0.46);
        if(playerMovedToEntrance === undefined) { return; }

        //Finsished moving
        playerMovedToEntrance.Connect(() => {
            if(player.Character) {
                this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
                if(humanoidRootPart) {
                    humanoid.ChangeState(Enum.HumanoidStateType.Landed);
                    //humanoidRootPart.Anchored = false;
                }
                if(humanoid) {
                    humanoid.WalkSpeed = 96;
                }
            }
        });

        this.state = HidingSpotState.OPEN;
        player.Character.SetAttribute("UnderBed", false);
        this.playerInside = undefined;
        this.createProximityPromt(this.instance.Markers.Spot.ProximityPromtPosition);
    }

    private getNearestEntrance(parts: Model, character: Model): BasePart | undefined {
        if(!character) { return; }
        const humanoidRootPart: Part | undefined = character.FindFirstChild("HumanoidRootPart") as Part;
        if(!humanoidRootPart) { return; }

        let nearestEntrance: BasePart | undefined;
        let smallestDistance = math.huge;

        parts.GetChildren().forEach(child => {
            let entrancePart: Part = child as Part;
            if(!entrancePart) { return; }
            const distance: number = (humanoidRootPart.Position.sub(entrancePart.Position)).Magnitude;
            if(distance < smallestDistance) {
                smallestDistance = distance;
                nearestEntrance = entrancePart;
            }
        });

        return nearestEntrance;
    }

    public destroy(): void {
        super.destroy();
        this.leaveHidingSpotConnection?.Disconnect();
        this.characterLeaveHidingConnection?.Disconnect();
    }
}