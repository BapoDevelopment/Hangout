import { Children, New } from "@rbxts/fusion";
import { NumberText } from "../BaseComponents/NumberText";
import { Icon } from "../BaseComponents/Icon";

export interface IRessourceDisplay {
    Position: UDim2,
    Number: number;
}

export function RessourceDisplay(props: IRessourceDisplay) {
    return New("Frame")({
        Position: props.Position,
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
        Size: UDim2.fromScale(0.15,0.05),
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
                Position: UDim2.fromScale(0, 0),
                Icon: "http://www.roblox.com/asset/?id=117582891502895",
            }),
        ],
    })
}