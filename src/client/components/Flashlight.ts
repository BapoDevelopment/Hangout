import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ContextActionService, TweenService } from "@rbxts/services";

interface IFlashlightComponent extends Tool {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        SpotLight: SpotLight;
        Switch: BasePart;
    };
}

interface IFlashlightAttributes {
    Battery: number;
}

@Component({
    tag: "Flashlight",
})
class Flashlight extends BaseComponent<IFlashlightAttributes, IFlashlightComponent> implements OnStart {

    constructor(private logger: Logger) {
        super();

        logger.Info("Client Flashlight");

        this.instance.Equipped.Connect(() => this.onEquip());
        this.instance.Unequipped.Connect(() => this.onUnequip());
    }
    
    onStart(): void {}

    protected onEquip(): void {
        ContextActionService.BindAction("Use" + this.instance, (_, inputState) => {
            if(inputState === Enum.UserInputState.Begin) {
                this.logger.Info("Client Tool wurde benutzt!");

            }
        }, false, Enum.UserInputType.MouseButton1, Enum.UserInputType.Touch, Enum.KeyCode.ButtonR2);
    }

    protected onUnequip(): void {
        ContextActionService.UnbindAction("Client Use" + this.instance);
    }

    destroy(): void {
        ContextActionService.UnbindAction("Client Use" + this.instance);
    }
}