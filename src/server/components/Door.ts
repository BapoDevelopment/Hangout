import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Zone } from "@rbxts/zone-plus";
import { TweenService } from "@rbxts/services";
import { AudioService } from "server/services/AudioService";

interface IDoorComponent extends Model {
    LeftDoor: Model & {
        PrimaryPart: Part;
        GoalPosition: Part;
    };
    RightDoor: Model & {
        PrimaryPart: Part;
        GoalPosition: Part;
    };
    Sensor: Part & {
        Move: Sound;
    };
}

interface IDoorAttributes {
    Players: number;
}

@Component({
    tag: "Door",
})
export class Door extends BaseComponent<IDoorAttributes, IDoorComponent> implements OnStart {

    private originalLeftPosition: CFrame = this.instance.LeftDoor.PrimaryPart.CFrame;
    private originalRightPosition: CFrame = this.instance.RightDoor.PrimaryPart.CFrame;
    
    constructor(private audioService: AudioService) {
        super();
    }

    onStart() {
        const sensorZone = new Zone(this.instance.Sensor);

        const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);
        const openLeftTween = TweenService.Create(this.instance.LeftDoor.PrimaryPart, tweenInfo, {CFrame: this.instance.LeftDoor.GoalPosition.CFrame});
        const closeLeftTween = TweenService.Create(this.instance.LeftDoor.PrimaryPart, tweenInfo, {CFrame: this.originalLeftPosition});
        const openRightTween = TweenService.Create(this.instance.RightDoor.PrimaryPart, tweenInfo, {CFrame: this.instance.RightDoor.GoalPosition.CFrame});
        const closeRightTween = TweenService.Create(this.instance.RightDoor.PrimaryPart, tweenInfo, {CFrame: this.originalRightPosition});

        sensorZone.playerEntered.Connect((player) => {
            const playersBefore: number = this.attributes.Players;
            this.attributes.Players++;
            if(playersBefore >= 1) { return; }

            openLeftTween.Play();
            openRightTween.Play();
            this.audioService.playSound(this.instance.Sensor.Move);
        });

        sensorZone.playerExited.Connect((player) => {
            this.attributes.Players--;
            if(sensorZone.getPlayers().size() === 0) {
                closeLeftTween.Play();
                closeRightTween.Play();
                this.audioService.playSound(this.instance.Sensor.Move);
            }
        });
    }
}