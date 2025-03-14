import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";

export interface IToolComponent extends Tool {
    Handle: MeshPart & {
        ProximityPromtPosition: Attachment;
        ProximityPrompt: ProximityPrompt;
        WeldConstraint: WeldConstraint;
    };
}

export interface IToolAttributes {}

@Component()
export abstract class AbstractToolBaseComponent<A extends IToolAttributes, I extends IToolComponent> extends BaseComponent<A, I> implements OnStart {

    constructor(protected readonly logger: Logger) {
        super();
    }

    onStart(): void {
        
    }

    public weldOnTo(part: BasePart): void {
        if(!part || !part.IsA("BasePart")) {
            this.logger.Warn(`Item couldn't be welded onto ${part}`);
            return;
        }
        
        this.instance.Handle.WeldConstraint.Part1 = part;
        this.instance.Handle.WeldConstraint.Enabled = true;
    }

    public activateProximityPromt(): void {
        this.instance.Handle.ProximityPrompt.Enabled = true;
    }

    public deactivateProximityPromt(): void {
        this.instance.Handle.ProximityPrompt.Enabled = false;
    }

    protected onProximityPromtActivated(player: Player): void {
        if(player.Character) {
            this.deactivateProximityPromt();
            this.instance.Handle.WeldConstraint.Enabled = false;
            this.equipTool(player);
        }
        return;
    }

    protected equipTool(player: Player): void {
        this.instance.Handle.Anchored = false;
        this.instance.Handle.CanCollide = false;

        if(player.Character) {
            this.instance.Parent = player.Character;
        }
    }
}