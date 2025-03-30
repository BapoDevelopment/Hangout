import { Component, BaseComponent, Components } from "@flamework/components";
import { Dependency, OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services"
import { AudioService } from "server/services/AudioService";
import { Slot } from "./Slot";

enum DrawerState {
    OPEN = "OPEN",
    MOVING = "MOVING",
    CLOSED = "CLOSED",
}

interface ITableComponent extends Instance {
    Body: Model;
    RightTopDraw: Model & {
        Plate: BasePart;
        Knob: Part & {
            Toggle: Attachment & {
                ProximityPrompt: ProximityPrompt;
            };
        };
    }
    RightBottomDraw: Model & {
        Plate: BasePart;
        Knob: Part & {
            Toggle: Attachment & {
                ProximityPrompt: ProximityPrompt;
            };
        };
    }
    LeftTopDraw: Model & {
        Plate: BasePart;
        Knob: Part & {
            Toggle: Attachment & {
                ProximityPrompt: ProximityPrompt;
            };
        };
    }
    LeftBottomDraw: Model & {
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
    tag: "Table",
})
export class Table extends BaseComponent <{}, ITableComponent> implements OnStart {

    private rightTopState: DrawerState = DrawerState.CLOSED;
    private rightBottomState: DrawerState = DrawerState.CLOSED;
    private leftTopState: DrawerState = DrawerState.CLOSED;
    private leftBottomState: DrawerState = DrawerState.CLOSED;

    private slots: Slot[] = new Array<Slot>();

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();

        const components = Dependency<Components>();
        components.waitForComponent<Slot>(this.instance.RightTopDraw.Plate).then((slotComponent) => {
            this.slots.push(slotComponent);
        });
        components.waitForComponent<Slot>(this.instance.RightBottomDraw.Plate).then((slotComponent) => {
            this.slots.push(slotComponent);
        });
        components.waitForComponent<Slot>(this.instance.LeftTopDraw.Plate).then((slotComponent) => {
            this.slots.push(slotComponent);
        });
        components.waitForComponent<Slot>(this.instance.LeftBottomDraw.Plate).then((slotComponent) => {
            this.slots.push(slotComponent);
        });
    }

    onStart(): void {
        this.instance.RightTopDraw.Knob.Toggle.ProximityPrompt.Triggered.Connect((player) => {
            this.open(player, "RIGHT_TOP_DRAWER", this.instance.RightTopDraw);
        });

        this.instance.RightBottomDraw.Knob.Toggle.ProximityPrompt.Triggered.Connect((player) => {
            this.open(player, "RIGHT_BOTTOM_DRAWER", this.instance.RightBottomDraw);
        });

        this.instance.LeftTopDraw.Knob.Toggle.ProximityPrompt.Triggered.Connect((player) => {
            this.open(player, "LEFT_TOP_DRAWER", this.instance.LeftTopDraw);
        });

        this.instance.LeftBottomDraw.Knob.Toggle.ProximityPrompt.Triggered.Connect((player) => {
            this.open(player, "LEFT_BOTTOM_DRAWER", this.instance.LeftBottomDraw);
        });
    }

    private open(player: Player, drawerIdentifier: string, model: Model): void {
        if(!model.PrimaryPart) { return; }

        let currentState: DrawerState = this.rightTopState;
        switch(drawerIdentifier) {
            case "RIGHT_BOTTOM_DRAWER": {
                currentState = this.rightBottomState;
                break
            }
            case "LEFT_TOP_DRAWER": {
                currentState = this.leftTopState;
                break
            }
            case "LEFT_BOTTOM_DRAWER": {
                currentState = this.leftBottomState;
                break
            }
        }
        if(currentState === DrawerState.MOVING) { return; }

        const previousState: DrawerState = currentState;
        switch(drawerIdentifier) {
            case "RIGHT_BOTTOM_DRAWER": {
                this.rightBottomState = DrawerState.MOVING;
                break
            }
            case "LEFT_TOP_DRAWER": {
                this.leftTopState = DrawerState.MOVING;
                break
            }
            case "LEFT_BOTTOM_DRAWER": {
                this.leftBottomState = DrawerState.MOVING;
                break
            }
            default: {
                this.rightTopState = DrawerState.MOVING;
            }
        }

        const direction = previousState === DrawerState.OPEN ? 1 : -1;

        const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const targetProperties = {
            CFrame: model.PrimaryPart.CFrame.mul(new CFrame(0, 0, 1.5 * direction))
        }
        const tween = TweenService.Create(model.PrimaryPart, tweenInfo, targetProperties);
        tween.Completed.Connect(() => {
            if(previousState === DrawerState.OPEN) {
                switch(drawerIdentifier) {
                    case "RIGHT_BOTTOM_DRAWER": {
                        this.rightBottomState = DrawerState.CLOSED;
                        break
                    }
                    case "LEFT_TOP_DRAWER": {
                        this.leftTopState = DrawerState.CLOSED;
                        break
                    }
                    case "LEFT_BOTTOM_DRAWER": {
                        this.leftBottomState = DrawerState.CLOSED;
                        break
                    }
                    default: {
                        this.rightTopState = DrawerState.CLOSED;
                    }
                }
            } else if(previousState === DrawerState.CLOSED) {
                switch(drawerIdentifier) {
                    case "RIGHT_BOTTOM_DRAWER": {
                        this.rightBottomState = DrawerState.OPEN;
                        break
                    }
                    case "LEFT_TOP_DRAWER": {
                        this.leftTopState = DrawerState.OPEN;
                        break
                    }
                    case "LEFT_BOTTOM_DRAWER": {
                        this.leftBottomState = DrawerState.OPEN;
                        break
                    }
                    default: {
                        this.rightTopState = DrawerState.OPEN;
                    }
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