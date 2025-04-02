import { Controller, OnStart } from "@flamework/core";
import { Children, ForValues, New, Value } from "@rbxts/fusion";
import { Players, Workspace } from "@rbxts/services";
import { RessourceDisplay } from "./GUI/UIComponents/ComplexComponents/RessourceDisplay";
import { Events } from "client/network";

interface CoinData {
    position: UDim2;
}

@Controller()
export class AppController implements OnStart {
    // Coins-Status als Klassenmitglied, damit er auch in privaten Methoden verfügbar ist
    private coins = Value<CoinData[]>([]);

    onStart(): void {
        const cashAmount = Value(0);

        // Bei Auftreten des collectedCoins-Events
        Events.ressources.collectedCoins.connect((amount: number, partPosition: Vector3) => {
            cashAmount.set(amount);
            const camera = Workspace.CurrentCamera;
            if (!camera) return;
            const [screenPos, onScreen] = camera.WorldToScreenPoint(partPosition);
            if (!onScreen) return;
            const screenPosition = new UDim2(0, screenPos.X, 0, screenPos.Y);

            // Coins erzeugen (hier 1 Coin, kann angepasst werden)
            this.spawnCoins(screenPosition, 2500);
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
                    }),
                    // Container, in dem alle dynamisch erzeugten Coins angezeigt werden
                    New("Frame")({
                        Name: "CoinContainer",
                        BackgroundTransparency: 1,
                        Size: UDim2.fromScale(1, 1),
                        [Children]: ForValues(
                            this.coins,
                            (coin: CoinData) => {
                                return this.createCoinImageLabel(coin.position);
                            },
                            // Destruktor-Funktion, die beim Entfernen der Instanz aufgerufen wird
                            (instance) => instance.Destroy()
                        ),
                    }),
                ],
            });
        }
    }
    private spawnCoins(position: UDim2, count: number): void {
        const random = new Random();
        const newCoins: CoinData[] = [];
    
        for (let i = 0; i < count; i++) {
            // Berechne einen zufälligen Winkel (0 bis 2π) und eine zufällige Distanz (0 bis 2)
            const angle = random.NextNumber(0, math.pi * 100);
            const radius = random.NextNumber(0, 100);
    
            const offsetX = math.cos(angle) * radius;
            const offsetY = math.sin(angle) * radius;
    
            // Erzeuge eine neue Position, die den zufälligen Offset enthält
            const newPosition = new UDim2(
                position.X.Scale,
                position.X.Offset + offsetX,
                position.Y.Scale,
                position.Y.Offset + offsetY
            );
    
            newCoins.push({ position: newPosition });
        }
    
        // Füge die neuen Coins zum existierenden Array hinzu
        this.coins.set([...this.coins.get(), ...newCoins]);
    }
    
    

    // Private Methode: Erzeugt ein neues ImageLabel für einen Coin
    private createCoinImageLabel(position: UDim2) {
        return New("ImageLabel")({
            SizeConstraint: Enum.SizeConstraint.RelativeYY,
            Size: UDim2.fromScale(0.1, 0.1),
            Position: position,
            AnchorPoint: new Vector2(0.5, 0.5),
            Image: "rbxassetid://117582891502895",
            BackgroundTransparency: 1,
        });
    }
}
