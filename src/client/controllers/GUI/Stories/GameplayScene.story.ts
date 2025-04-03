import { Children, ForValues, New, Spring, Value, StateObject, Observer } from "@rbxts/fusion";
import { RessourceDisplay } from "../UIComponents/ComplexComponents/RessourceDisplay";
import { Icon } from "../UIComponents/BaseComponents/Icon";

interface CoinData {
    position: StateObject<UDim2>;
    transparency: StateObject<number>;
}

let coins = Value<CoinData[]>([]);

function story(target: Frame) {
    const cashAmount = Value(0);
    
    const component = New("Frame")({
        Parent: target,
        Size: UDim2.fromScale(1, 1),
        BackgroundTransparency: 1,
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
                    coins,
                    (coin: CoinData) => {
                        return createCoinImageLabel(coin.position, coin.transparency);
                    },
                    (instance) => instance.Destroy()
                ),
            }),
        ],
    });

    return () => {
        component.Destroy();
    };
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
    
// Erzeugt ein neues ImageLabel für einen Coin unter Verwendung der reaktiven Position und Transparenz.
function createCoinImageLabel(position: StateObject<UDim2>, transparency: StateObject<number>) {
    return New("ImageLabel")({
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
        Size: UDim2.fromScale(0.1, 0.1),
        Position: position,
        AnchorPoint: new Vector2(0.5, 0.5),
        Image: "rbxassetid://117582891502895",
        BackgroundTransparency: 1,
        ImageTransparency: transparency,
    });
}

spawnCoins(UDim2.fromScale(0.5, 0.5), 5);

export = story;
