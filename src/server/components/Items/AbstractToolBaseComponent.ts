import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { ToolService } from "server/services/ToolService";

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

    private stackable: number = 0;

    constructor(protected toolService: ToolService, protected readonly logger: Logger) {
        super();

        this.instance.Equipped.Connect(() => this.onEquip());
        this.instance.Unequipped.Connect(() => this.onUnequip());
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

    public isStackable(): boolean {
        return this.stackable > 0;
    }

    protected onProximityPromtActivated(player: Player): boolean {
        if(player.Character) {
            if(!this.toolService.isStackable(this, player)) { return false; }
            this.deactivateProximityPromt();
            this.instance.Handle.WeldConstraint.Enabled = false;
            return this.giveTool(player);
        }
        return false;
    }

    protected giveTool(player: Player): boolean {
        this.instance.Handle.Anchored = false;
        this.instance.Handle.CanCollide = false;

        if(player.Character) {
            const humanoid: Humanoid = player.Character.FindFirstChild("Humanoid") as Humanoid;
            if(humanoid) {
                humanoid.UnequipTools();
            }

            this.instance.Parent = player.Character;
            return true;
        }

        return false;
    }

    protected setStackable(stackable: number) {
        this.stackable = stackable;
    }

    protected onEquip(): void {
        this.logger.Info(`${this.instance} equipped.`);
    }

    protected onUnequip(): void {
        this.logger.Info(`${this.instance} unequipped.`);
    }

    protected onActivated(player: Player): void {
        this.logger.Info(`${this.instance} activated.`);
    }
}