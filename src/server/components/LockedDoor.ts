import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { AudioService } from "server/services/AudioService";
import { Logger } from "@rbxts/log/out/Logger";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/SuperDoor";
import { GameService } from "server/services/GameService";

interface ILockedDoorComponent extends IDoorComponent {
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
            Leaf: Instance & {
                WeldConstraint: WeldConstraint;
            }
            Lock: MeshPart & {
                Attachment: Attachment;
            }
        };
    };
    open: Sound;
}

@Component({
    tag: "LockedDoor",
})
export class LockedDoor extends SuperDoor<IDoorAttributes, ILockedDoorComponent> implements OnStart{

    constructor(protected gameService: GameService
        , protected audioService: AudioService
        , protected readonly logger: Logger) {
        super();
        this.audioService = audioService;
        this.gameService = gameService;
    }

    onStart() {
        this.instance.Build.Leaf.Lock.Anchored = false;
        this.createProximityPromt();
    }

    private createProximityPromt(): void {
        const promt = new Instance("ProximityPrompt");
        promt.ActionText = "Open";
        promt.MaxActivationDistance = 5;
        promt.Parent = this.instance.Build.Leaf.Lock.Attachment;

        promt.Triggered.Connect((player) => {
            const key: Tool | undefined = player.Character?.FindFirstChild("Key") as Tool;
            if(!key) { return; }

            const keyNumber = key.GetAttribute("Door") as Number;
            if(keyNumber === this.attributes.Number) {
                promt.Destroy();
                this.instance.Build.Leaf.Leaf.WeldConstraint.Destroy();
                key.Destroy();
                super.openDoor(player);
            }
        });
    }
}