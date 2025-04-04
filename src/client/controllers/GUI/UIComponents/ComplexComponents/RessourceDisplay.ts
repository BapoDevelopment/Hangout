import { Children, New, StateObject, Value, Computed, Observer, Spring } from "@rbxts/fusion";
import { NumberText } from "../BaseComponents/NumberText";
import { Icon } from "../BaseComponents/Icon";

// Definition des Interfaces für RessourceDisplay
export interface IRessourceDisplay {
    Position: UDim2,
    Number: StateObject<number>;
    Icon: StateObject<ContentId>;
    Size: StateObject<UDim2>;
}

// Die RessourceDisplay-Komponente
export function RessourceDisplay(props: IRessourceDisplay) {
    const frequency = 35;
    const damping = 0.75;
    const animatedSize = Spring(props.Size, frequency, damping);

    return New("Frame")({
        Position: props.Position,
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
        Size: animatedSize, // Nutzt den reaktiven Zustand
        BackgroundColor3: Color3.fromRGB(255, 0, 0),
        AnchorPoint: new Vector2(0.5, 0.5),
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