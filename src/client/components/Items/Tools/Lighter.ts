import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Events } from "client/network";
import { AbstractToolBaseComponent } from "./AbstractToolBaseComponent";

interface ILighterComponent extends Tool {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        Switch: Instance & {
            Sound: Sound;
            On: BasePart;
            Off: BasePart;
        };
        Fire: BasePart & {
            PointLight: PointLight;
        };
    };
}

interface ILighterAttributes {
    Gas: number;
    On: boolean;
}

@Component({
    tag: "Lighter",
})
export class Lighter extends AbstractToolBaseComponent<ILighterAttributes, ILighterComponent> implements OnStart {

    constructor(protected logger: Logger) {
        super(logger);
    }
    
    onStart(): void {}

    protected onActivated(): void {
        if(super.isToolEquipped()) {
            Events.items.lighter.clickedEvent.fire();
        }
    }
}