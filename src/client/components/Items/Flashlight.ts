import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Events } from "client/network";
import { AbstractToolBaseComponent } from "./AbstractToolBaseComponent";

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
export class Flashlight extends AbstractToolBaseComponent<IFlashlightAttributes, IFlashlightComponent> implements OnStart {

    constructor(protected logger: Logger) {
        super(logger);
    }
    
    onStart(): void {}

    protected onActivated(): void {
        Events.items.flashlight.clickedEvent.fire();
    }
}