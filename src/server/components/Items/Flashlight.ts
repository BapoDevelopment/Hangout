import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";

interface IFlashlightComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        SpotLight: SpotLight;
    };
}

interface IFlashlightAttributes extends IToolAttributes {
    Battery: number;
}

@Component({
    tag: "Flashlight",
})
export class Flashlight extends AbstractToolBaseComponent<IFlashlightAttributes, IFlashlightComponent> implements OnStart{

    constructor(protected readonly logger: Logger) {
        super(logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });
    }
    
    onStart(): void {}
}