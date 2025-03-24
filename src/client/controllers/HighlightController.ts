import { Controller, OnStart } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";

@Controller()
export class HighlightController implements OnStart {
	private player = Players.LocalPlayer;
	private highlight: Highlight | undefined;

    onStart() {
        for (const prompt of game.GetDescendants()) {
            if (prompt.IsA("ProximityPrompt")) {
                this.setupPromptListeners(prompt);
            }
        }
        
        game.DescendantAdded.Connect((instance) => {
            if (instance.IsA("ProximityPrompt")) {
                this.setupPromptListeners(instance);
            }
        });

		if(this.player.Character) {
			this.onCharacterAdded(this.player.Character);
		}

		this.player.CharacterAdded.Connect((character) => {
			this.onCharacterAdded(character);
		});
    }
    
	private onCharacterAdded(character: Model): void {
		this.highlight = new Instance("Highlight");
		this.highlight.FillTransparency = 1;
		this.highlight.OutlineTransparency = 1;
		this.highlight.Parent = character;
	}

    private setupPromptListeners(prompt: ProximityPrompt) {
        prompt.PromptShown.Connect(() => {
			if(this.player.Character) {
				const highlighter: Highlight | undefined = this.player.Character.FindFirstChildOfClass("Highlight");
				if(highlighter) {
					const instance: Instance | undefined = this.findHighlightableAncestor(prompt.Parent);
					if(instance) {
						highlighter.Adornee = instance;
						highlighter.OutlineTransparency = 0;
					}
				}
			}
        });

        prompt.PromptHidden.Connect(() => {
			if(this.player.Character) {
				const highlighter: Highlight | undefined = this.player.Character.FindFirstChildOfClass("Highlight");
				if(highlighter) {
					highlighter.Adornee = undefined;
					highlighter.OutlineTransparency = 1;
				}
			}
        });
    }

	private findHighlightableAncestor(instance: Instance | undefined): Instance | undefined {
        while (instance) {
            if (CollectionService.HasTag(instance, "Highlightable")) {
                return instance;
            }
            instance = instance.Parent;
        }
        return undefined;
    }
}