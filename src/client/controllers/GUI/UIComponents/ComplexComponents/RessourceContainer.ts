import { New, StateObject, Observer, Value, Children, ForValues, Tween } from "@rbxts/fusion";
import { Icon, IIcon } from "../BaseComponents/Icon";

let ressources = Value<IIcon[]>([]);

export interface IRessourceContainer {
	Icon?: StateObject<ContentId>;
	amount: Value<number>;
	spawnPosition: Value<UDim2>;
	targetPosition: Value<UDim2>;
	radius: number;
    timeToPos: number;
    transparencyTime: number;
    transperentAtThreshold: Vector2;
    DisplaySize?: Value<UDim2>;
    DefaultDisplaySize?: UDim2;
    TargetDisplaySize?: UDim2;
}

export function RessourceContainer(props: IRessourceContainer) {
	const observer = Observer(props.amount);
	observer.onChange(() => {
		if (props.amount.get() === 0) {
			return;
		}
		spawnRessources(props);
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

function spawnRessources(props: IRessourceContainer): void {
	const random = new Random();
	const spreaded: Map<number, boolean> = new Map();
	const transparentAt: Map<number, number> = new Map();
	for (let i = 0; i < props.amount.get(); i++) {
		transparentAt.set(i, math.random(props.transperentAtThreshold.X, props.transperentAtThreshold.Y));
	}
	for (let i = 0; i < props.amount.get(); i++) {
		const angle = random.NextNumber(0, math.pi * 2);
		const rad = random.NextNumber(0, props.radius * 2);

		const offsetX = math.cos(angle) * rad;
		const offsetY = math.sin(angle) * rad;

		const firstTargetPosition = new UDim2(
			props.spawnPosition.get().X.Scale,
			props.spawnPosition.get().X.Offset + offsetX,
			props.spawnPosition.get().Y.Scale,
			props.spawnPosition.get().Y.Offset + offsetY
		);

		const firstPosition = Value(props.spawnPosition.get());
		let animatedFirstPosition = Tween(firstPosition, new TweenInfo(props.timeToPos, Enum.EasingStyle.Quad));

		const startTransparency = Value(0);
		let animatedTransparency = Tween(startTransparency, new TweenInfo(props.transparencyTime, Enum.EasingStyle.Quad));

		const resource: IIcon = { Position: animatedFirstPosition, Transparency: animatedTransparency };
		ressources.set([...ressources.get(), resource]);

		firstPosition.set(firstTargetPosition);
		const observer = Observer(animatedFirstPosition);
		observer.onChange(() => {
			if (animatedFirstPosition.get() === firstTargetPosition) {
				spreaded.set(i, true);
				firstPosition.set(props.targetPosition.get());
			}

			const threshold = transparentAt.get(i);
			if (
				spreaded.get(i) === true &&
				threshold &&
				math.abs(animatedFirstPosition.get().X.Offset - props.targetPosition.get().X.Offset) < threshold &&
				math.abs(animatedFirstPosition.get().Y.Offset - props.targetPosition.get().Y.Offset) < threshold
			) {
				startTransparency.set(1);
                if(props.DisplaySize && props.TargetDisplaySize) {
                    props.DisplaySize.set(props.TargetDisplaySize);
                }
			}

			if (animatedFirstPosition.get() === props.targetPosition.get()) {
				ressources.set(ressources.get().filter((res) => res !== resource));
                if(props.DisplaySize && props.DefaultDisplaySize) {
                    props.DisplaySize.set(props.DefaultDisplaySize);
                }
			}
		});

		task.delay((props.timeToPos * 2) * 1.1, () => {
			if (ressources.get().includes(resource)) {
				ressources.set(ressources.get().filter((res) => res !== resource));
			}
		});
	}
}
