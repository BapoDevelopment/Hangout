import { Children, New, Value } from "@rbxts/fusion";
import { Home } from "../../UIComponents/Smartphone/Apps/Home";
import { Phone } from "../../UIComponents/Smartphone/Phone";
import { currentApp } from "./State";
import { Chat } from "../../UIComponents/Smartphone/Apps/Chat";

function story(target: Frame) {
	// assemble main GUI
	currentApp.set(Chat);
	
	const component = New("Frame")({
		Parent: target,
		Size: UDim2.fromScale(1, 1),
		BackgroundTransparency: 1,
		ClipsDescendants: true,
		[Children]: [
			Phone({
				BackgroundImage: Value("rbxassetid://17449797910"),
			}),
		],
	});

	return () => component.Destroy();
}

export = story;
