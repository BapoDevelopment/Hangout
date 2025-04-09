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

interface ILockpickAttributes extends IToolAttributes {
    stack: number;
}

@Component({
    tag: "Lockpick",
    defaults: {
        stack: 1,
    }
})
export class Lockpick extends AbstractToolBaseComponent<ILockpickAttributes, ILockpickComponent> implements OnStart{

    constructor(protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.obliterator.Add(this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        }), "Disconnect");

        this.setStackable(ServerSettings.ITEMS.TOOLS.LOCKPICK.STACKABLE);

        this.obliterator.Add(this.instance);
    }
    
    onStart(): void {}

    protected onProximityPromtActivated(player: Player): boolean {
        if(super.getPlayerTool(player, "Lockpick") !== undefined) {
            const currentStack: number = this.getPlayerLockpicks(player);
            if(currentStack < ServerSettings.ITEMS.TOOLS.LOCKPICK.STACKABLE) {
                this.updateStack(player);
                this.destroy();                
            }
            return false;
        }
        const lockpicksEquipped: boolean = super.onProximityPromtActivated(player);
        if(!lockpicksEquipped) { return false; }

        return lockpicksEquipped;
    }

    private getPlayerLockpicks(player: Player): number {
        if(!player) { return 0; }
        if(!player.Character) { return 0; }

        let lockpickTool: Tool | undefined = super.getPlayerTool(player, "Lockpick");
        if(!lockpickTool) { return 0;}

        const currentStackValue: AttributeValue | undefined = lockpickTool.GetAttribute("stack");
        if(!currentStackValue) { return 0; }
        const currentStack: number | undefined = tonumber(currentStackValue);
        if(currentStack) {
            return currentStack ? currentStack : 0;
        }
        return 0;
    }

    private updateStack(player: Player): void {
        if(!player) { return; }
        if(!player.Character) { return; }

        const lockpickTool: Tool | undefined = super.getPlayerTool(player, "Lockpick");
        if(!lockpickTool) { return; }

        const currentStackValue: AttributeValue | undefined = lockpickTool.GetAttribute("stack");
        if(!currentStackValue) { return; }
        const currentStack: number | undefined = tonumber(currentStackValue);
        if(currentStack) {
            lockpickTool.SetAttribute("stack", currentStack + 1);
        }
    }

    destroy(): void {
        super.destroy();
        this.obliterator.Cleanup();
    }
}