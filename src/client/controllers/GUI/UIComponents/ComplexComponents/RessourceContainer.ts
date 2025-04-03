import { New, StateObject, Computed, Observer, Value, Children, ForValues, Spring } from "@rbxts/fusion";
import { Icon } from "../BaseComponents/Icon";
import { Workspace } from "@rbxts/services";
import { Events } from "client/network";

interface CoinData {
    position: StateObject<UDim2>;
    transparency: StateObject<number>;
}

let coins = Value<CoinData[]>([]);

export interface IRessourceContainer {
    Icon?: StateObject<ContentId>;
    amount: Value<number>,
    spawnPosition: UDim2,
}

export function RessourceContainer(props: IRessourceContainer) {

    Events.ressources.collectedCoins.connect((amount: number, partPosition: Vector3) => {
        // Erhöhe den Cash-Wert um die neue Menge
        const camera = Workspace.CurrentCamera;
        if (!camera) return;
        const [screenPos, onScreen] = camera.WorldToScreenPoint(partPosition);
        if (!onScreen) return;
        const screenPosition = new UDim2(0, screenPos.X, 0, screenPos.Y);

        // Coins erzeugen: Statt den Wert zu überschreiben, addieren wir die neue Menge
        print("spawn cash: " + tostring(amount));
        spawnCoins(screenPosition, amount);
    });
    
    return New("Frame")({
        Name: "CoinContainer",
        BackgroundTransparency: 1,
        Size: UDim2.fromScale(1, 1),
        [Children]: ForValues(
            coins,
            (coin: CoinData) => {
                return Icon({
                    Position: coin.position,
                    Icon: props.Icon,
                    Transparency: coin.transparency,
                });
            },
            (instance) => instance.Destroy()
        ),
    });
}

function spawnCoins(position: UDim2, count: number): void {
    const random = new Random();
    const newCoins: CoinData[] = [];
    
    for (let i = 0; i < count; i++) {
        // Berechne einen zufälligen Winkel (0 bis 2π) und zufälligen Versatz (z. B. 0 bis 100 Pixel)
        const angle = random.NextNumber(0, math.pi * 2);
        const radius = random.NextNumber(0, 100);
    
        const offsetX = math.cos(angle) * radius;
        const offsetY = math.sin(angle) * radius;
    
        // Zielposition der ersten Animation (zufälliger Offset)
        const targetPosition = new UDim2(
            position.X.Scale,
            position.X.Offset + offsetX,
            position.Y.Scale,
            position.Y.Offset + offsetY
        );
    
        // Erstelle einen reaktiven Wert für die Startposition
        const startState = Value(position);
        // Erzeuge zufällige Parameter für die Spring-Animation (erste Animation)
        const frequency = random.NextNumber(25, 35);
        const damping = random.NextNumber(0.8, 1.2);
        const animatedPosition = Spring(startState, frequency, damping);
    
        // Erstelle einen reaktiven Wert für die Transparenz, initial 0 (sichtbar)
        const transparency = Value(0);
        const animatedTransparency = Spring(transparency, 35, 1);
    
        // Observer, der das Ende der ersten Animation detektiert:
        const firstThreshold = 1.1;
        const firstObserver = Observer(animatedPosition).onChange(() => {
            if (
                math.abs(animatedPosition.get().X.Offset - targetPosition.X.Offset) < firstThreshold &&
                math.abs(animatedPosition.get().Y.Offset - targetPosition.Y.Offset) < firstThreshold
            ) {
                // Starte die zweite Animation: Setze als Ziel eine hardcodierte Position
                const secondTarget = UDim2.fromScale(0.8, 0.2);
                startState.set(secondTarget);
    
                // Observer für die zweite Animation: Kurz vor Ende die Transparenz erhöhen
                const secondThreshold = 15;
                const secondObserver = Observer(animatedPosition).onChange(() => {
                    if (
                        math.abs(animatedPosition.get().X.Offset - secondTarget.X.Offset) < secondThreshold &&
                        math.abs(animatedPosition.get().Y.Offset - secondTarget.Y.Offset) < secondThreshold
                    ) {
                        // Setze die Transparenz auf 1 (Fade-Out)
                        transparency.set(1);
                    }
                });
            }
        });
    
        // Starte die erste Animation: von position zu targetPosition
        startState.set(targetPosition);
    
        newCoins.push({ position: animatedPosition, transparency: animatedTransparency });
    }
    
    coins.set([...coins.get(), ...newCoins]);
}

spawnCoins(UDim2.fromScale(0.5, 0.5), 5);
