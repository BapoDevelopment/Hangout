import { Component, BaseComponent, Components } from "@flamework/components";
import { ServerStorage } from "@rbxts/services";
import { Dependency, Flamework, OnStart } from "@flamework/core";
import { Door } from "./Doors";
import { Logger } from "@rbxts/log/out/Logger";
import Zone from "@rbxts/zone-plus/src/Zone";

interface IRoomComponent extends Instance {
    Build: Model;
    Markers: Instance & {
        Entrance: BasePart,
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
}
const instanceGuard = Flamework.createGuard<IRoomComponent>();

interface IRoomAttributes {
    readonly DIRECTION: "LEFT" | "RIGHT" | "UP" | "DOWN" | "STRAIGHT" | "BACKWARDS";
    Number: number;
}

@Component({
    tag: "Room",
    instanceGuard: instanceGuard,
})
export class Room extends BaseComponent <IRoomAttributes, IRoomComponent> implements OnStart {
    private doorsComponent: Door | undefined;
    private zone: Zone | undefined;

    constructor(private readonly logger: Logger) {
        super();
    }

    onStart() {
        const roomModel = this.instance;
        if (roomModel.IsA("Model")) {
            this.zone = new Zone(this.instance.Zone);
            this.createDoor();
        } else {
            this.logger.Warn("The instance '" + tostring(roomModel) + "' is not a Model!");
        }
    }

    private createDoor() {
        const components = Dependency<Components>();
        components.onComponentAdded<Door>((value, instance) => {
            if(instance === newDoor) {
                this.doorsComponent = value;
            }
        });

		const newDoor = ServerStorage.Doors.Regular.Clone();
		newDoor.PivotTo(this.instance.Markers.Exit.CFrame);
		newDoor.Parent = this.instance;

        this.doorsComponent = components.addComponent<Door>(newDoor);
    }

    public setNumber(Number: number) {
        this.attributes.Number = Number;

        if(this.doorsComponent) {
            this.doorsComponent.setNumber(this.attributes.Number);
        } else {
            this.logger.Warn("Door component " + tostring(Number) + "not initialised.")
        }
        this.logger.Debug("Generated Room: " + tostring(this.attributes.Number)
                        + " with Door Component: " + tostring(this.doorsComponent)
                        + " with Door Model: " + tostring(this.doorsComponent?.instance));
    }

    /**
     * Returns a list of players that are in the room.
     */
    public getPlayers(): Player[] | undefined {
        return this.zone?.getPlayers();
    }
}