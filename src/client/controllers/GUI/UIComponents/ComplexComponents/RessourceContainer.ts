import { New, StateObject, Observer, Value, Children, ForValues, Tween } from "@rbxts/fusion";
import { Icon, IIcon } from "../BaseComponents/Icon";

let ressources = Value<IIcon[]>([]);

export interface IRessourceContainer {
	Icon?: StateObject<ContentId>;
	amount: Value<number>;
	spawnPosition: Value<UDim2>;
	targetPosition: Value<UDim2>;
	radius?: number;
    DisplaySize?: Value<UDim2>;
    DefaultDisplaySize?: UDim2;
    TargetDisplaySize?: UDim2;
}

export function RessourceContainer(props: IRessourceContainer) {
	const radius = props.radius ?? 50;
	const observer = Observer(props.amount);
	observer.onChange(() => {
		if (props.amount.get() === 0) {
			return;
		}
		spawnRessources(props.spawnPosition
            , props.targetPosition
            , radius
            , props.DisplaySize
            , props.DefaultDisplaySize
            , props.TargetDisplaySize
            , props.amount.get());
		props.amount.set(0);
	});

	return New("Frame")({
		Name: "RessourceContainer",
		BackgroundTransparency: 1,
		Size: UDim2.fromScale(1, 1),
		[Children]: ForValues(
			ressources,
			(ressource: IIcon) => {
				return Icon({
					Position: ressource.Position,
					Icon: props.Icon,
					Transparency: ressource.Transparency,
				});
			},
			(instance) => instance.Destroy()
		),
	});
}

function spawnRessources(
	spawnPosition: Value<UDim2>,
	targetPosition: StateObject<UDim2>,
	radius: number,
	displaySize: Value<UDim2> | undefined,
    defaultDisplaySize: UDim2 | undefined,
    targetDisplaySize: UDim2 | undefined,
	count: number
): void {
	const random = new Random();
	const spreaded: Map<number, boolean> = new Map();
	const transparentAt: Map<number, number> = new Map();
	for (let i = 0; i < count; i++) {
		transparentAt.set(i, math.random(1, 8));
	}
	for (let i = 0; i < count; i++) {
		const angle = random.NextNumber(0, math.pi * 2);
		const rad = random.NextNumber(0, radius * 2);

		const offsetX = math.cos(angle) * rad;
		const offsetY = math.sin(angle) * rad;

		const firstTargetPosition = new UDim2(
			spawnPosition.get().X.Scale,
			spawnPosition.get().X.Offset + offsetX,
			spawnPosition.get().Y.Scale,
			spawnPosition.get().Y.Offset + offsetY
		);

		const firstPosition = Value(spawnPosition.get());
		let animatedFirstPosition = Tween(firstPosition, new TweenInfo(0.25, Enum.EasingStyle.Quad));

		const startTransparency = Value(0);
		let animatedTransparency = Tween(startTransparency, new TweenInfo(0.1, Enum.EasingStyle.Quad));

		const resource: IIcon = { Position: animatedFirstPosition, Transparency: animatedTransparency };
		ressources.set([...ressources.get(), resource]);

		firstPosition.set(firstTargetPosition);
		const observer = Observer(animatedFirstPosition);
		observer.onChange(() => {
			if (animatedFirstPosition.get() === firstTargetPosition) {
				spreaded.set(i, true);
				firstPosition.set(targetPosition.get());
			}

			const threshold = transparentAt.get(i);
			if (
				spreaded.get(i) === true &&
				threshold &&
				math.abs(animatedFirstPosition.get().X.Offset - targetPosition.get().X.Offset) < threshold &&
				math.abs(animatedFirstPosition.get().Y.Offset - targetPosition.get().Y.Offset) < threshold
			) {
				startTransparency.set(1);
                if(displaySize && targetDisplaySize) {
                    displaySize.set(targetDisplaySize);
                }
			}

			if (animatedFirstPosition.get() === targetPosition.get()) {
				ressources.set(ressources.get().filter((res) => res !== resource));
                if(displaySize && defaultDisplaySize) {
                    displaySize.set(defaultDisplaySize);
                }
			}
		});

		task.delay(0.75, () => {
			if (ressources.get().includes(resource)) {
				ressources.set(ressources.get().filter((res) => res !== resource));
			}
		});
	}
}
