import { Components } from "@flamework/components/out/components";
import { Dependency, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { CollectionService, ServerStorage } from "@rbxts/services";
import { Drawer } from "server/components/Drawer";
import { RegularDoor } from "server/components/RegularDoor";
import { Room } from "server/components/Room/Room";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/SuperDoor";
import { ServerSettings } from "server/ServerSettings";

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
                
                        const newDrawer = ServerStorage.Furniture.Drawer.Clone();
                        if(!placeholder.IsA("BasePart")) { 
                            this.logger.Warn("Instance " + tostring(placeholder) + " is tagged with " + tostring(tag) + " but is not a BasePart.");
                            break; 
                        }
                        newDrawer.PivotTo(placeholder.CFrame);
                        newDrawer.Parent = room.instance;
                        placeholder.Transparency = 1;

                        components.waitForComponent<Drawer>(newDrawer).then((value) => {
                            room.addDrawer(value);
                        });
                        break;
                    default:
                        break;
                }
            });
        });
        if(math.random() * 100 < ServerSettings.ROOMS.DOOR_LOCKED_PROBABILITY) {
            room.lock();
        }
    }
}