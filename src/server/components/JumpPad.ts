import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { MyService } from "server/services/MyService";

/*interface IJumpPadComponent extends Model {
	TopPart: Part;
	BottomPart: Part;
}

interface IJumpPadAttributes {
	Height: number;
}*/

@Component({
	tag: "JumpPad",
})
export class JumpPad extends BaseComponent/*<IJumpPadAttributes, IJumpPadComponent>*/ implements OnStart {
	private JUMP_FORCE = 50; // Höhe des Sprungs anpassen

	onStart() {
		print("I'm a jump pad");

		// Stelle sicher, dass das Part auf Kollisionsereignisse überprüft wird
		const jumpPadPart = this.instance;

		if (jumpPadPart.IsA("BasePart")) {
			jumpPadPart.Touched.Connect((otherPart) => {
				print("Jump23");
				// Prüfe, ob das berührende Objekt zu einem Spieler gehört
				const character = otherPart.Parent;
				if (character && character.IsA("Model")) {
					const humanoid = character.FindFirstChildOfClass("Humanoid");
					if (humanoid) {
						humanoid.Jump = true;
					}
				}
			});
		} else {
			warn("The tagged instance is not a BasePart!");
		}
	}
}
