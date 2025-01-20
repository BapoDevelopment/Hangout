import { Component, BaseComponent, Components } from "@flamework/components";
import { CollectionService, ServerStorage } from "@rbxts/services";
import { Dependency, Flamework, OnStart } from "@flamework/core";
import { RegularDoor } from "./RegularDoor";
import { LockedDoor } from "./LockedDoor";
import { Logger } from "@rbxts/log/out/Logger";
import Zone from "@rbxts/zone-plus/src/Zone";
import { Drawer } from "./Drawer";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "./SuperDoor";
import { Key } from "./Key";

interface IRoomComponent extends Instance {
    Build: Model;
    Markers: Instance & {
        Entrance: BasePart,
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
    Forniture: Folder;
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
    private doorsComponent: SuperDoor<IDoorAttributes, IDoorComponent> | undefined;
    private zone: Zone | undefined;
    private drawers: Drawer[] = [];
    
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

    public furniture() {
        this.instance.Forniture.GetChildren().forEach(placeholder => {
            CollectionService.GetTags(placeholder).forEach(tag => {
                switch (tag) {
                    case "DrawerPlaceholder":
                        
                    const components = Dependency<Components>();
                        components.onComponentAdded<Drawer>((value, instance) => {
                            if(instance === newDrawer) {
                                this.drawers.push(value);
                                if(math.round(math.random(0, 1)) === 1) {
                                    this.lock();
                                }
                            }
                        });
                
                        const newDrawer = ServerStorage.Furniture.Drawer.Clone();
                        if(!placeholder.IsA("BasePart")) { 
                            this.logger.Warn("Instance " + tostring(placeholder) + " is tagged with " + tostring(tag) + " but is not a BasePart.");
                            break; 
                        }
                        placeholder.Transparency = 1;
                        newDrawer.PivotTo(placeholder.CFrame);
                        newDrawer.Parent = this.instance;
                
                        //this.doorsComponent = components.addComponent<Door>(newDrawer);

                        break;
                    default:
                        break;
                }
            });
        });
    }

    private createDoor() {
        const components = Dependency<Components>();
        components.onComponentAdded<RegularDoor>((value, instance) => {
            if(instance === newDoor) {
                this.doorsComponent = value;
            }
        });

		const newDoor = ServerStorage.Doors.Regular.Clone();
		newDoor.PivotTo(this.instance.Markers.Exit.CFrame);
		newDoor.Parent = this.instance;

        this.doorsComponent = components.addComponent<RegularDoor>(newDoor);
    }

    public lock(): void {
        if(this.drawers.size() === 0) {
            this.logger.Info("Room doesn't have furniture to hide lock in it.");
            return;
        }

        const hidingSpotIndex = math.random(0, this.drawers.size());
        const hidingSpotDrawer = this.drawers[hidingSpotIndex];
        
        const opensDoor = this.attributes.Number;
		const newKey = ServerStorage.Tools.Key.Clone();
        newKey.CanCollide = false;
        newKey.Anchored = false;
        newKey.PivotTo(new CFrame(hidingSpotDrawer.instance.TopDraw.Plate.ItemLocation.WorldPosition));
        let weld: WeldConstraint = new Instance("WeldConstraint") as WeldConstraint;
        weld.Part0 = newKey;
        weld.Part1 = hidingSpotDrawer.instance.TopDraw.Plate;
        weld.Parent = hidingSpotDrawer.instance.TopDraw.Plate;
		
        const promt = new Instance("ProximityPrompt");
        promt.ActionText = "Get";
        promt.MaxActivationDistance = 5;
        promt.Parent = newKey;

        promt.Triggered.Connect((player) => {
            const keyTool = new Instance("Tool") as Tool;
            keyTool.SetAttribute("Door", opensDoor);
            newKey.Name = "Handle";
            newKey.Anchored = false;
            newKey.CanCollide = false;
            newKey.Parent = keyTool;
            
            const components = Dependency<Components>();
            components.onComponentAdded<Key>((value, instance) => {
                this.logger.Warn("key added");
                value.setNumber(this.attributes.Number);
            });

            if(player.Character) {
                weld.Destroy();
                promt.Destroy();
                keyTool.Parent = player.Character;
            }

            components.addComponent<Key>(keyTool);
        });
        newKey.Parent = hidingSpotDrawer.instance.TopDraw.Plate.ItemLocation;
        this.createLockedDoor();
    }

    private createLockedDoor(): void {
        let number = 0;
        if(this.doorsComponent) {
            number = this.doorsComponent.attributes.Number;
            this.doorsComponent.instance.Destroy();
            this.doorsComponent.destroy();
        }

        const components = Dependency<Components>();
        components.onComponentAdded<LockedDoor>((value, instance) => {
            if(instance === lockedDoor) {
                this.doorsComponent = value;
                this.doorsComponent.setNumber(number);
            }
        });

        const lockedDoor = ServerStorage.Doors.Locked.Clone();
        lockedDoor.PivotTo(this.instance.Markers.Exit.CFrame);
        lockedDoor.Parent = this.instance;

        this.doorsComponent = components.addComponent<LockedDoor>(lockedDoor);
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