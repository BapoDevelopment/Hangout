import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { ContextActionService } from "@rbxts/services";

export interface IToolComponent extends Tool {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
    };
}

export interface IToolAttributes {}

@Component()
export abstract class AbstractToolBaseComponent<A extends IToolAttributes, I extends IToolComponent> extends BaseComponent<A, I> implements OnStart {

    private stackable: boolean = false;

    constructor(protected readonly logger: Logger) {
        super();

        this.instance.Equipped.Connect(() => this.onEquip());
        this.instance.Unequipped.Connect(() => this.onUnequip());
    }

    onStart(): void {
        
    }

    protected onEquip(): void {
        ContextActionService.BindAction("Use" + this.instance, (_, inputState) => {
            if(inputState === Enum.UserInputState.Begin) {
                this.onActivated();
            }
        }, false, Enum.UserInputType.MouseButton1, Enum.UserInputType.Touch, Enum.KeyCode.ButtonR2);
    }

    protected onUnequip(): void {
        ContextActionService.UnbindAction("Client Use" + this.instance);
    }

    protected onActivated(): void {
        this.logger.Info("Client Tool wurde benutzt!");
    }

    destroy(): void {
        ContextActionService.UnbindAction("Client Use" + this.instance);
    }
}