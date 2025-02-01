import { BaseComponent } from "@flamework/components/out/baseComponent";
import { Component } from "@flamework/components/out/components";
import { OnStart } from "@flamework/core/out/flamework";
import { Zone } from "@rbxts/zone-plus";
import { Drawer } from "../Drawer";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "../SuperDoor";
import { LockedDoor } from "../LockedDoor";
import { Key } from "../Key";

export interface IRoomComponent extends Instance {
    Build: Model;
    Markers: Instance & {
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
    Forniture: Folder;
}

export interface IRoomAttributes {
    readonly DIRECTION: "LEFT" | "RIGHT" | "UP" | "DOWN" | "STRAIGHT" | "BACKWARDS";
    Number: number;
}

@Component()
export class SuperRoom<A extends IRoomAttributes, I extends IRoomComponent> extends BaseComponent<A, I> implements OnStart {
    protected doorsComponent: SuperDoor<IDoorAttributes, IDoorComponent> | undefined;
    protected zone: Zone | undefined;
    protected drawers: Drawer[] = [];
    protected keyComponent: Key | undefined;

    onStart() {
        const roomModel = this.instance;
        if (roomModel.IsA("Model")) {
            this.zone = new Zone(this.instance.Zone);
        }
    }

    public setNumber(Number: number) {
        this.attributes.Number = Number;

        if(this.doorsComponent) {
            this.doorsComponent.setNumber(this.attributes.Number);
        }
    }

    /**
     * Returns a list of players that are in the room.
     */
    public getPlayers(): Player[] | undefined {
        return this.zone?.getPlayers();
    }

    public addDrawer(drawer: Drawer) {
        this.drawers.push(drawer);
    }

    public setDoor(door: SuperDoor<IDoorAttributes, IDoorComponent>) {
        this.doorsComponent = door;
    }

    public isLocked(): boolean {
        return this.doorsComponent instanceof LockedDoor;
    }

    public getName(): string {
        return this.instance.Name;
    }

    public destroy(): void {
        super.destroy();
        this.doorsComponent?.destroy();
        this.keyComponent?.destroy();
        this.zone?.destroy();
        this.drawers.forEach(drawer => {
            drawer.destroy();
        });
        this.instance.Destroy();
    }
}