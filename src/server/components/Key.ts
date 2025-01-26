import { Component, BaseComponent } from "@flamework/components";
import { Flamework, OnStart } from "@flamework/core";

interface IKeyComponent extends Instance {
    Handle: MeshPart;
}

interface IKeyAttributes {
    Door: number;
}

const instanceGuard = Flamework.createGuard<IKeyComponent>();

@Component({
    tag: "Key",
    instanceGuard: instanceGuard,
})
export class Key extends BaseComponent<IKeyAttributes, IKeyComponent> implements OnStart{
    
    onStart(): void {
        
    }

    public setNumber(Number: number): void {
        this.attributes.Door = Number;
        this.instance.SetAttribute("Door", Number);
        print("Set key number: " + tostring(Number));
    }
}