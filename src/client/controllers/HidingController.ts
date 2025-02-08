import { Controller } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import { Events } from "client/network";
import { AnimationController } from "./AnimationController";
import { SharedSettings } from "shared/SharedSettings";

@Controller()
export class HidingController {
	private player = Players.LocalPlayer;

    constructor(private animationController: AnimationController) {
		if(this.player.Character) {
			this.onCharacterAdded(this.player.Character);
		}

		this.player.CharacterAdded.Connect((character) => {
			this.onCharacterAdded(character);
		});
	}

	private onCharacterAdded(character: Model): void {
		const humanoid: Humanoid = character.WaitForChild("Humanoid") as Humanoid;
		if(humanoid) {
			RunService.Heartbeat.Connect(() => {
				if(humanoid.MoveDirection.Magnitude > 0) {
					if(character.GetAttribute("InWardrobe") === true) {
						character.SetAttribute("InWardrobe", false);
						Events.leaveWardrobe.fire();
						this.animationController.play(SharedSettings.ANIMATIONS.WARDROBE.EXIT);
					}
					if(character.GetAttribute("UnderBed") === true) {
						character.SetAttribute("UnderBed", false);
						Events.leaveBed.fire();
						this.animationController.play(SharedSettings.ANIMATIONS.BED.EXIT);
					}
				}
			});
		}
	}
}