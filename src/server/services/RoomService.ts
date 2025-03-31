import { Components } from "@flamework/components/out/components";
import { Dependency, Service } from "@flamework/core";
import { Logger } from "@rbxts/log/out/Logger";
import { CollectionService, ServerStorage } from "@rbxts/services";
import { AbstractToolBaseComponent, IToolAttributes, IToolComponent } from "server/components/Items/Tools/AbstractToolBaseComponent";
import { RegularDoor } from "server/components/Furniture/Doors/RegularDoor";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/Furniture/Doors/SuperDoor";
import { Bed } from "server/components/Furniture/HidingSpots/Bed";
import { Wardrobe } from "server/components/Furniture/HidingSpots/Wardrobe";
import { Drawer } from "server/components/Furniture/ItemSlots/Drawer";
import { Slot } from "server/components/Furniture/ItemSlots/Slot";
import { Battery } from "server/components/Items/Tools/Battery";
import { Flashlight } from "server/components/Items/Tools/Flashlight";
import { Lighter } from "server/components/Items/Tools/Lighter";
import { Lockpick } from "server/components/Items/Tools/Lockpick";
import { Vitamins } from "server/components/Items/Tools/Vitamins";
import { AccentLamp } from "server/components/Lamp/AccentLamp";
import { Room } from "server/components/Room/Room";
import { ServerSettings } from "server/ServerSettings";
import { Unpickable } from "server/components/Items/Unpickable";
import { Cash } from "server/components/Items/Cash";
import { Table } from "server/components/Furniture/ItemSlots/Table";

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
                    case "TablePlaceholder":
                        forniture = ServerStorage.Furniture.Table.Clone();
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
                    case "TablePlaceholder":
                        components.waitForComponent<Table>(forniture).then((value) => {
                            room.addTable(value);
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
        let freeSlots: Slot[] = this.getFreeSlots(room);
        
        const cumulativeProbability: number = ServerSettings.ITEMS.TOOLS.CATEGORY_SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.UNPICKABLE.CATEGORY_SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.CASH.CATEGORY_SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.EMPTY.CATEGORY_SPAWN_RATE_IN_PERCENT

        freeSlots.forEach(slot => {
            if(slot.isReserved()) { return; }

            const rand: number = math.random() * cumulativeProbability;
            let currentProbability: number = 0;

            currentProbability += ServerSettings.ITEMS.TOOLS.CATEGORY_SPAWN_RATE_IN_PERCENT;
            if(rand <= currentProbability) {
                this.addTool(slot);
            }
            currentProbability += ServerSettings.ITEMS.UNPICKABLE.CATEGORY_SPAWN_RATE_IN_PERCENT;
            if(rand <= currentProbability) {
                this.addUnpickable(slot);
            }
            currentProbability += ServerSettings.ITEMS.CASH.CATEGORY_SPAWN_RATE_IN_PERCENT;
            if(rand <= currentProbability) {
                this.addCash(slot);
            }
        });
    }

    public addTool(slot: Slot): void {
        if(slot.isReserved()) { return; }

        const components = Dependency<Components>();

        let cumulativeProbability: number = ServerSettings.ITEMS.TOOLS.FLASHLIGHT.SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.TOOLS.BATTERY.SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.TOOLS.LIGHTER.SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.TOOLS.VITAMINS.SPAWN_RATE_IN_PERCENT
        + ServerSettings.ITEMS.TOOLS.LOCKPICK.SPAWN_RATE_IN_PERCENT;       
        const rand: number = math.random() * cumulativeProbability;
        let currentProbability: number = 0;

        currentProbability += ServerSettings.ITEMS.TOOLS.FLASHLIGHT.SPAWN_RATE_IN_PERCENT;
        if(rand <= currentProbability) {
            const newFlashlight = ServerStorage.Tools.Flashlight.Clone();
            slot.reserve();
            components.onComponentAdded<Flashlight>((flashlight) => {
                this.placeItem(newFlashlight, flashlight, slot);
            })
            components.addComponent<Flashlight>(newFlashlight);
            return;
        }
        currentProbability += ServerSettings.ITEMS.TOOLS.BATTERY.SPAWN_RATE_IN_PERCENT;
        if(rand <= currentProbability) {
            const newBattery = ServerStorage.Tools.Battery.Clone();
            slot.reserve();
            components.onComponentAdded<Battery>((battery) => {
                this.placeItem(newBattery, battery, slot);
            })
            components.addComponent<Battery>(newBattery);
            return;
        }
        currentProbability += ServerSettings.ITEMS.TOOLS.LIGHTER.SPAWN_RATE_IN_PERCENT;
        if(rand <= currentProbability) {
            const newLighter = ServerStorage.Tools.Lighter.Clone();
            slot.reserve();
            components.onComponentAdded<Lighter>((lighter) => {
                this.placeItem(newLighter, lighter, slot);
            })
            components.addComponent<Lighter>(newLighter);
            return;
        }
        currentProbability += ServerSettings.ITEMS.TOOLS.VITAMINS.SPAWN_RATE_IN_PERCENT;
        if(rand <= currentProbability) {
            const newVitamins = ServerStorage.Tools.Vitamins.Clone();
            slot.reserve();
            components.onComponentAdded<Vitamins>((vitamins) => {
                this.placeItem(newVitamins, vitamins, slot);
            })
            components.addComponent<Vitamins>(newVitamins);
            return;
        }
        currentProbability += ServerSettings.ITEMS.TOOLS.LOCKPICK.SPAWN_RATE_IN_PERCENT;
        if(rand <= currentProbability) {
            const newLockpick = ServerStorage.Tools.Lockpick.Clone();
            slot.reserve();
            components.onComponentAdded<Lockpick>((lockpick) => {
                this.placeItem(newLockpick, lockpick, slot);
            })
            components.addComponent<Lockpick>(newLockpick);
            return;
        }
    }

    private placeItem(tool: Tool, component: AbstractToolBaseComponent<IToolAttributes, IToolComponent>, slot: Slot): void {
        if(component.instance === tool) {
            if(slot.getItem() !== undefined) {
                component.destroy();
                this.logger.Warn("There should be free item slots, but there are none.");
                return;
            }
            slot.setItem(component);
            component.activateProximityPromt();
            component.weldOnTo(slot.instance);
        }
    }

    private getFreeSlots(room: Room): Slot[] {
        const drawers: Drawer[] = room.getDrawers();
        let freeSlots: Slot[] = new Array<Slot>();

        drawers.forEach(drawer => {
            drawer.getFreeSlots().forEach(slot => {
                freeSlots.push(slot);
            })
        });

        const tables: Table[] = room.getTables();
        tables.forEach(currentTable => {
            currentTable.getFreeSlots().forEach(slot => {
                freeSlots.push(slot);
            })
        });
        
        return freeSlots;
    }

    public addUnpickable(slot: Slot): void {
        if(slot.isReserved()) { return; }

        const tools: Folder = ServerStorage.FindFirstChild("Tools") as Folder;
        if(!tools) { this.logger.Warn("Tools folder not found"); return; }
        const unpickables: Folder = tools.FindFirstChild("Unpickables") as Folder;
        if(!unpickables) { this.logger.Warn("Unpickables folder not found"); return; }

        let newUnpickable: Tool = unpickables.GetChildren()[math.random(0, unpickables.GetChildren().size() -1)] as Tool;
        if(!newUnpickable) { return; }
        slot.reserve();
        newUnpickable = newUnpickable.Clone();

        const components = Dependency<Components>();
        components.onComponentAdded<Unpickable>((unpickable) => {
            this.placeItem(newUnpickable, unpickable, slot);
        })
        components.addComponent<Unpickable>(newUnpickable);
        return;
    }

    public addCash(slot: Slot): void {
        if(slot.isReserved()) { return; }

        const tools: Folder = ServerStorage.FindFirstChild("Tools") as Folder;
        if(!tools) { this.logger.Warn("Tools folder not found"); return; }
        const cashFolder: Folder = tools.FindFirstChild("Cash") as Folder;
        if(!cashFolder) { this.logger.Warn("Cash folder not found"); return; }

        let newCash: Tool = cashFolder.GetChildren()[math.random(0, cashFolder.GetChildren().size() -1)] as Tool;
        if(!newCash) { return; }
        slot.reserve();
        newCash = newCash.Clone();

        const components = Dependency<Components>();
        components.onComponentAdded<Cash>((cash) => {
            this.placeItem(newCash, cash, slot);
        })
        components.addComponent<Cash>(newCash);
        return;   
    }
}