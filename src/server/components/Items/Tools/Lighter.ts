import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";

interface ILighterComponent extends IToolComponent {
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

interface ILighterAttributes extends IToolAttributes {
    Gas: number;
    On: boolean;
}

@Component({
    tag: "Lighter",
})
export class Lighter extends AbstractToolBaseComponent<ILighterAttributes, ILighterComponent> implements OnStart{

    private activateConnection: RBXScriptConnection | undefined;
    private holder: Player | undefined;

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });


        this.setStackable(ServerSettings.ITEMS.TOOLS.LIGHTER.STACKABLE);
    }
    
    onStart(): void {

    }

    protected onProximityPromtActivated(player: Player): boolean {
        const lighterTool: Tool | undefined = super.getPlayerTool(player, "Lighter");
        if(lighterTool !== undefined) {
            const gas: number = lighterTool.GetAttribute("Gas") as number;
            lighterTool.SetAttribute("Gas",  gas + this.attributes.Gas);
            this.destroy();
            return false;
        }

        const lighterEquipped: boolean = super.onProximityPromtActivated(player);
        if(!lighterEquipped) { return false; }

        this.holder = player;

        this.activateConnection = Events.items.lighter.clickedEvent.connect((player) => {
            this.onActivated(player);
        });

        return lighterEquipped;
    }
   
    protected onActivated(player: Player): void {
        if(!player) { return; }

        if(!this.attributes.On) {
            this.turnOn(player);
        } else {
            this.turnOff(player);
        }
    }

    protected onUnequip(): void {
        if(this.holder) {
            this.turnOff(this.holder);
        }
    }

    private turnOn(player: Player): void {
        if(this.attributes.Gas <= 0) { return; }

        this.attributes.On = true;
        this.instance.Handle.Fire.PointLight.Enabled = true;
        this.instance.Handle.Switch.On.Transparency = 0;
        this.instance.Handle.Switch.Off.Transparency = 1;        
        this.audioService.playSound(this.instance.Handle.Switch.Sound);
        this.drainGas(player);
    }

    private turnOff(player: Player): void {
        this.attributes.On = false;
        this.instance.Handle.Fire.PointLight.Enabled = false;
        this.instance.Handle.Switch.On.Transparency = 1;
        this.instance.Handle.Switch.Off.Transparency = 0;        
        this.audioService.playSound(this.instance.Handle.Switch.Sound);
    }

    private drainGas(player: Player): void {
        task.spawn(() => {
            while (this.attributes.On && this.attributes.Gas > 0) {
                this.attributes.Gas -= ServerSettings.ITEMS.TOOLS.LIGHTER.GAS_DRAIN_PER_MILLISECOND;
                if (this.attributes.Gas <= 0) {
                    this.attributes.Gas = 0;
                    this.turnOff(player);
                    break;
                }
                task.wait(0.001); // 0.001 =^ 1 Millisecond
            }
        });
    }

    destroy(): void {
        super.destroy();
        if(this.activateConnection) {
            this.activateConnection.Disconnect();
        }
        this.instance.Destroy();
    }
}