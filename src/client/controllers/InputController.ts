import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, UserInputService } from "@rbxts/services";
import { SharedSettings } from "shared/SharedSettings";
import { AnimationController } from "./AnimationController";
import { Events } from "client/network";
import { AppController } from "./AppController";

@Controller()
export class InputController implements OnStart {
    private isPunching: boolean = false;
    private punchToggle: boolean = false;
    
    constructor(private animationController: AnimationController,
        private appController: AppController
    ) {}

    onStart(): void {
        ContextActionService.BindAction("Punch", () => this.punch(), true, Enum.KeyCode.F);
        ContextActionService.SetPosition("Punch", UDim2.fromScale(0.72, 0.20));
        ContextActionService.SetTitle("Punch", "Punch");

        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (input.KeyCode === Enum.KeyCode.Tab) {
                this.appController.showRadialMenu3D();
            }
        });

        UserInputService.InputEnded.Connect((input, gameProcessed) => {
            if (input.KeyCode === Enum.KeyCode.Tab) {
                this.appController.hideRadialMenu3D();
            }
        });
    }

    private punch(): void {
        if(this.isPunching) { return; }
        this.isPunching = true;

        if (this.punchToggle) {
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