import { Component, BaseComponent, Components } from "@flamework/components";
import { ServerStorage } from "@rbxts/services";
import { Dependency, Flamework, OnStart } from "@flamework/core";
import { Door } from "./Doors";

interface IRoomComponent extends Instance {
    Build: Model;
    Markers: Instance & {
        Entrance: BasePart,
        Exit: BasePart
    };
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

    onStart() {
        const roomModel = this.instance;
        if (roomModel.IsA("Model")) {
            this.createDoor();
        } else {
            warn("The instance '" + tostring(roomModel) + "' is not a Model!");
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
            warn("Door component not initialised.")
        }      
        print("i'm room: " + tostring(this.attributes.Number) + " and my door comp is: " + tostring(this.doorsComponent) + " my door model is: " + tostring(this.doorsComponent?.instance));
    }
}