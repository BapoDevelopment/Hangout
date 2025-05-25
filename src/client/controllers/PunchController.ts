import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, Players } from "@rbxts/services";
import { SharedSettings } from "shared/SharedSettings";
import { AnimationController } from "./AnimationController";
import { Events } from "client/network";

@Controller()
export class PunchController implements OnStart {
    private isPunching: boolean = false;
    private punchToggle: boolean = false;

    constructor(private animationController: AnimationController) {}

    onStart(): void {
        ContextActionService.BindAction("Punch", () => this.punch(), true, Enum.KeyCode.F);
        ContextActionService.SetPosition("Punch", new UDim2(1, -100, 0.5, -25)); // Rechts, zentriert
        ContextActionService.SetTitle("Punch", "Punch");
    }

    private punch(): void {
        if(this.isPunching) { return; }
        this.isPunching = true;

        if(this.punchToggle) {
            this.animationController.play(SharedSettings.ANIMATIONS.LEFT_PUNCH);
        } else {
            this.animationController.play(SharedSettings.ANIMATIONS.RIGHT_PUNCH);
        }
        this.punchToggle = !this.punchToggle;
        Events.punch.fire();

        wait(1);
        this.isPunching = false;
    }
}