import { Component, Components } from "@flamework/components";
import { ServerStorage } from "@rbxts/services";
import { Dependency } from "@flamework/core";
import { LockedDoor } from "../LockedDoor";
import { Logger } from "@rbxts/log/out/Logger";
import { Key } from "../Key";
import { IRoomAttributes, IRoomComponent, SuperRoom } from "./SuperRoom";

interface IRegularRoomComponent extends IRoomComponent {
    Build: Model;
    Markers: Instance & {
        Entrance: BasePart,
        Exit: BasePart
        TeleportPosition: BasePart
    };
    Zone: Model;
    Forniture: Folder;
}

@Component({
    tag: "Room",
})
export class Room extends SuperRoom <IRoomAttributes, IRegularRoomComponent> {
    constructor(private readonly logger: Logger) {
        super();
    }

    public lock(): void {
        if(this.drawers.size() === 0) {
            this.logger.Info("Room doesn't have furniture to hide lock in it.");
            return;
        }
        const components = Dependency<Components>();

        const hidingSpotIndex = math.random(0, this.drawers.size() - 1);
        const hidingSpotDrawer = this.drawers[hidingSpotIndex];
        if(hidingSpotDrawer.instance.TopDraw.Plate.ItemLocation.FindFirstChild("Key")) {
            this.logger.Info("Drawer already has a Key.");
            return;
        }
        
		const newKey = ServerStorage.Tools.Key.Clone();
        newKey.SetAttribute("Door", this.attributes.Number);
        newKey.PivotTo(new CFrame(hidingSpotDrawer.instance.TopDraw.Plate.ItemLocation.WorldPosition).mul(CFrame.fromEulerAnglesXYZ(math.rad(90), 0, math.rad(-90))));
        
        let weld: WeldConstraint = new Instance("WeldConstraint") as WeldConstraint;
        weld.Part0 = newKey.Handle;
        weld.Part1 = hidingSpotDrawer.instance.TopDraw.Plate;
        weld.Parent = hidingSpotDrawer.instance.TopDraw.Plate;

        newKey.Handle.ProximityPrompt.Triggered.Connect((player) => {
            newKey.Handle.Anchored = false;
            newKey.Handle.CanCollide = false;
            newKey.Enabled = true;

            if(player.Character) {
                weld.Destroy();
                newKey.Handle.ProximityPrompt.Destroy();
                newKey.Parent = player.Character;
            }
        });

        this.keyComponent = components.addComponent<Key>(newKey);
        newKey.Parent = hidingSpotDrawer.instance.TopDraw.Plate.ItemLocation;
        this.createLockedDoor();
    }

    private createLockedDoor(): void {
        if(this.instance.FindFirstChild("Locked")) { return; }
        
        let number = 0;
        if(this.doorsComponent) {
            number = this.doorsComponent.attributes.Number;
            this.doorsComponent.instance.Destroy();
            this.doorsComponent.destroy();
        }

        const components = Dependency<Components>();
        const lockedDoor = ServerStorage.Doors.Locked.Clone();
        lockedDoor.PivotTo(this.instance.Markers.Exit.CFrame);
        lockedDoor.Parent = this.instance;
        components.waitForComponent<LockedDoor>(lockedDoor).then((value) => {
            this.doorsComponent = value;
        });
    }
}