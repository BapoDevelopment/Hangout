import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";
import { TweenService } from "@rbxts/services";
import { Events } from "server/network";

interface IFlashlightComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        SpotLight: SpotLight;
        Switch: BasePart;
    };
}

interface IFlashlightAttributes extends IToolAttributes {
    Battery: number;
}

@Component({
    tag: "Flashlight",
})
export class Flashlight extends AbstractToolBaseComponent<IFlashlightAttributes, IFlashlightComponent> implements OnStart{

    private activateConnection: RBXScriptConnection | undefined;

    constructor(protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });

        this.setStackable(ServerSettings.ITEMS.FLASHLIGHT.STACKABLE);
    }
    
    onStart(): void {

    }

    protected onProximityPromtActivated(player: Player): boolean {
        const flashlightEquipped: boolean = super.onProximityPromtActivated(player);
        if(!flashlightEquipped) { return false; }

        this.activateConnection = Events.items.flashlight.clickedEvent.connect((player) => {
            this.logger.Info("recieved flashlgiht click");
            this.onActivated(player);
        });

        return flashlightEquipped;
    }

    protected onActivated(player: Player): void {
        if(!player) { return; }
        this.instance.Handle.SpotLight.Enabled = !this.instance.Handle.SpotLight.Enabled;
    }

    destroy(): void {
        super.destroy();
        if(this.activateConnection) {
            this.activateConnection.Disconnect();
        }
    }
}