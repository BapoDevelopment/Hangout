import { Component, BaseComponent } from "@flamework/components";
import { Logger } from "@rbxts/log/out/Logger";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "server/components/Items/Tools/AbstractToolBaseComponent";

export interface ISlotComponent extends BasePart {
    ItemLocation: Attachment;
}

@Component({
    tag: "Slot",
})
export class Slot extends BaseComponent<{}, ISlotComponent> {

    private storedItem: AbstractToolBaseComponent<IToolAttributes, IToolComponent> | undefined;
    private reserved: boolean = false;

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

    public reserve(): void {
        this.reserved = true;
    }

    public isReserved(): boolean {
        return this.reserved;
    }

    public removeItem(): void {
        this.storedItem = undefined;
    }
}
