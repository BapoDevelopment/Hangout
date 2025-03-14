import { Components } from "@flamework/components/out/components";
import { Dependency, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { CollectionService, ServerStorage } from "@rbxts/services";
import { Bed } from "server/components/Bed";
import { Drawer } from "server/components/Drawer";
import { Flashlight } from "server/components/Items/Flashlight";
import { AccentLamp } from "server/components/Lamp/AccentLamp";
import { RegularDoor } from "server/components/RegularDoor";
import { Room } from "server/components/Room/Room";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/SuperDoor";
import { Wardrobe } from "server/components/Wardrobe";
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
                const components = Dependency<Components>();
                
                if(!placeholder.IsA("BasePart")) { 
                    this.logger.Warn("Instance " + tostring(placeholder) + " is tagged with " + tostring(tag) + " but is not a BasePart.");
                    return;
                }

                let forniture: Model | undefined;

                switch (tag) {
                    case "DrawerPlaceholder":                
                        forniture = ServerStorage.Furniture.Drawer.Clone();
                        break;
                    case "WardrobePlaceholder":
                        forniture = ServerStorage.Furniture.Wardrobe.Clone();
                        break;
                    case "BedPlaceholder":
                        forniture = ServerStorage.Furniture.Bed.Clone();
                        break;
                    case "AccentLampPlaceholder":
                        forniture = ServerStorage.Furniture.AccentLamp.Clone();
                    default:
                        break;
                }

                if(!forniture) {
                    return;
                }
                forniture.PivotTo(placeholder.CFrame);
                forniture.Parent = room.instance;
                placeholder.Transparency = 1;

                switch (tag) {
                    case "DrawerPlaceholder":                
                        components.waitForComponent<Drawer>(forniture).then((value) => {
                            room.addDrawer(value);
                        });
                        break;
                    case "WardrobePlaceholder":
                        components.waitForComponent<Wardrobe>(forniture).then((value) => {
                            room.addWardrobe(value);
                        });
                        break;
                    case "BedPlaceholder":
                        components.waitForComponent<Bed>(forniture).then((value) => {
                            room.addBed(value);
                        });
                        break;
                    case "AccentLampPlaceholder":
                        components.waitForComponent<AccentLamp>(forniture).then((value) => {
                            room.addAccentLamp(value);
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

    public addRandomItems(room: Room): void {
        const drawers: Drawer[] = room.getDrawers();
        if(!drawers) { return; }
        if(drawers.size() <= 0) { return; }
        
        const randomDrawer = drawers[math.random(0, drawers.size() - 1)];
        if(!randomDrawer.isTopItemLocationFree() && !randomDrawer.isBottomItemLocationFree()) { return; }
        
        const components = Dependency<Components>();
        if(math.random() * 100 <= ServerSettings.ITEMS.FLASHLIGHT.SPAWN_RATE_IN_PERCENT) {

            const newFlashlight = ServerStorage.Tools.Flashlight.Clone();
            components.onComponentAdded<Flashlight>((flashlight) => {
                if(flashlight.instance === newFlashlight) {
                    newFlashlight.PivotTo(new CFrame(randomDrawer.getTopItemLocationAttachment().WorldPosition).mul(CFrame.fromEulerAnglesXYZ(math.rad(90), 0, math.rad(-90))));
                    newFlashlight.Parent = randomDrawer.getTopItemLocationAttachment();
                    
                    flashlight.activateProximityPromt();
                    flashlight.weldOnTo(randomDrawer.instance.TopDraw.Plate);
                }
            })
            components.addComponent<Flashlight>(newFlashlight);
        }
    }
}