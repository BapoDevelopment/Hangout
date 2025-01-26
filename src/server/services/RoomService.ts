import { Components } from "@flamework/components/out/components";
import { Dependency, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { CollectionService, ServerStorage } from "@rbxts/services";
import { Drawer } from "server/components/Drawer";
import { RegularDoor } from "server/components/RegularDoor";
import { Room } from "server/components/Room/Room";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/SuperDoor";

@Service()
export class RoomService {
    private components: Components;
    
    constructor(private readonly logger: Logger) {
        this.components = Dependency<Components>();
    }

    public addRegularDoor(room: Room): void {
        const newDoor = ServerStorage.Doors.Regular.Clone();
        newDoor.PivotTo(room.instance.Markers.Exit.CFrame);
        newDoor.Parent = room.instance;

        const doorsComponent: SuperDoor<IDoorAttributes, IDoorComponent> = this.components.addComponent<RegularDoor>(newDoor);
        room.setDoor(doorsComponent);
    }

    public furniture(room: Room) {
        room.instance.Forniture.GetChildren().forEach(placeholder => {
            CollectionService.GetTags(placeholder).forEach(tag => {
                switch (tag) {
                    case "DrawerPlaceholder":
                        const components = Dependency<Components>();
                        components.onComponentAdded<Drawer>((value, instance) => { this.onDrawerAdded(newDrawer, value, instance, room) });
                
                        const newDrawer = ServerStorage.Furniture.Drawer.Clone();
                        if(!placeholder.IsA("BasePart")) { 
                            this.logger.Warn("Instance " + tostring(placeholder) + " is tagged with " + tostring(tag) + " but is not a BasePart.");
                            break; 
                        }
                        newDrawer.PivotTo(placeholder.CFrame);
                        newDrawer.Parent = room.instance;
                        placeholder.Transparency = 1;

                        break;
                    default:
                        break;
                }
            });
        });
    }

    private onDrawerAdded(newDrawer: Model, value: Drawer, instance: Instance, room: Room) {
        if(instance === newDrawer) {
            room.addDrawer(value);
            if(math.round(math.random(0, 1)) === 1) {
                room.lock();
            }
        }
    }
}