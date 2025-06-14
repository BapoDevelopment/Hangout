import { Children, New, StateObject } from "@rbxts/fusion";
import { App } from "./Apps/App";
import { RunService, TextService } from "@rbxts/services";

export interface ITopBar {
    Money: StateObject<string>;
    Time: StateObject<string>;
}

export function TopBar(props: ITopBar) {
    	// Constants
	const DEFAULT_TEXT_SIZE = 80;
	const textLabels: TextLabel[] = [];

	// Create Money label
	const moneyLabel = New("TextLabel")({
		Name: "Money",
		Size: UDim2.fromScale(2.5, 1),
		Position: UDim2.fromScale(0.02, 0),
		SizeConstraint: Enum.SizeConstraint.RelativeYY,
		BackgroundTransparency: 1,
        BackgroundColor3: Color3.fromRGB(0, 0, 0),
		Font: Enum.Font.SourceSansBold,
		TextColor3: Color3.fromRGB(255, 255, 255),
		TextScaled: false,
		Text: "1.21M €",
		TextSize: DEFAULT_TEXT_SIZE,
	});
	textLabels.push(moneyLabel);

	// Create Time label
	const timeLabel = New("TextLabel")({
		Name: "Time",
		Size: UDim2.fromScale(2, 1),
		Position: UDim2.fromScale(0.75, 0),
		SizeConstraint: Enum.SizeConstraint.RelativeYY,
		BackgroundTransparency: 1,
		Font: Enum.Font.SourceSansBold,
		TextColor3: Color3.fromRGB(255, 255, 255),
		TextScaled: false,
		Text: "07:15",
		TextSize: DEFAULT_TEXT_SIZE,
	});
	textLabels.push(timeLabel);

	// Compute and apply uniform size using TextService synchronously
	function recalcTextSize() {
		let minSize = DEFAULT_TEXT_SIZE;
		for (const lbl of textLabels) {
			const containerX = lbl.AbsoluteSize.X;
			// measure text width at default size
			const measure = TextService.GetTextSize(lbl.Text, DEFAULT_TEXT_SIZE, lbl.Font, new Vector2(1e5, 1e5));
			if (measure.X > containerX) {
				const factor = containerX / measure.X;
				const newSize = DEFAULT_TEXT_SIZE * factor;
				if (newSize < minSize) {
					minSize = newSize;
				}
			}
		}
		// apply once
		for (const lbl of textLabels) {
			lbl.TextSize = minSize;
		}
	}

	// Hook size and text changes per label
	for (const lbl of textLabels) {
		lbl.GetPropertyChangedSignal("AbsoluteSize").Connect(recalcTextSize);
		lbl.GetPropertyChangedSignal("Text").Connect(recalcTextSize);
	}

	// initial update next frame
	RunService.Heartbeat.Connect(recalcTextSize);

    return New("Frame")({
        Name: "TopBar",
        Position: UDim2.fromScale(0.5, 0.017),
        AnchorPoint: new Vector2(0.5, 0),
        Size: UDim2.fromScale(0.96, 0.0775),
        BackgroundColor3: Color3.fromRGB(0, 0, 0),
        BackgroundTransparency: 0.5,
        [Children]: [
            moneyLabel,
            timeLabel,
            New("Frame")({
                Name: "Camera",
                Position: UDim2.fromScale(0.5, 0.5),
                AnchorPoint: new Vector2(0.5, 0.5),
                Size: UDim2.fromScale(0.09, 0.09),
                SizeConstraint: Enum.SizeConstraint.RelativeXX,
                BackgroundColor3: Color3.fromRGB(33, 38, 38),
                [Children]: [
                    New("UICorner")({ CornerRadius: new UDim(1, 1) }),
                    New("Frame")({
                        Name: "Camera",
                        Position: UDim2.fromScale(0.5, 0.5),
                        AnchorPoint: new Vector2(0.5, 0.5),
                        Size: UDim2.fromScale(0.23, 0.23),
                        SizeConstraint: Enum.SizeConstraint.RelativeXX,
                        BackgroundColor3: Color3.fromRGB(255, 255, 255),
                        [Children]: [New("UICorner")({ CornerRadius: new UDim(1, 1) })],
                    }),
                ],
            }),
        ],
    })
}