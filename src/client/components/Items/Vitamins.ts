import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Events } from "client/network";
import { AbstractToolBaseComponent } from "./AbstractToolBaseComponent";

interface IVitaminsComponent extends Tool {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        Lid: MeshPart;
    };
}

interface IVitaminsAttributes {}

@Component({
    tag: "Vitamins",
})
export class Vitamins extends AbstractToolBaseComponent<IVitaminsAttributes, IVitaminsComponent> implements OnStart {

    constructor(protected logger: Logger) {
        super(logger);
    }
    
    onStart(): void {}

    protected onActivated(): void {
        if(super.isToolEquipped()) {
            Events.items.vitamins.clickedEvent.fire();
        }
    }
}