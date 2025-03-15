import { Components } from "@flamework/components";
import { Dependency, OnStart, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "server/components/Items/AbstractToolBaseComponent";

@Service()
export class ToolService implements OnStart{
    constructor(private readonly logger: Logger) {}
    
    onStart(): void {
        this.logger.Debug("ToolService initialised.")
    }

    public isStackable(tool: AbstractToolBaseComponent<IToolAttributes, IToolComponent>, player: Player): boolean {
        if(!tool) { return false; }
        if(!player) { return false; }

        const backpack: Backpack | undefined = player.FindFirstChild("Backpack") as Backpack;
        if(!backpack) { return false; }
        let returnValue: boolean = true;
        backpack.GetChildren().forEach(element => {
            if(!element.IsA("Tool")) { return; }

            if(element.Name === tool.instance.Name) {
                returnValue = tool.isStackable();
                return;
            }
        });

        if(!player.Character) { return false; }
        const toolInHand = player.Character.FindFirstChildOfClass("Tool");
        if(toolInHand && toolInHand.Name === tool.instance.Name) {
            returnValue = tool.isStackable();
        }

        return returnValue;
    }
}
