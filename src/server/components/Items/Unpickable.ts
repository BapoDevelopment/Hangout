import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { ToolService } from "server/services/ToolService";
import { AudioService } from "server/services/AudioService";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./Tools/AbstractToolBaseComponent";

interface IUnpickableComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
    }
}

interface IUnpickableAttributes extends IToolAttributes {}

@Component({
    tag: "Unpickable",
})
export class Unpickable extends AbstractToolBaseComponent<IUnpickableAttributes, IUnpickableComponent> implements OnStart{

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);
    }
    
    onStart(): void {}

    public activateProximityPromt(): void {}

    public deactivateProximityPromt(): void {}

    public isStackable(): boolean {
        return false;
    }

    protected onProximityPromtActivated(player: Player): boolean {
        return false;
    }

    protected giveTool(player: Player): boolean {
        return false;
    }

    protected setStackable(stackable: number) {}

    protected onEquip(): void {}

    protected onUnequip(): void {}

    protected onActivated(player: Player): void {}

    destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}