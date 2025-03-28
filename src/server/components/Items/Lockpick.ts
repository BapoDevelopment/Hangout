import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";

interface ILockpickComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
    }
}

interface ILockpickAttributes extends IToolAttributes {}

@Component({
    tag: "Lockpick",
})
export class Lockpick extends AbstractToolBaseComponent<ILockpickAttributes, ILockpickComponent> implements OnStart{

    constructor(protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });

        this.setStackable(ServerSettings.ITEMS.LOCKPICK.STACKABLE);
    }
    
    onStart(): void {}

}