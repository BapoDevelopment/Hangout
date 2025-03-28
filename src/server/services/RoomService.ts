import { Components } from "@flamework/components/out/components";
import { Dependency, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { CollectionService, ServerStorage } from "@rbxts/services";
import { RegularDoor } from "server/components/Furniture/Doors/RegularDoor";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/Furniture/Doors/SuperDoor";
import { Bed } from "server/components/Furniture/HidingSpots/Bed";
import { Wardrobe } from "server/components/Furniture/HidingSpots/Wardrobe";
import { Drawer } from "server/components/Furniture/ItemSlots/Drawer";
import { Slot } from "server/components/Furniture/ItemSlots/Slot";
import { Battery } from "server/components/Items/Battery";
import { Flashlight } from "server/components/Items/Flashlight";
import { Lighter } from "server/components/Items/Lighter";
import { Vitamins } from "server/components/Items/Vitamins";
import { AccentLamp } from "server/components/Lamp/AccentLamp";
import { Room } from "server/components/Room/Room";
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
        let freeSlots: Slot[] = randomDrawer.getFreeSlots();
        if(freeSlots.size() === 0) { return; }
        
        const components = Dependency<Components>();
        if(math.random() * 100 <= ServerSettings.ITEMS.FLASHLIGHT.SPAWN_RATE_IN_PERCENT) {

            const newFlashlight = ServerStorage.Tools.Flashlight.Clone();
            components.onComponentAdded<Flashlight>((flashlight) => {
                if(flashlight.instance === newFlashlight) {
                    freeSlots = randomDrawer.getFreeSlots();
                    if(freeSlots.size() === 0) {
                        flashlight.destroy();
                        this.logger.Warn("There should be free item slots, but there are none.");
                        return;
                    }
                    const randomSlot: Slot = freeSlots[math.random(0, freeSlots.size() -1)];
                    randomSlot.setItem(flashlight);
                    flashlight.activateProximityPromt();
                    flashlight.weldOnTo(randomSlot.instance);
                }
            })
            components.addComponent<Flashlight>(newFlashlight);
        }
        if(math.random() * 100 <= ServerSettings.ITEMS.BATTERY.SPAWN_RATE_IN_PERCENT) {

            const newBattery = ServerStorage.Tools.Battery.Clone();
            components.onComponentAdded<Battery>((battery) => {
                if(battery.instance === newBattery) {
                    freeSlots = randomDrawer.getFreeSlots();
                    if(freeSlots.size() === 0) {
                        battery.destroy();
                        this.logger.Warn("There should be free item slots, but there are none.");
                        return;
                    }
                    const randomSlot: Slot = freeSlots[math.random(0, freeSlots.size() -1)];
                    randomSlot.setItem(battery);
                    battery.activateProximityPromt();
                    battery.weldOnTo(randomSlot.instance);
                }
            })
            components.addComponent<Battery>(newBattery);
        }
        if(math.random() * 100 <= ServerSettings.ITEMS.LIGHTER.SPAWN_RATE_IN_PERCENT) {

            const newLighter = ServerStorage.Tools.Lighter.Clone();
            components.onComponentAdded<Lighter>((lighter) => {
                if(lighter.instance === newLighter) {
                    freeSlots = randomDrawer.getFreeSlots();
                    if(freeSlots.size() === 0) {
                        lighter.destroy();
                        this.logger.Warn("There should be free item slots, but there are none.");
                        return;
                    }
                    const randomSlot: Slot = freeSlots[math.random(0, freeSlots.size() -1)];
                    randomSlot.setItem(lighter);
                    lighter.activateProximityPromt();
                    lighter.weldOnTo(randomSlot.instance);     
                }
            })
            components.addComponent<Lighter>(newLighter);
        }
        if(math.random() * 100 <= ServerSettings.ITEMS.VITAMINS.SPAWN_RATE_IN_PERCENT) {
            const newVitamins = ServerStorage.Tools.Vitamins.Clone();
            components.onComponentAdded<Vitamins>((vitamins) => {
                if(vitamins.instance === newVitamins) {
                    freeSlots = randomDrawer.getFreeSlots();
                    if(freeSlots.size() === 0) {
                        vitamins.destroy();
                        this.logger.Warn("There should be free item slots, but there are none.");
                        return;
                    }
                    const randomSlot: Slot = freeSlots[math.random(0, freeSlots.size() -1)];
                    randomSlot.setItem(vitamins);
                    vitamins.activateProximityPromt();
                    vitamins.weldOnTo(randomSlot.instance);
                }
            })
            components.addComponent<Vitamins>(newVitamins);
        }
    }
}