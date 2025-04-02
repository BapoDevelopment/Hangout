import { New } from "@rbxts/fusion";

export interface IIcon {
    Position?: UDim2;
    Icon?: ContentId;
}

export function Icon(props: IIcon) {
    return New("ImageLabel")({
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
        Size: UDim2.fromScale(1, 1),
        Position: props.Position,
        Image: props.Icon,
        BackgroundTransparency: 1,
    })
}