import { Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "./AbstractToolBaseComponent";
import { ToolService } from "server/services/ToolService";
import { ServerSettings } from "server/ServerSettings";
import { Events } from "server/network";
import { AudioService } from "server/services/AudioService";

interface IVitaminsComponent extends IToolComponent {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
        Lid: MeshPart;
        Use: Sound;
    };
}

interface IVitaminsAttributes extends IToolAttributes {
    stack: number;
}

@Component({
    tag: "Vitamins",
    defaults: {
        stack: 1,
    }
})
export class Vitamins extends AbstractToolBaseComponent<IVitaminsAttributes, IVitaminsComponent> implements OnStart{

    private activateConnection: RBXScriptConnection | undefined;

    constructor(protected audioService: AudioService, protected toolService: ToolService, protected readonly logger: Logger) {
        super(toolService, logger);

        this.instance.Handle.ProximityPrompt.Triggered.Connect((player) => {
            this.onProximityPromtActivated(player);
        });


        this.setStackable(ServerSettings.ITEMS.TOOLS.VITAMINS.STACKABLE);
    }
    
    onStart(): void {

    }

    protected onProximityPromtActivated(player: Player): boolean {
        if(super.getPlayerTool(player, "Vitamins") !== undefined) {
            const currentStack: number = this.getPlayerVitamins(player);
            if(currentStack < ServerSettings.ITEMS.TOOLS.VITAMINS.STACKABLE) {
                this.updateStack(player);
                this.destroy();                
            }
            return false;
        }
        const vitaminsEquipped: boolean = super.onProximityPromtActivated(player);
        if(!vitaminsEquipped) { return false; }

        this.activateConnection = Events.items.vitamins.clickedEvent.connect((player) => {
            this.onActivated(player);
        });

        return vitaminsEquipped;
    }
   
    protected onActivated(player: Player): void {
        if(!player) { return; }
        if(!player.Character) { return; }
        if(player.Character.GetAttribute("VitaminsActivated") === true) {
            return;
        }

        const lastActivationTimeValue: AttributeValue | undefined = player.Character.GetAttribute("LastVitaminsActivated");
        if(lastActivationTimeValue !== undefined) {
            const lastActivationTime: number | undefined = tonumber(lastActivationTimeValue);
            if(!(lastActivationTime && os.time() - lastActivationTime > ServerSettings.ITEMS.TOOLS.VITAMINS.PAUSE)) {
                return;
            }
        }
        player.Character.SetAttribute("VitaminsActivated", true);

        const use: Sound = this.instance.Handle.Use.Clone();
        use.Parent = player.Character;
        this.audioService.playSoundWithCallback(use, () => {
            use.Destroy();
        });

        task.spawn(() => {
            if(!player) { return; }
            if(!player.Character) { return; }
            const humanoid: Humanoid | undefined = player.Character.WaitForChild("Humanoid") as Humanoid;
            const pervWalkspeed = humanoid.WalkSpeed;
            humanoid.WalkSpeed += ServerSettings.ITEMS.TOOLS.VITAMINS.ADDED_WALKSPEED;
            wait(ServerSettings.ITEMS.TOOLS.VITAMINS.DURATION);
            if(humanoid) {
                humanoid.WalkSpeed = pervWalkspeed;
                if(player.Character) {
                    player.Character.SetAttribute("VitaminsActivated", false);
                    player.Character.SetAttribute("LastVitaminsActivated", os.time());
                }
            }
        })

        this.attributes.stack -= 1;
        if(this.attributes.stack <= 0) {
            this.destroy();
        }
    }

    private getPlayerVitamins(player: Player): number {
        if(!player) { return 0; }
        if(!player.Character) { return 0; }

        let vitaminsTool: Tool | undefined = super.getPlayerTool(player, "Vitamins");
        if(!vitaminsTool) { return 0;}

        const currentStackValue: AttributeValue | undefined = vitaminsTool.GetAttribute("stack");
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

        const vitaminsTool: Tool | undefined = super.getPlayerTool(player, "Vitamins");
        if(!vitaminsTool) { return; }

        const currentStackValue: AttributeValue | undefined = vitaminsTool.GetAttribute("stack");
        if(!currentStackValue) { return; }
        const currentStack: number | undefined = tonumber(currentStackValue);
        if(currentStack) {
            vitaminsTool.SetAttribute("stack", currentStack + 1);
        }
    }

    destroy(): void {
        super.destroy();
        if(this.activateConnection) {
            this.activateConnection.Disconnect();
        }
        this.instance.Destroy();
    }
}