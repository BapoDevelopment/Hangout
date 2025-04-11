import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services"
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";
import { CollisionGroupService } from "server/services/CollisionGroupService";
import { HidingSpot, HidingSpotState, IHidingSpotComponent } from "./HidingSpot";
import { ReplicaService } from "server/services/ReplicaService";
import { ServerSettings } from "server/ServerSettings";

interface IWardrobeComponent extends IHidingSpotComponent {
    Primary: Part & {
        open: Sound;
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
export class Wardrobe extends HidingSpot <{}, IWardrobeComponent> implements OnStart {

    private leftDoorDefaultPosition: CFrame | undefined;
    private rightDoorDefaultPosition: CFrame | undefined;

    constructor(private replicaService: ReplicaService
        , private audioService: AudioService
        , private collisionGroupService: CollisionGroupService
        , protected readonly logger: Logger) {
        super();
        this.obliterator.Add(this.instance);
    }

    onStart(): void {
        this.leftDoorDefaultPosition = this.instance.Build.Doors.Left.Leaf.CFrame;
        this.rightDoorDefaultPosition = this.instance.Build.Doors.Right.Leaf.CFrame;

        this.leaveHidingSpotConnection = Events.leaveWardrobe.connect((player) => {
            if(this.playerInside === player) {
                this.exitPlayer(player);
            }
        });
        this.obliterator.Add(this.leaveHidingSpotConnection, "Disconnect");
        this.createProximityPromt(this.instance.Primary.Toggle);
    }

    protected enterPlayer(player: Player): void {
        //Check validty of action
        if(this.state === HidingSpotState.BLOCKED) { return; }
        if(!player.Character) { return; }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }

        this.state = HidingSpotState.BLOCKED;
        this.destroyProximityPromt();
        this.collisionGroupService.setCollisionGroup(player.Character, "Wardrobe");
        this.characterLeaveHidingConnection = player.CharacterRemoving.Connect(() => {
            if(player === this.playerInside) {
                this.state = HidingSpotState.OPEN;
                this.playerInside = undefined;
                this.createProximityPromt(this.instance.Primary.Toggle);
                this.closeWardrobe();
            }
        });
        this.obliterator.Add(this.characterLeaveHidingConnection, "Disconnect");

        const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
        if(humanoid) {
            humanoid.WalkSpeed = 0;
            humanoid.AutoRotate = false;
        }

        const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
        if(humanoidRootPart) {
            humanoidRootPart.Anchored = true;
        }

        this.openWardrobe();

        //Play open Sound
        this.audioService.playSound(this.instance.Primary.open);

        //Move Player
        const playerMovedToEntrance: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character, this.instance.Markers.Entrance.CFrame, 0.18);
        if(playerMovedToEntrance === undefined) { this.closeWardrobe(); return; }
        this.obliterator.Add(playerMovedToEntrance.Connect(() => {
            if(!player.Character) { this.closeWardrobe(); return; }

            const playerMovedToSpot: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character, this.instance.Markers.Spot.CFrame, 0.5);
            if(playerMovedToSpot === undefined) { this.closeWardrobe(); return; }

            // Close wardrobe
            this.obliterator.Add(playerMovedToSpot.Connect(() => {
                let closeDoorSignal: RBXScriptSignal | undefined = this.closeWardrobe();
                if(closeDoorSignal) {
                    this.obliterator.Add(closeDoorSignal.Connect(() => {
                        if(player.Character) {
                            player.Character.SetAttribute("InWardrobe", true);
                            this.playerInside = player;
                            this.replicaService.enterWardrobe(player.UserId);

                            this.obliterator.Add(task.spawn(() => {
                                wait(20);
                                if(this.playerInside === player) {
                                    this.exitPlayer(player);
                                }
                            }));
                        }
                    }), "Disconnect");
                }
                
                if(player.Character) {
                    this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                }
            }), "Disconnect");
        }), "Disconnect");
    }

    protected exitPlayer(player: Player): void {
        //Check validty of action
        if(this.state === HidingSpotState.OPEN) { return; }
        if(!player.Character) { return; }
        if(!player.Character.FindFirstChild("HumanoidRootPart")) { return; }

        this.characterLeaveHidingConnection?.Disconnect();

        this.collisionGroupService.setCollisionGroup(player.Character, "Wardrobe");

        this.openWardrobe();
        this.replicaService.exitWardrobe(player.UserId);

        //Play open Sound
        this.audioService.playSound(this.instance.Primary.open);

        //Move Player
        const playerMovedToEntrance: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character,
            this.instance.Markers.Entrance.CFrame.mul(CFrame.Angles(0, math.rad(180), 0)),
             0.46);
        if(playerMovedToEntrance === undefined) { this.closeWardrobe(); return; }

        // Close wardrobe
        this.obliterator.Add(playerMovedToEntrance.Connect(() => {
            this.closeWardrobe();
            
            if(player.Character) {
                this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
                if(humanoid) {
                    humanoid.WalkSpeed = ServerSettings.GAME.DEFAULT_WALKSPEED;
                    humanoid.AutoRotate = true;
                }
                const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
                if(humanoidRootPart) {
                    humanoidRootPart.Anchored = false;
                }
            }
        }), "Disconnect");

        this.state = HidingSpotState.OPEN;
        player.Character.SetAttribute("InWardrobe", false);
        this.playerInside = undefined;
        this.createProximityPromt(this.instance.Primary.Toggle);
    }

    private openWardrobe(): void {
        if(this.leftDoorDefaultPosition) {
            this.tweenDoor(this.instance.Build.Doors.Left, this.leftDoorDefaultPosition.mul(new CFrame(2.5, 0, 0)), 0.5);
        }

        if(this.rightDoorDefaultPosition) {
            this.tweenDoor(this.instance.Build.Doors.Right, this.rightDoorDefaultPosition.mul(new CFrame(-2.5, 0, 0)), 0.5);
        }
    }

    private closeWardrobe(): RBXScriptSignal | undefined {
        let leftDoorSignal: RBXScriptSignal | undefined;
        let rightDoorSignal: RBXScriptSignal | undefined;
        if(leftDoorSignal) { this.obliterator.Add(leftDoorSignal); };
        if(rightDoorSignal) {this.obliterator.Add(rightDoorSignal); };

        if(this.leftDoorDefaultPosition) {
            leftDoorSignal = this.tweenDoor(this.instance.Build.Doors.Left, this.leftDoorDefaultPosition, 0.5);
        }

        if(this.rightDoorDefaultPosition) {
            rightDoorSignal = this.tweenDoor(this.instance.Build.Doors.Right, this.rightDoorDefaultPosition, 0.5);
        }

        return leftDoorSignal ?? rightDoorSignal;
    }

    private tweenDoor(door: Model, goal: CFrame, duration: number): RBXScriptSignal | undefined {
        if(!door.PrimaryPart) { return; }
        let tweenInfo = new TweenInfo(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        let targetProperties = {
            CFrame: goal
        }
        let tween = TweenService.Create(door.PrimaryPart, tweenInfo, targetProperties);
        this.obliterator.Add(tween);
        tween.Play();
        return tween.Completed;
    }

    public destroy(): void {
        super.destroy();
        this.leaveHidingSpotConnection?.Disconnect();
        this.characterLeaveHidingConnection?.Disconnect();
        this.obliterator.Cleanup();
    }
}