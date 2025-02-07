import { Controller, OnStart } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import { Events } from "client/network";

@Controller()
export class MovementController {
	private player = Players.LocalPlayer;

    constructor() {
		print("A");
		if(this.player.Character) {
			this.onCharacterAdded(this.player.Character);
		}

		this.player.CharacterAdded.Connect((character) => {
			this.onCharacterAdded(character);
		});
	}

	private onCharacterAdded(character: Model): void {
		print("B");
		const humanoid: Humanoid = character.WaitForChild("Humanoid") as Humanoid;
		if(humanoid) {
			RunService.Heartbeat.Connect(() => {
				if(humanoid.MoveDirection.Magnitude > 0) {
					if(character.GetAttribute("InWardrobe") === true) {
						print("In Wardrobe");
						character.SetAttribute("InWardrobe", false)	;
						Events.leaveWardrobe.fire();
					}
				}
			});
		}
	}
}