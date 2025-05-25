// client/controllers/PunchController.client.ts
import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { SharedSettings } from "shared/SharedSettings";
import { AnimationController } from "./AnimationController";
import { Events } from "client/network";

@Controller()
export class PunchController implements OnStart {
    private isPunching = false;
    private punchToggle = false;

    constructor(private animationController: AnimationController) {}

    onStart(): void {
        const player = Players.LocalPlayer;
        const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

        let inputContext = new Instance("InputContext") as InputContext;
        inputContext.Name = "PlayerActions";
        inputContext.Priority = 1000;
        inputContext.Enabled = true;
        inputContext.Parent = playerGui;

        let punchAction = new Instance("InputAction") as InputAction;
        punchAction.Name = "Punch";
        punchAction.Type = Enum.InputActionType.Bool; // A simple button‐press action
        punchAction.Parent = inputContext;

        const kbBinding = new Instance("InputBinding") as InputBinding;
        kbBinding.Name = "PunchBinding";
        kbBinding.KeyCode = Enum.KeyCode.F;
        kbBinding.Parent = punchAction;

        punchAction.Pressed.Connect(() => {
            this.punch();
        });
    }

    private punch(): void {
        if (this.isPunching) return;
        this.isPunching = true;

        if (this.punchToggle) {
            this.animationController.play(SharedSettings.ANIMATIONS.LEFT_PUNCH);
        } else {
            this.animationController.play(SharedSettings.ANIMATIONS.RIGHT_PUNCH);
        }
        this.punchToggle = !this.punchToggle;

        Events.punch.fire();

        // Simple cooldown: 1 second before you can punch again
        task.delay(1, () => {
            this.isPunching = false;
        });
    }
}
