import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent } from "./Items/AbstractToolBaseComponent";
import { Events } from "client/network";

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
        logger.Info("Client Flashlight");
    }
    
    onStart(): void {}

    protected onActivated(): void {
        this.logger.Info("Client Flashlight wurde benutzt! " + tostring(this.instance));
        Events.items.flashlight.clickedEvent.fire();
    }
}