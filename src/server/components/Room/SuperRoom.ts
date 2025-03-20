import { BaseComponent } from "@flamework/components/out/baseComponent";
import { Component } from "@flamework/components/out/components";
import { OnStart } from "@flamework/core/out/flamework";
import { Zone } from "@rbxts/zone-plus";
import { Drawer } from "../Furniture/ItemSlots/Drawer";
import { Key } from "../Items/Key";
import { AudioService } from "server/services/AudioService";
import { AccentLamp } from "../Lamp/AccentLamp";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "../Furniture/Doors/SuperDoor";
import { Wardrobe } from "../Furniture/HidingSpots/Wardrobe";
import { Bed } from "../Furniture/HidingSpots/Bed";
import { LockedDoor } from "../Furniture/Doors/LockedDoor";

export interface IRoomComponent extends Instance {
    Build: Model;
    Markers: Instance & {
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
    Forniture: Folder;
    Monster: Folder & {
        Rush: Folder & {
            Waypoints: Folder;
        }
    };
}

export interface IRoomAttributes {
    readonly DIRECTION: "LEFT" | "RIGHT" | "UP" | "DOWN" | "STRAIGHT" | "BACKWARDS";
    Number: number;
}

@Component()
export class SuperRoom<A extends IRoomAttributes, I extends IRoomComponent> extends BaseComponent<A, I> implements OnStart {
    protected audioService: AudioService | undefined;
    protected doorsComponent: SuperDoor<IDoorAttributes, IDoorComponent> | undefined;
    protected zone: Zone | undefined;
    protected drawers: Drawer[] = [];
    protected wardrobes: Wardrobe[] = [];
    protected beds: Bed[] = [];
    protected accentLamps: AccentLamp[] = [];
    protected keyComponent: Key | undefined;

    constructor() {
        super();
    }

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

    public getDrawers(): Drawer[] {
        return this.drawers;
    }

    public addWardrobe(wardrobe: Wardrobe) {
        this.wardrobes.push(wardrobe);
    }

    public addBed(bed: Bed) {
        this.beds.push(bed);
    }

    public addAccentLamp(accentLamp: AccentLamp) {
        this.accentLamps.push(accentLamp);
    }

    public getDoor(): SuperDoor<IDoorAttributes, IDoorComponent> | undefined {
        return this.doorsComponent;
    }

    public getAccentLamps(): AccentLamp[] {
        return this.accentLamps;
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

    public getRushWaypoints(): Folder {
        return this.instance.Monster.Rush.Waypoints;
    }

    
    public flickerLamps(): void {
        this.accentLamps.forEach((accentLamp) => {
            accentLamp.flicker();
        });
    }
}