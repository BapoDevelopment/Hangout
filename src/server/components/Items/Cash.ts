import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./Tools/AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { AudioService } from "server/services/AudioService";

interface ICashComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        Pickup: Sound;
    }
}

interface ICashAttributes extends IToolAttributes {
    Amount: number;
}

@Component({
    tag: "Cash",
    defaults: {
        Amount: 0,
    }
})
export class Cash extends AbstractToolBaseComponent<ICashAttributes, ICashComponent> implements OnStart{

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });
    }
    
    onStart(): void {}

    protected onProximityPromtActivated(player: Player): boolean {
        this.logger.Info(`Added ${this.attributes.Amount} to ${player.Name}.`);
        
        const pickup: Sound = this.instance.Handle.Pickup.Clone();
        pickup.Parent = player.Character;
        this.audioService.playSoundWithCallback(pickup, () => {
            pickup.Destroy();
        });

        this.destroy();
        return false;
    }

    public isStackable(): boolean {
        return false;
    }

    protected giveTool(player: Player): boolean {
        return false;
    }

    protected setStackable(stackable: number) {}

    protected onEquip(): void {}

    protected onUnequip(): void {}

    destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}