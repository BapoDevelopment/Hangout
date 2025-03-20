import { Component, BaseComponent } from "@flamework/components";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "../Items/AbstractToolBaseComponent";
import { Logger } from "@rbxts/log/out/Logger";

export interface ISlotComponent extends BasePart {
    ItemLocation: Attachment;
}

@Component({
    tag: "Slot",
})
export class Slot extends BaseComponent<{}, ISlotComponent> {

    private storedItem: AbstractToolBaseComponent<IToolAttributes, IToolComponent> | undefined;

    constructor(private readonly logger: Logger) {
        super();
    }

    public isFree(): boolean {
        return this.storedItem === undefined;
    }

    public getItem(): AbstractToolBaseComponent<IToolAttributes, IToolComponent> | undefined {
        return this.storedItem;
    }

    public setItem(item: AbstractToolBaseComponent<IToolAttributes, IToolComponent>): boolean {
        if (!this.isFree()) {
            this.logger.Debug("Slot already occupied ");
            return false;
        }
        
        this.storedItem = item;
        item.instance.PivotTo(new CFrame(this.instance.ItemLocation.WorldPosition));
        item.instance.Parent = this.instance.ItemLocation;
        return true;
    }

    public removeItem(): void {
        this.storedItem = undefined;
    }
}
