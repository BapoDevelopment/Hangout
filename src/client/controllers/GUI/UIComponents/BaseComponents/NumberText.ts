import { Computed, New, StateObject, Value } from "@rbxts/fusion";

export interface INumberText {
    Size?: UDim2;
    Position?: UDim2;
    TextXAlignment?: Enum.TextXAlignment
    TextColor3?: Color3;
    Number: StateObject<number>;
}

export function NumberText(props: INumberText) {
    return New("TextLabel")({
        TextScaled: true,
        TextXAlignment: props.TextXAlignment,
        Size: props.Size,
        Position: props.Position,
        TextColor3: props.TextColor3,
        Text: Computed(() => {
            return tostring(formatNumber(props.Number.get()))
        }),
    })
}

function formatNumber(num: number): string {
    const numStr = tostring(num);
    let formattedStr = "";
    let count = 0;
    
    for (let i = numStr.size(); i >= 1; i--) {
        formattedStr = numStr.sub(i, i) + formattedStr;
        count++;
        
        if (count % 3 === 0 && i > 1) {
            formattedStr = "," + formattedStr;
        }
    }
    
    return formattedStr;
}