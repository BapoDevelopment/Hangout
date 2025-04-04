import { New, StateObject, Computed, Observer, Value, Children, ForValues, Spring } from "@rbxts/fusion";
import { Icon } from "../BaseComponents/Icon";

interface RessourceData {
    position: StateObject<UDim2>;
    transparency: StateObject<number>;
}

let ressources = Value<RessourceData[]>([]);

export interface IRessourceContainer {
    Icon?: StateObject<ContentId>;
    amount: Value<number>,
    spawnPosition: UDim2,
    targetPosition: UDim2,
    radius?: number,
}

export function RessourceContainer(props: IRessourceContainer) {
    const radius = props.radius ?? 50;
    const observer = Observer(props.amount)
    const disconnect = observer.onChange(() => {
        if(props.amount.get() === 0) { return; }
        spawnRessources(props.spawnPosition, props.targetPosition, radius, props.amount.get());
        props.amount.set(0);
    });

    return New("Frame")({
        Name: "RessourceContainer",
        BackgroundTransparency: 1,
        Size: UDim2.fromScale(1, 1),
        [Children]: ForValues(
            ressources,
            (ressource: RessourceData) => {
                return Icon({
                    Position: ressource.position,
                    Icon: props.Icon,
                    Transparency: ressource.transparency,
                });
            },
            (instance) => instance.Destroy()
        ),
    });
}

function spawnRessources(spawnPosition: UDim2, targetPosition: UDim2, radius: number, count: number): void {
    const random = new Random();
    const newRessources: RessourceData[] = [];
    
    for (let i = 0; i < count; i++) {
        // Berechne einen zufälligen Winkel (0 bis 2π) und zufälligen Versatz (z. B. 0 bis 100 Pixel)
        const angle = random.NextNumber(0, math.pi * 2);
        const rad = random.NextNumber(0, radius * 2); // Jetzt abhängig von circleSize
        
        const offsetX = math.cos(angle) * rad;
        const offsetY = math.sin(angle) * rad;
    
        // Zielposition der ersten Animation (zufälliger Offset)
        const firstTargetPosition = new UDim2(
            spawnPosition.X.Scale,
            spawnPosition.X.Offset + offsetX,
            spawnPosition.Y.Scale,
            spawnPosition.Y.Offset + offsetY
        );
    
        // Erstelle einen reaktiven Wert für die Startposition
        const startState = Value(spawnPosition);
        // Erzeuge zufällige Parameter für die Spring-Animation (erste Animation)
        const frequency = random.NextNumber(25, 35);
        const damping = random.NextNumber(0.8, 1.2);
        const animatedPosition = Spring(startState, frequency, damping);
    
        // Erstelle einen reaktiven Wert für die Transparenz, initial 0 (sichtbar)
        const startTransparency = Value(0);
        const animatedTransparency = Spring(startTransparency, 35, 1);
    
        // Observer, der das Ende der ersten Animation detektiert:
        const firstThreshold = 1.1;
        const firstObserver = Observer(animatedPosition).onChange(() => {
            if (
                math.abs(animatedPosition.get().X.Offset - firstTargetPosition.X.Offset) < firstThreshold &&
                math.abs(animatedPosition.get().Y.Offset - firstTargetPosition.Y.Offset) < firstThreshold
            ) {
                // Starte die zweite Animation: Setze als Ziel eine hardcodierte Position
                startState.set(targetPosition);
    
                // Observer für die zweite Animation: Kurz vor Ende die Transparenz erhöhen
                const secondThreshold = 15;
                const secondObserver = Observer(animatedPosition).onChange(() => {
                    if (
                        math.abs(animatedPosition.get().X.Offset - targetPosition.X.Offset) < secondThreshold &&
                        math.abs(animatedPosition.get().Y.Offset - targetPosition.Y.Offset) < secondThreshold
                    ) {
                        // Setze die Transparenz auf 1 (Fade-Out)
                        startTransparency.set(1);
                    }
                });
                const thirdThreshold = 1.1;
                const thirdObserver = Observer(animatedPosition).onChange(() => {
                    if (
                        math.abs(animatedPosition.get().X.Offset - targetPosition.X.Offset) < thirdThreshold &&
                        math.abs(animatedPosition.get().Y.Offset - targetPosition.Y.Offset) < thirdThreshold
                    ) {
                        ressources.set(ressources.get().filter((r) => r !== newRessources[i]));
                        // Jetzt soll die Size von NumberText vergrößert werden.
                    }
                });
            }
        });
    
        // Starte die erste Animation: von position zu targetPosition
        startState.set(firstTargetPosition);
        newRessources.push({ position: animatedPosition, transparency: animatedTransparency });
    }
    
    ressources.set([...ressources.get(), ...newRessources]);
}