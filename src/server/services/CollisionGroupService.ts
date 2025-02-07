import { Service, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services"

@Service()
export class CollisionGroupService implements OnInit {

    public onInit(): void {
		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				this.setCollisionGroup(character, "Character");
			});

			if (player.Character) {
				this.setCollisionGroup(player.Character, "Character");
			}
		});
	}

	public setCollisionGroup(model: Model, collisionGroupName: string): void {
		for (const descendant of model.GetDescendants()) {
			if (descendant.IsA("BasePart") ||descendant.IsA("MeshPart")) {
				descendant.CollisionGroup = collisionGroupName;
			}
		}
	}
}