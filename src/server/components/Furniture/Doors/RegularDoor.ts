import { Component } from "@flamework/components";
import { Zone } from "@rbxts/zone-plus";
import { OnStart } from "@flamework/core";
import { AudioService } from "server/services/AudioService";
import { Logger } from "@rbxts/log/out/Logger";
import { DoorState } from "server/Enum/DoorState";
import { GameService } from "server/services/GameService";
import { IDoorAttributes, IDoorComponent, SuperDoor } from "./SuperDoor";

interface IRegualarDoorComponent extends IDoorComponent {
    SensorPart: Part;
}

@Component({
    tag: "Door",
})
export class RegularDoor extends SuperDoor<IDoorAttributes, IRegualarDoorComponent> implements OnStart{

    constructor(protected gameService: GameService
        , protected audioService: AudioService
        , protected readonly logger: Logger) {
        super();
        this.audioService = audioService;
        this.gameService = gameService;
        this.obliterator.Add(this.instance);
    }

    onStart() {
        const doorModel = this.instance;
        if(doorModel) {
            if (doorModel.IsA("Model")) {
                const sensorZone = new Zone(this.instance.SensorPart);
                this.obliterator.Add(sensorZone.playerEntered.Connect((player: Player) => this.handleSensor(player)), "Disconnect");
            } else {
                this.logger.Warn("The tagged Door is not a Model!");
            }
        } else {
            this.logger.Warn("Door Model not initiliased.");
        }
    }
    
    private handleSensor(player: Player) {
        if (this.state === DoorState.UNOPEN) {
            super.openByPlayer(player);
        }
    }

    public destroy(): void {
        super.destroy();
        this.obliterator.Cleanup();
    }
}