import { Component, BaseComponent } from "@flamework/components";
import { Flamework, OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services"
import { AudioService } from "server/services/AudioService";

enum DrawerState {
    OPEN = "OPEN",
    MOVING = "MOVING",
    CLOSED = "CLOSED",
}

interface IDrawerComponent extends Instance {
    Body: Model;
    TopDraw: Model & {
        Plate: Part & {
            ItemLocation: Attachment;
        };
        Knob: Part & {
            Toggle: Attachment;
        };
    }
    BottomDraw: Model & {
        Plate: Part;
        Knob: Part;
    }
    Primary: Part;
    move: Sound;
}
const instanceGuard = Flamework.createGuard<IDrawerComponent>();

@Component({
    tag: "Drawer",
    instanceGuard: instanceGuard,
})
export class Drawer extends BaseComponent <{}, IDrawerComponent> implements OnStart {

    private state: DrawerState = DrawerState.CLOSED;

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();
    }

    onStart(): void {
        this.createProximityPromt();
    }

    private createProximityPromt(): void {
        const promt = new Instance("ProximityPrompt");
        promt.ActionText = "Open";
        promt.MaxActivationDistance = 5;
        promt.Parent = this.instance.TopDraw.Knob.Toggle;

        promt.Triggered.Connect((player) => {
            this.open(player, "TOP_DRAWER");
        });
    }

    private open(player: Player, drawerIdentifier: string): void {
        if(this.state === DrawerState.MOVING) { return; }
        const previousState: DrawerState = this.state;
        this.state = DrawerState.MOVING;

        let drawer: Model = drawerIdentifier === "TOP_DRAWER" ? this.instance.TopDraw : this.instance.BottomDraw;
        if(!drawer.PrimaryPart) { return; }

        const direction = previousState === DrawerState.OPEN ? 1 : -1;

        const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const targetProperties = {
            CFrame: drawer.PrimaryPart.CFrame.mul(new CFrame(0, 0, 1.5 * direction))
        }
        const tween = TweenService.Create(drawer.PrimaryPart, tweenInfo, targetProperties);
        tween.Completed.Connect(() => {
            if(previousState === DrawerState.OPEN) {
                this.state = DrawerState.CLOSED;
            } else if(previousState === DrawerState.CLOSED) {
                this.state = DrawerState.OPEN;
            }
        });

        tween.Play();
        const moveSound: Sound = this.instance.FindFirstChild("move") as Sound;
        this.audioService.playSound(moveSound);
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}