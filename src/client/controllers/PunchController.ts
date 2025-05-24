import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, Players } from "@rbxts/services";
import { SharedSettings } from "shared/SharedSettings";
import { AnimationController } from "./AnimationController";
import { Events } from "client/network";

@Controller()
export class PunchController implements OnStart {
    private isPunching: boolean = false;

    constructor(private animationController: AnimationController) {}

    onStart(): void {
        ContextActionService.BindAction("Punch", () => this.punch(), true, Enum.KeyCode.F);
        ContextActionService.SetPosition("Punch", UDim2.fromScale(0.72, 0.20));
        ContextActionService.SetTitle("Punch", "Punch");
    }

    private punch(): void {
        if(this.isPunching) { return; }
        this.isPunching = true;

        this.animationController.play(SharedSettings.ANIMATIONS.PUNCH);
        Events.punch.fire();

        wait(1);
        this.isPunching = false;
    }
}