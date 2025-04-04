import { Children, New, StateObject, Value, Computed, Observer, Spring } from "@rbxts/fusion";
import { NumberText } from "../BaseComponents/NumberText";
import { Icon } from "../BaseComponents/Icon";

// Definition des Interfaces für RessourceDisplay
export interface IRessourceDisplay {
    Position: UDim2,
    Number: Value<number>;
    Icon: StateObject<ContentId>;
}

// Die RessourceDisplay-Komponente
export function RessourceDisplay(props: IRessourceDisplay) {
    // Lokaler Zustand für die Größe des Displays, Startwert z. B. 15% Breite, 5% Höhe
    const displaySize = Value(UDim2.fromScale(0.15, 0.05));
    const defaultDisplaySize = displaySize.get();

    let previousValue = props.Number.get(); // Startwert speichern

    const startState = displaySize;
    const frequency = 35;
    const damping = 0.75;
    const animatedSize = Spring(startState, frequency, damping);

    const addedRessourceObserver = Observer(props.Number).onChange(() => {
        print(`Vorher: ${previousValue}, Neu: ${props.Number.get()}`);
    
        if (props.Number.get() > previousValue) {
            // Falls der Wert gestiegen ist, führe eine Animation aus

    
            displaySize.set(UDim2.fromScale(0.2, 0.1));
        }
    
        previousValue = props.Number.get(); // Speichere den neuen Wert als vorherigen Wert für den nächsten Zyklus
    });

    return New("Frame")({
        Position: props.Position,
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
        Size: animatedSize, // Nutzt den reaktiven Zustand
        BackgroundColor3: Color3.fromRGB(255, 0, 0),
        [Children]: [
            NumberText({
                Size: UDim2.fromScale(0.75, 1),
                Position: UDim2.fromScale(0.35, 0),
                TextXAlignment: Enum.TextXAlignment.Left,
                Number: props.Number,
                TextColor3: Color3.fromRGB(208, 206, 206),
            }),
            Icon({
                Position: Value(UDim2.fromScale(0.2, 0.5)),
                Icon: props.Icon,
            }),
        ],
    });
}