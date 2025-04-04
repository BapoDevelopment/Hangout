import { Controller, OnStart } from "@flamework/core";
import { Children, New, Value } from "@rbxts/fusion";
import { Players, Workspace } from "@rbxts/services";
import { RessourceDisplay } from "./GUI/UIComponents/ComplexComponents/RessourceDisplay";
import { Events } from "client/network";
import { RessourceContainer } from "./GUI/UIComponents/ComplexComponents/RessourceContainer";

@Controller()
export class AppController implements OnStart {
    onStart(): void {
        const cashAmount = Value(0);
        const spawnCash = Value(0);

        Events.ressources.collectedCoins.connect((amount: number, partPosition: Vector3) => {
            cashAmount.set(cashAmount.get() + amount);
            spawnCash.set(amount);
        });

        const playerGUI = Players.LocalPlayer.FindFirstChild("PlayerGui");
        if (playerGUI) {
            New("ScreenGui")({
                Name: "App",
                Parent: playerGUI,
                [Children]: [
                    RessourceDisplay({
                        Position: UDim2.fromScale(0.7, 0.0),
                        Number: cashAmount,
                        Icon: Value("rbxassetid://117582891502895"),
                    }),
                    RessourceContainer({
                        Icon: Value("rbxassetid://117582891502895"),
                        amount: spawnCash,
                        spawnPosition: UDim2.fromScale(0.5, 0.5),
                        targetPosition: UDim2.fromScale(0.8, 0.2),
                    }),
                ],
            });
        }
    }
}
