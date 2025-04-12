import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";
import { CollisionGroupService } from "server/services/CollisionGroupService";
import { SharedSettings } from "shared/SharedSettings";
import { HidingSpot, HidingSpotState, IHidingSpotComponent } from "./HidingSpot";
import { ReplicaService } from "server/services/ReplicaService";
import { ServerSettings } from "server/ServerSettings";

interface IBedComponent extends IHidingSpotComponent {
    Primary: Part & {
        open: Sound;
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
    private enteredSide: string = "FRONT";

    constructor(private replicaService: ReplicaService,
        private audioService: AudioService,
        private collisionGroupService: CollisionGroupService,
        protected readonly logger: Logger) {
        super();
        this.obliterator.Add(this.instance);
    }

    onStart(): void {
        this.leaveHidingSpotConnection = Events.leaveBed.connect((player) => {
            if(this.playerInside === player) {
                this.exitPlayer(player);
            }
        });
        this.obliterator.Add(this.leaveHidingSpotConnection, "Disconnect");
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
        this.obliterator.Add(this.characterLeaveHidingConnection, "Disconnect");

        const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
        if(humanoid) {
            humanoid.WalkSpeed = 0;
            humanoid.AutoRotate = false;
        }
        
        //Play crouch Sound
        this.audioService.playSound(this.instance.Primary.open);

        const humanoidRootPart: Part | undefined = player.Character.FindFirstChild("HumanoidRootPart") as Part;
        if(!humanoidRootPart) {
            return;
        }
        humanoidRootPart.Anchored = true;
        
        //Move Player
        let nearestEntrance: BasePart | undefined = this.getNearestEntrance(this.instance.Markers.Entrance, player.Character);
        if(!nearestEntrance) {
            nearestEntrance = this.instance.Markers.Entrance.Front;
            this.enteredSide = "FRONT";
        } else {
            this.enteredSide = nearestEntrance.Name;
        }
        this.exit = nearestEntrance;
        const playerMovedToEntrance: RBXScriptSignal | undefined = this.moveCharacterToMarkerCFrame(player.Character,
            nearestEntrance.CFrame,
                0.46);
        if(playerMovedToEntrance === undefined) { return; }
        this.obliterator.Add(playerMovedToEntrance.Connect(() => {
            if(!player.Character) { return; }
            //humanoidRootPart.Anchored = true;
            player.Character.SetAttribute("UnderBed", true);
            this.playerInside = player;

            this.replicaService.enterHidingSpot(player.UserId);
            this.obliterator.Add(task.spawn(() => {
                wait(20);
                if(this.playerInside === player) {
                    humanoid.TakeDamage(ServerSettings.ENTITIES.HIDE.DMG);
                    this.exitPlayer(player);
                }
            }));

            this.animate(player, "LAY_DOWN", nearestEntrance.Name);
        }), "Disconnect");
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
        this.replicaService.exitHidingSpot(player.UserId);

        //Play open Sound
        this.audioService.playSound(this.instance.Primary.open);

        const rbxSignal: RBXScriptSignal | undefined = this.animate(player, "GET_UP", this.enteredSide);
        if(rbxSignal) {
            this.obliterator.Add(rbxSignal.Connect(() => {
                if(player.Character) {
                    this.collisionGroupService.setCollisionGroup(player.Character, "Character");
                }
            }), "Disconnect");
        }

        const humanoid: Humanoid | undefined = player.Character.FindFirstChild("Humanoid") as Humanoid;
        if(humanoid) {
            humanoid.AutoRotate = true;
        }

        humanoidRootPart.Anchored = false;
        this.state = HidingSpotState.OPEN;
        player.Character.SetAttribute("UnderBed", false);
        this.playerInside = undefined;
        this.createProximityPromt(this.instance.Markers.Spot.ProximityPromtPosition);
    }

    private animate(player: Player, action: string, side: string): RBXScriptSignal | undefined {
        if(!player) { return; }
        if(!player.Character) { return; }
        
        const humanoid: Humanoid | undefined = player.Character.WaitForChild("Humanoid") as Humanoid;
        if(!humanoid) { return; }

        let animation: Animation = new Instance("Animation");
        if(action === "LAY_DOWN") {
            if(side === "Left") {
                animation.AnimationId = SharedSettings.ANIMATIONS.BED.ENTER.LEFT;
            } else if(side === "Right") {
                animation.AnimationId = SharedSettings.ANIMATIONS.BED.ENTER.RIGHT;
            } else {
                animation.AnimationId = SharedSettings.ANIMATIONS.BED.ENTER.FRONT;
            }
        } else if(action === "GET_UP") {
            if(side === "Left") {
                animation.AnimationId = SharedSettings.ANIMATIONS.BED.EXIT.LEFT;
            } else if(side === "Right") {
                animation.AnimationId = SharedSettings.ANIMATIONS.BED.EXIT.RIGHT;
            } else {
                animation.AnimationId = SharedSettings.ANIMATIONS.BED.EXIT.FRONT;
            }
        }
        
        const animator: Animator | undefined = humanoid.WaitForChild("Animator") as Animator;
        if(!animator) { return; }

        const animationTrack: AnimationTrack = animator.LoadAnimation(animation);
        this.obliterator.Add(animationTrack);

        animationTrack.Play();

        this.obliterator.Add(animationTrack.KeyframeReached.Connect((keyframeName) => {
            if(keyframeName === "Pause" && action === "LAY_DOWN") {
                animationTrack.AdjustSpeed(0);
            }
        }), "Disconnect");

        this.obliterator.Add(animationTrack.Stopped.Connect(() => {
            humanoid.GetPlayingAnimationTracks().forEach(track => {
                track.Stop();
            });
            if(action === "LAY_DOWN") {
                humanoid.WalkSpeed = 16;
            }
        }), "Disconnect");

        return animationTrack.Stopped;
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
        this.obliterator.Cleanup();
    }
}