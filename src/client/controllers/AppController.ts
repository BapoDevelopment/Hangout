import { Controller, OnStart } from "@flamework/core";
import { Children, Computed, New, Tween, Value } from "@rbxts/fusion";
import { GuiService, Players, Workspace } from "@rbxts/services";
import { RessourceDisplay } from "./GUI/UIComponents/ComplexComponents/RessourceDisplay";
import { Events } from "client/network";
import { RessourceContainer } from "./GUI/UIComponents/ComplexComponents/RessourceContainer";

@Controller()
export class AppController implements OnStart {
    onStart(): void {
        const cashAmount = Value(0);
        const animatedCash = Tween(cashAmount, new TweenInfo(0.1, Enum.EasingStyle.Sine));
        const displayedCash = Computed(() => {
            return math.floor(animatedCash.get());
        });

        const spawnCash = Value(0);
        const displaySize = Value(UDim2.fromScale(0.15, 0.05));
        const targetDisplaySize = UDim2.fromScale(0.2, 0.1);
        const ressourceSpawnPosition = Value(UDim2.fromScale(0.5, 0.5));
        
        Events.ressources.collectedCoins.connect((amount: number, partPosition: Vector3) => {
            cashAmount.set(cashAmount.get() + amount);
            spawnCash.set(amount);

            const camera = Workspace.CurrentCamera;
            if (!camera) return;
            const [screenPos, onScreen] = camera.WorldToScreenPoint(partPosition);
            if (!onScreen) return;
            let inset = GuiService.GetGuiInset()[0].Y;
            inset = inset ? inset : 0;
            const screenPosition = UDim2.fromOffset(screenPos.X, screenPos.Y + inset);

            print(screenPosition + " pp: " + tostring(partPosition));
            ressourceSpawnPosition.set(screenPosition);
        });

        const playerGUI = Players.LocalPlayer.FindFirstChild("PlayerGui");
        if (playerGUI) {
            New("ScreenGui")({
                IgnoreGuiInset: true,
                Name: "App",
                Parent: playerGUI,
                [Children]: [
                    RessourceDisplay({
                        Position: UDim2.fromScale(0.90, 0.05),
                        Number: displayedCash,
                        Icon: Value("rbxassetid://117582891502895"),
                        Size: displaySize,
                    }),
                    RessourceContainer({
                        Icon: Value("rbxassetid://117582891502895"),
                        amount: spawnCash,
                        spawnPosition: ressourceSpawnPosition,
                        targetPosition: Value(UDim2.fromScale(0.90, 0.05)),
                        timeToPos: 0.5,
                        transparencyTime: 0.1,
                        transperentAtThreshold: new Vector2(1, 8),
                        radius: 50,
                        DisplaySize: displaySize,
                        DefaultDisplaySize: displaySize.get(),
                        TargetDisplaySize: targetDisplaySize,
                    }),
                ],
            });
        }
    }
}
