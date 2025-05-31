import { New, Children, Computed, StateObject } from "@rbxts/fusion";

export function RadialMenuItem(props: {
	imageId: string;
	label: string;
	position: UDim2;
	hovered: StateObject<boolean>;
    amount: StateObject<number>;
}) {
	const { imageId, label, position, hovered, amount } = props;

	// Computed-Werte für Größe und Transparenz
	const iconSize = Computed(() => {
		const baseScale = hovered.get() ? 1.5 : 1; // ~1.2×0.066
		return UDim2.fromScale(baseScale, baseScale);
	});
	const itemAmount = Computed(() => {
		return amount.get() > 1 ? tostring(amount.get()) : "";
	});
	const circleSize = Computed(() => {
		const scale = hovered.get() ? 2.6 : 0; // etwas größer als Icon
		return UDim2.fromScale(scale, scale);
	});

	return New("Frame")({
		Size: UDim2.fromScale(0.1, 0.1), // Platz für Icon + Label
        SizeConstraint: Enum.SizeConstraint.RelativeYY,
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: position,
		BackgroundTransparency: 1,
		Name: label,

		[Children]: [
			// Kreis-Hintergrund
			New("Frame")({
				Name: "Circle",
				Size: circleSize,
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.4),
				BackgroundColor3: new Color3(0, 0, 0),
				BackgroundTransparency: 0.5,
				ZIndex: 0,

				[Children]: [
					New("UICorner")({
						CornerRadius: new UDim(1, 0),
					}),
				],
			}),

			// Icon
			New("ImageLabel")({
				Name: "Icon",
				Size: iconSize,
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.4),
				Image: imageId,
				BackgroundTransparency: 1,
				BorderSizePixel: 0,
				ZIndex: 1,
			}),

			// Beschriftung
			New("TextLabel")({
				Name: "Label",
				Size: UDim2.fromScale(0.3, 1),
				AnchorPoint: new Vector2(0.5, 0),
				Position: UDim2.fromScale(0.7, 0.2),
				Text: itemAmount,
				Font: Enum.Font.SourceSansBold,
				TextSize: 14,
                TextScaled: true,
				TextColor3: new Color3(1, 1, 1),
				BackgroundTransparency: 1,
				ZIndex: 1,
			}),
		],
	});
}
