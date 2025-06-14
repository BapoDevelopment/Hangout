import { Children, New, OnEvent, Value } from "@rbxts/fusion";
import { ClientSettings } from "client/ClientSettings";
import { AudioController } from "client/controllers/AudioController";
import { App } from "./Apps/App";
import { currentApp } from "../../Stories/Smartphone/State";

export interface IAppIcon {
	Name: string;
	Color: Color3;
	Icon: string;
    AppModule: App;
}

export function AppIcon(props: IAppIcon) {
	const transparency = Value(1);
    const audioController = new AudioController();

	const onMouseDown = () => {
		transparency.set(0.5);
	};

	const onMouseUp = () => {
		transparency.set(1);
        currentApp.set(props.AppModule);
        print("change app to " + tostring(props.AppModule.Name));
        audioController.playSound(ClientSettings.Sounds.Button.Forward);
	};

    const onMouseLeave = () => {
	    transparency.set(1);
    };

	const onTouchTap = () => {
		transparency.set(0.5);
        audioController.playSound(ClientSettings.Sounds.Button.Forward);
		task.delay(0.2, () => {
			transparency.set(1);
		});
	};

	return New("TextButton")({
		Name: props.Name,
		BackgroundColor3: Color3.fromRGB(255, 0, 0),
		BackgroundTransparency: 1,
		Size: UDim2.fromScale(1, 1),
		AutoButtonColor: false,
		[Children]: [
            New("Frame")({
				Name: props.Name,
				Size: UDim2.fromScale(1, 1),
				SizeConstraint: Enum.SizeConstraint.RelativeXX,
				BackgroundColor3: props.Color,
				BackgroundTransparency: 0,
				[Children]: [
					New("UICorner")({ CornerRadius: new UDim(0.2, 0) }),
					New("ImageLabel")({
						Image: props.Icon,
						Name: "Icon",
						Size: UDim2.fromScale(0.8, 0.8),
						BackgroundTransparency: 1,
						AnchorPoint: new Vector2(0.5, 0.5),
						Position: UDim2.fromScale(0.5, 0.5),
					}),
				],
			}),
            New("Frame")({
				Name: "Shadow",
				Size: UDim2.fromScale(1, 1),
				SizeConstraint: Enum.SizeConstraint.RelativeXX,
				BackgroundColor3: Color3.fromRGB(0, 0, 0),
				BackgroundTransparency: transparency,
				[Children]: [
					New("UICorner")({ CornerRadius: new UDim(0.2, 0) }),
				],
			}),
			New("TextLabel")({
				Size: UDim2.fromScale(1, 0.2),
				BackgroundColor3: Color3.fromRGB(0, 0, 0),
				BackgroundTransparency: 1,
				Position: UDim2.fromScale(0, 0.8),
				TextScaled: true,
				Font: Enum.Font.SourceSansBold,
				TextColor3: Color3.fromRGB(255, 255, 255),
				Text: props.Name,
			}),
		],
		[OnEvent("MouseButton1Down")]: onMouseDown,
		[OnEvent("MouseButton1Up")]: onMouseUp,
        [OnEvent("MouseLeave")]: onMouseLeave,
		[OnEvent("TouchTap")]: onTouchTap,
	});
}
