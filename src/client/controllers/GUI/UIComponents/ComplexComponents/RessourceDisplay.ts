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
    let backgroundSize = Computed(() => {
        if(props.Number.get() >= 0 && props.Number.get() <= 9) {
            return UDim2.fromScale(0.4, 0.8);
        } else if(props.Number.get() >= 10 && props.Number.get() <= 99) {
            return UDim2.fromScale(0.5, 0.8);
        } else if(props.Number.get() >= 100 && props.Number.get() <= 999) {
            return UDim2.fromScale(0.6, 0.8);
        } else if(props.Number.get() >= 1000 && props.Number.get() <= 9999) {
            return UDim2.fromScale(0.7, 0.8);
        } else if(props.Number.get() >= 10000 && props.Number.get() <= 99999) {
            return UDim2.fromScale(0.75, 0.8);
        } else if(props.Number.get() >= 100000 && props.Number.get() <= 999999) {
            return UDim2.fromScale(0.9, 0.8);
        }
        return UDim2.fromScale(1, 0.8);
    });

    let textPosition = Computed(() => {
        if(props.Number.get() >= 0 && props.Number.get() <= 9) {
            return UDim2.fromScale(0.6, 0);
        } else if(props.Number.get() >= 10 && props.Number.get() <= 99) {
            return UDim2.fromScale(0.45, 0.0);
        } else if(props.Number.get() >= 10 && props.Number.get() <= 99) {
            return UDim2.fromScale(0.35, 0);
        } else if(props.Number.get() >= 100 && props.Number.get() <= 999) {
            return UDim2.fromScale(0.35, 0);
        } else if(props.Number.get() >= 1000 && props.Number.get() <= 9999) {
            return UDim2.fromScale(0.3, 0);
        } else if(props.Number.get() >= 10000 && props.Number.get() <= 99999) {
            return UDim2.fromScale(0.275, 0);
        } else if(props.Number.get() >= 100000 && props.Number.get() <= 999999) {
            return UDim2.fromScale(0.25, 0);
        }
        return UDim2.fromScale(0.2, 0);
    });

    return New("Frame")({
        Name: "RessourceDisplay",
        Position: props.Position,
        BackgroundTransparency: 1,
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
        Size: animatedSize,
        AnchorPoint: new Vector2(0.5, 0.5),
        [Children]: [
            New("Frame")({
                Name: "Background",
                Size: backgroundSize,
                Position: UDim2.fromScale(0.1, 0.5),
                AnchorPoint: new Vector2(0, 0.5),
                BackgroundColor3: Color3.fromRGB(0, 0, 0),
                BackgroundTransparency: 0.5,
                [Children]: [
                    New("UICorner")({
                        CornerRadius: new UDim(0.8, 0),
                    }),
                    NumberText({
                        Size: UDim2.fromScale(0.75, 1),
                        Position: textPosition,
                        TextXAlignment: Enum.TextXAlignment.Left,
                        Number: props.Number,
                        TextColor3: Color3.fromRGB(208, 206, 206),
                    }),
                ],
            }),
            Icon({
                Position: Value(UDim2.fromScale(0.15, 0.5)),
                Icon: props.Icon,
                Size: Value(UDim2.fromScale(1, 1)),
            }),
        ],
    });
}