import { Component, Components } from "@flamework/components";
import { ServerStorage } from "@rbxts/services";
import { Dependency } from "@flamework/core";
import { LockedDoor } from "../LockedDoor";
import { Logger } from "@rbxts/log/out/Logger";
import { Key } from "../Items/Key";
import { IRoomAttributes, IRoomComponent, SuperRoom } from "./SuperRoom";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "../Items/AbstractToolBaseComponent";
import { Drawer } from "../Drawer";
import { Slot } from "../Furniture/Slot";

interface IRegularRoomComponent extends IRoomComponent {
    Build: Model;
    Markers: Instance & {
        Entrance: BasePart,
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
    Forniture: Folder;
}

@Component({
    tag: "Room",
})
export class Room extends SuperRoom <IRoomAttributes, IRegularRoomComponent> {
    constructor(private readonly logger: Logger) {
        super();
    }

    public addItem(item: AbstractToolBaseComponent<IToolAttributes, IToolComponent>): Slot | undefined {
        if(!this.drawers) { return; }
        if(this.drawers.size() <= 0) { return; }
        
        const randomDrawer = this.drawers[math.random(0, this.drawers.size() - 1)];
        const freeSlots: Slot[] = randomDrawer.getFreeSlots();
        if(freeSlots.size() === 0) { return; }

        const randomSlot: Slot = freeSlots[math.random(0, freeSlots.size() -1)];
        randomSlot.setItem(item);

        return randomSlot;
    }

    public hasFreeItemSlots(): boolean {
        this.drawers.forEach(drawer => {
            if(drawer.getFreeSlots().size() > 0) {
                return true;
            }
        });

        return false;
    }

    public lock(): void {
        if(this.drawers.size() === 0) {
            this.logger.Info("Room doesn't have furniture to hide key in it.");
            return;
        }
        if(!this.hasFreeItemSlots()) {
            this.logger.Info("Room doesn't have free item slots to hide key in it.");
        }
        const components = Dependency<Components>();        
		const newKey = ServerStorage.Tools.Key.Clone();

        components.onComponentAdded<Key>((key) => {
            key.instance.Handle;
            if(key.instance === newKey) {
                const slot: Slot | undefined = this.addItem(key);
                if(!slot) { return; }
                
                key.setNumber(this.attributes.Number);
                key.activateProximityPromt();
                key.weldOnTo(slot.instance);
            }
        })
        this.keyComponent = components.addComponent<Key>(newKey);

        this.createLockedDoor();
    }
    
    private createLockedDoor(): void {
        if(this.instance.FindFirstChild("Locked")) { return; }
        
        let number = 0;
        if(this.doorsComponent) {
            number = this.doorsComponent.attributes.Number;
            this.doorsComponent.instance.Destroy();
            this.doorsComponent.destroy();
        }

        const components = Dependency<Components>();
        const lockedDoor = ServerStorage.Doors.Locked.Clone();
        lockedDoor.PivotTo(this.instance.Markers.Exit.CFrame);
        lockedDoor.Parent = this.instance;
        components.waitForComponent<LockedDoor>(lockedDoor).then((value) => {
            this.doorsComponent = value;
        });
    }
}