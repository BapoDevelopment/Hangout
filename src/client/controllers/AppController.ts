import { Controller, OnStart } from "@flamework/core";
import { Children, New, Value } from "@rbxts/fusion";
import {  Players } from "@rbxts/services";
import { RessourceDisplay } from "./GUI/UIComponents/ComplexComponents/RessourceDisplay";
import { Events } from "client/network";
import { Icon } from "./GUI/UIComponents/BaseComponents/Icon";

@Controller()
export class AppController implements OnStart {
    onStart(): void {
        let cashAmount = Value(0);
        let screenPosition = Value(UDim2.fromScale(0.1, 0.1));
        Events.ressources.collectedCoins.connect((amount: number, partPosition: Vector3) => {
            cashAmount.set(amount);
            const camera: Camera | undefined = game.Workspace.CurrentCamera;
            if(!camera) { return; }
            const [screenPos, onScreen] = camera.WorldToScreenPoint(partPosition);
            screenPosition.set(new UDim2(0, screenPos.X, 0, screenPos.Y));
        });

        const playerGUI = Players.LocalPlayer.FindFirstChild("PlayerGui");
        if (playerGUI) {
            const app = New("ScreenGui")({
                Name: "App",
                Parent: playerGUI,
                [Children]: [
                    RessourceDisplay({
                        Position: UDim2.fromScale(0.7,0.0),
                        Number: cashAmount,
                    }),
                    New("ImageLabel")({
                        SizeConstraint: Enum.SizeConstraint.RelativeYY,
                        Size: UDim2.fromScale(0.1, 0.1),
                        Position: screenPosition,
                        AnchorPoint: new Vector2(0.5, 0.5),
                        Image: "rbxassetid://117582891502895",
                        BackgroundTransparency: 1,
                    })
                ]
            })
        }
    }
}