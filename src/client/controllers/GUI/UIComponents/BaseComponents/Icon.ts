import { New, StateObject, Value } from "@rbxts/fusion";

export interface IIcon {
	Position: StateObject<UDim2>;
	Icon?: StateObject<ContentId>;
	Transparency?: StateObject<number>;
	Size?: StateObject<UDim2>; // Neu: Größe als reactive Eigenschaft
}

export function Icon(props: IIcon) {
	return New("ImageLabel")({
		SizeConstraint: Enum.SizeConstraint.RelativeYY,
		Size: props.Size ?? Value(UDim2.fromOffset(25, 25)),
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: props.Position,
		Image: props.Icon,
		ImageTransparency: props.Transparency,
		BackgroundTransparency: 1,
	});
}
