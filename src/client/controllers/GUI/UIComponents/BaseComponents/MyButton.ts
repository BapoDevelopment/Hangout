import { New, OnEvent } from "@rbxts/fusion";

export interface IMyButton {
    Size: UDim2;
    Position?: UDim2;
    Text: string;
}

export function MyButton(props: IMyButton) {
    return New("TextButton")({
        Size: props.Size,
        Position: props.Position ?? UDim2.fromScale(0.5,0.5),
        Text: props.Text,
        [OnEvent("Activated")]: () => {
            print("Button " + props.Text + " pressed.");
        }
    })
}