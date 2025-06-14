import { Children, New, Value } from "@rbxts/fusion";
import { App } from "./App";
import { TopBar } from "../TopBar";
import { AppIcon } from "../AppIcon";
import { RunService } from "@rbxts/services";
import { ClientSettings } from "client/ClientSettings";
import { Chat } from "./Chat";

const scrollingFrame = New("ScrollingFrame")({
	Name: "Apps",
	AnchorPoint: new Vector2(0.5, 0),
	Size: UDim2.fromScale(1, 1),
	Position: UDim2.fromScale(0.5, 0),
	BackgroundTransparency: 1,
	VerticalScrollBarInset: Enum.ScrollBarInset.None,
	AutomaticCanvasSize: Enum.AutomaticSize.Y,
	ScrollBarImageTransparency: 1,
	ScrollBarThickness: 0,
	ScrollingEnabled: true,
});

const gridLayout = New("UIGridLayout")({
	CellSize: UDim2.fromScale(0.275, 0.275),
	CellPadding: UDim2.fromScale(0.0425, 0.025),
	SortOrder: Enum.SortOrder.LayoutOrder,
	HorizontalAlignment: Enum.HorizontalAlignment.Center,
});

gridLayout.Parent = scrollingFrame;

gridLayout.GetPropertyChangedSignal("AbsoluteContentSize").Connect(() => {
	const contentHeight = gridLayout.AbsoluteContentSize.Y;
	const visibleHeight = scrollingFrame.AbsoluteWindowSize.Y;
	scrollingFrame.ScrollingEnabled = contentHeight > visibleHeight;
});

RunService.Heartbeat.Connect(() => {
	const contentHeight = gridLayout.AbsoluteContentSize.Y;
	const visibleHeight = scrollingFrame.AbsoluteWindowSize.Y;
	scrollingFrame.ScrollingEnabled = contentHeight > visibleHeight;
});

gridLayout.Parent = scrollingFrame;
AppIcon({ Name: "Messenger", Color: Color3.fromRGB(39, 174, 96), Icon:  ClientSettings.GUI.Smartphone.Icons.Messenger, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Hilfe", Color: Color3.fromRGB(41, 125, 186), Icon: ClientSettings.GUI.Smartphone.Icons.Help, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Notruf", Color: Color3.fromRGB(231, 76, 60), Icon: ClientSettings.GUI.Smartphone.Icons.Emergency, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Laden", Color: Color3.fromRGB(243, 156, 18), Icon: ClientSettings.GUI.Smartphone.Icons.Store, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Einstellungen", Color: Color3.fromRGB(69, 77, 77), Icon: ClientSettings.GUI.Smartphone.Icons.Settings, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Bank", Color: Color3.fromRGB(41, 125, 186), Icon: ClientSettings.GUI.Smartphone.Icons.Bank, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Server", Color: Color3.fromRGB(142, 68, 173), Icon: ClientSettings.GUI.Smartphone.Icons.Server, AppModule: Chat }).Parent = scrollingFrame;
AppIcon({ Name: "Admin", Color: Color3.fromRGB(38, 173, 97), Icon: ClientSettings.GUI.Smartphone.Icons.Admin, AppModule: Chat }).Parent = scrollingFrame;

export const Home: App = {
	Name: "Home",
	Element: () =>
		New("Frame")({
			Name: "Homescreen",
			Size: UDim2.fromScale(1, 1),
			BackgroundColor3: Color3.fromRGB(168, 33, 135),
			BackgroundTransparency: 1,
			[Children]: [
				TopBar({
					Money: Value("1.25M €"),
					Time: Value("17:52"),
				}),
				New("Frame")({
					Name: "Apps",
					Size: UDim2.fromScale(0.94, 0.85),
					AnchorPoint: new Vector2(0.5, 0),
					Position: UDim2.fromScale(0.5, 0.135),
					BackgroundColor3: Color3.fromRGB(168, 33, 135),
					BackgroundTransparency: 1,
					[Children]: [
						scrollingFrame
					],
				}),
			],
		}),
};