import { Component, BaseComponent } from "@flamework/components";
import { Zone } from "@rbxts/zone-plus";
import { TweenService } from "@rbxts/services";
import { Flamework, OnStart } from "@flamework/core";
import { AudioService } from "server/services/AudioService";
import { Logger } from "@rbxts/log/out/Logger";
import { RoomGenerationService } from "server/services/RoomGenerationService";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "server/components/SuperDoor";
import { DoorState } from "server/Enum/DoorState";

interface IRegualarDoorComponent extends IDoorComponent {
    SensorPart: Part;
}

const instanceGuard = Flamework.createGuard<IRegualarDoorComponent>();

@Component({
    tag: "Door",
    instanceGuard: instanceGuard,
})
export class RegularDoor extends SuperDoor<IDoorAttributes, IRegualarDoorComponent> implements OnStart{

    constructor(protected roomGenerationService: RoomGenerationService
        , protected audioService: AudioService
        , protected readonly logger: Logger) {
        super();
        this.audioService = audioService;
        this.roomGenerationService = roomGenerationService;
    }

    onStart() {
        const doorModel = this.instance;

        if(doorModel) {
            if (doorModel.IsA("Model")) {
                const sensorZone = new Zone(this.instance.SensorPart);
                sensorZone.playerEntered.Connect((player: Player) => this.handleSensor(player));
            } else {
                this.logger.Warn("The tagged Door is not a Model!");
            }
        } else {
            this.logger.Warn("Door Model not initiliased.");
        }
    }
    
    private handleSensor(player: Player) {
        if (this.state === DoorState.UNOPEN) {
            super.openDoor(player);
        }
    }
}