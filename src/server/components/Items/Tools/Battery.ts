import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { AudioService } from "server/services/AudioService";
import { ServerSettings } from "server/ServerSettings";

interface IBatteryComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
    }
}

interface IBatteryAttributes extends IToolAttributes {
    Battery: number;
}

@Component({
    tag: "Battery",
})
export class Battery extends AbstractToolBaseComponent<IBatteryAttributes, IBatteryComponent> implements OnStart{

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });
    }
    
    onStart(): void {}

    protected onProximityPromtActivated(player: Player): boolean {

        const flashlgihtTool: Tool | undefined = super.getPlayerTool(player, "Flashlight");
        if(flashlgihtTool !== undefined) {
            const battery: number = flashlgihtTool.GetAttribute("Battery") as number;
            let setBatteryLevel: number = battery + this.attributes.Battery
            if(setBatteryLevel > ServerSettings.ITEMS.TOOLS.FLASHLIGHT.MAX_BATTERY) {
                setBatteryLevel = ServerSettings.ITEMS.TOOLS.FLASHLIGHT.MAX_BATTERY;
            }
            flashlgihtTool.SetAttribute("Battery",  setBatteryLevel);
            this.destroy();
        }

        return false;
    }

    destroy(): void {
        super.destroy();
        this.instance.Destroy();
    }
}