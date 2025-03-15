import { Component, BaseComponent, Components } from "@flamework/components";
import { Dependency, OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services"
import { AudioService } from "server/services/AudioService";
import { Slot } from "./Furniture/Slot";

enum DrawerState {
    OPEN = "OPEN",
    MOVING = "MOVING",
    CLOSED = "CLOSED",
}

interface IDrawerComponent extends Instance {
    Body: Model;
    TopDraw: Model & {
        Plate: BasePart;
        Knob: Part & {
            Toggle: Attachment & {
                ProximityPrompt: ProximityPrompt;
            };
        };
    }
    BottomDraw: Model & {
        Plate: BasePart;
        Knob: Part & {
            Toggle: Attachment & {
                ProximityPrompt: ProximityPrompt;
            };
        };
    }
    Primary: Part & {
        move: Sound;
    }
}

@Component({
    tag: "Drawer",
})
export class Drawer extends BaseComponent <{}, IDrawerComponent> implements OnStart {

    private topState: DrawerState = DrawerState.CLOSED;
    private bottomState: DrawerState = DrawerState.CLOSED;

    private slots: Slot[] = new Array<Slot>();

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();

        const components = Dependency<Components>();
        components.waitForComponent<Slot>(this.instance.TopDraw.Plate).then((slotComponent) => {
            this.slots.push(slotComponent);
        });
        components.waitForComponent<Slot>(this.instance.BottomDraw.Plate).then((slotComponent) => {
            this.slots.push(slotComponent);
        });
    }

    onStart(): void {
        this.instance.TopDraw.Knob.Toggle.ProximityPrompt.Triggered.Connect((player) => {
            this.open(player, "TOP_DRAWER", this.instance.TopDraw);
        });

        this.instance.BottomDraw.Knob.Toggle.ProximityPrompt.Triggered.Connect((player) => {
            this.open(player, "BOTTOM_DRAWER", this.instance.BottomDraw);
        });
    }

    private open(player: Player, drawerIdentifier: string, model: Model): void {
        if(!model.PrimaryPart) { return; }

        let currentState: DrawerState = this.topState;
        if(drawerIdentifier === "BOTTOM_DRAWER") {
            currentState = this.bottomState;
        }
        if(currentState === DrawerState.MOVING) { return; }

        const previousState: DrawerState = currentState;
        if(drawerIdentifier === "TOP_DRAWER") {
            this.topState = DrawerState.MOVING;
        } else {
            this.bottomState = DrawerState.MOVING;
        }

        const direction = previousState === DrawerState.OPEN ? 1 : -1;

        const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const targetProperties = {
            CFrame: model.PrimaryPart.CFrame.mul(new CFrame(0, 0, 1.5 * direction))
        }
        const tween = TweenService.Create(model.PrimaryPart, tweenInfo, targetProperties);
        tween.Completed.Connect(() => {
            if(previousState === DrawerState.OPEN) {
                if(drawerIdentifier === "TOP_DRAWER") {
                    this.topState = DrawerState.CLOSED;
                } else {
                    this.bottomState = DrawerState.CLOSED;
                }
            } else if(previousState === DrawerState.CLOSED) {
                if(drawerIdentifier === "TOP_DRAWER") {
                    this.topState = DrawerState.OPEN;
                } else {
                    this.bottomState = DrawerState.OPEN;
                }
            }
        });

        tween.Play();
        this.audioService.playSound(this.instance.Primary.move);
    }

    public getFreeSlots(): Slot[] {
        let freeSlots: Slot[] = new Array<Slot>();

        this.slots.forEach(slot => {
            if(slot.isFree()) {
                freeSlots.push(slot);
            }
        });

        return freeSlots;
    }

    public destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}