import { New, Children, Value, OnEvent, StateObject, Observer } from "@rbxts/fusion";
import { RadialMenuItem } from "./RadialMenuItem";
import { GuiService, TweenService } from "@rbxts/services";
import { ClientSettings } from "client/ClientSettings";

export function RadialMenu3D(props: {
	visible: StateObject<boolean>;
}) {
	const ringDiameter = 1080;
	const ringRadius = ringDiameter / 2;
	const dividerDistanceFactor = 0.825;

	const hoveredIndex = Value(-1);
	const selectedLabel = Value("");

	const highlightStates = [] as Value<boolean>[];
	const dividers = [] as Frame[];
	const items = [] as Frame[];

	const innerVisible = Value(false);

	// Items
	const itemData = [
		{ label: "Fist", imageId: ClientSettings.Items.Fist.imageId, amount: 0 },
		{ label: "Phone", imageId: ClientSettings.Items.Phone.imageId, amount: 0 },
		{ label: "Flashlight", imageId: ClientSettings.Items.Flashlight.imageId, amount: 0 },
		{ label: "Cookie", imageId: ClientSettings.Items.Cookie.imageId, amount: 76 },
		{ label: "Energy", imageId: ClientSettings.Items.Energy.imageId, amount: 12 },
	];

	// Dividers
	for (let i = 0; i < itemData.size(); i++) {
		const angleDeg = (360 / itemData.size()) * i + (360 / itemData.size()) / 2;
		const angleRad = math.rad(angleDeg);

		const dist = (ringRadius * dividerDistanceFactor) / ringDiameter;
		const x = 0.5 + math.cos(angleRad) * dist;
		const y = 0.5 + math.sin(angleRad) * dist;

		dividers.push(
			New("Frame")({
				Size: UDim2.fromScale(0.004, 0.175),
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(x, y),
				Rotation: angleDeg - 90,
				BackgroundColor3: Color3.fromRGB(255, 255, 255),
				BackgroundTransparency: 0.75,
			}),
		);
	}

	// Items
	for (let i = 0; i < itemData.size(); i++) {
		const angleDeg = (360 / itemData.size()) * i;
		const angleRad = math.rad(angleDeg);

		const dist = (ringRadius * dividerDistanceFactor) / ringDiameter;
		const x = 0.5 + math.cos(angleRad) * dist;
		const y = 0.5 + math.sin(angleRad) * dist;

		const isHighlighted = Value(false);
		highlightStates.push(isHighlighted);

		const data = itemData[i];

		const itemFrame = RadialMenuItem({
			imageId: data.imageId,
			label: data.label,
			position: UDim2.fromScale(x, y),
			hovered: isHighlighted,
			amount: Value(data.amount),
		});

		items.push(itemFrame);
	}

	const container = New("Frame")({
		Visible: innerVisible,
		Size: UDim2.fromScale(0, 0),
		AnchorPoint: new Vector2(0.5, 0.5),
		Position: UDim2.fromScale(0.5, 0.5),
		BackgroundTransparency: 1,
		Name: "RadialMenu",
		ClipsDescendants: false,

		[OnEvent("MouseMoved")]: (x, y) => {
			const [topLeftInset] = GuiService.GetGuiInset();
			const relativeMouse = new Vector2(x, y - topLeftInset.Y);

			const center = container.AbsolutePosition.add(container.AbsoluteSize.div(2));
			const dir = relativeMouse.sub(center);

			let angle = math.deg(math.atan2(dir.Y, dir.X));
			if (angle < 0) angle += 360;

			const anglePerTile = 360 / itemData.size();
			const hovered = math.floor((angle + anglePerTile / 2) / anglePerTile) % itemData.size();

			if (hoveredIndex.get() !== hovered) {
				const prev = hoveredIndex.get();
				if (prev >= 0) highlightStates[prev].set(false);

				highlightStates[hovered].set(true);
				hoveredIndex.set(hovered);

				// Label direkt aus itemData lesen
				const hoveredLabel = itemData[hovered].label;
				selectedLabel.set(hoveredLabel);
				print(`Current Item: ${hoveredLabel}`);
			}
		},


		[Children]: [
			New("Frame")({
				SizeConstraint: Enum.SizeConstraint.RelativeYY,
				Size: UDim2.fromScale(1, 1),
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.5),
				BackgroundTransparency: 1,
				Name: "InnerBox",
				[Children]: [
					New("ImageLabel")({
						Size: UDim2.fromScale(1, 1),
						AnchorPoint: new Vector2(0.5, 0.5),
						Position: UDim2.fromScale(0.5, 0.5),
						Image: "rbxassetid://137786070392538",
						ImageTransparency: 0.5,
						BackgroundTransparency: 1,
						BorderSizePixel: 0,
					}),
					New("TextLabel")({
						AnchorPoint: new Vector2(0.5, 0.5),
						Position: UDim2.fromScale(0.5, 0.5),
						Size: UDim2.fromScale(0.25, 0.15),
						Text: selectedLabel,
						TextColor3: Color3.fromRGB(255, 255, 255),
						TextScaled: true,
						Font: Enum.Font.GothamBold,
						BackgroundTransparency: 1,
						ZIndex: 10,
					}),
					...dividers,
					...items,
				],
			}),
		],
	});

	Observer(props.visible).onChange(() => {
		if(!innerVisible.get()) {
			innerVisible.set(true);
		}
		const isVisible = props.visible.get();
		const goal = isVisible ? UDim2.fromScale(1, 1) : UDim2.fromOffset(0, 0);
		const tween = TweenService.Create(container, new TweenInfo(0.2, Enum.EasingStyle.Linear, Enum.EasingDirection.Out), {
			Size: goal,
		});
		tween.Play();
		tween.Completed.Connect(() => {
			if(!props.visible.get()) {
				innerVisible.set(false);
			} else {
			}
		})
	});

	return container;
}
