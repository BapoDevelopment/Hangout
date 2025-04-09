import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core/out/flamework";
import { Janitor } from "@rbxts/janitor";
import { Logger } from "@rbxts/log/out/Logger";
import { TweenService } from "@rbxts/services";
import { AudioService } from "server/services/AudioService";

interface IAccentLampComponent extends Model {
    Intact: Model;
    Broken: Model,
    Primary: BasePart & {
        Break: Sound;
        PointLight: PointLight,
    };
    BreakingParts: Folder;
}

@Component({
    tag: "AccentLamp",
})
export class AccentLamp extends BaseComponent<{}, IAccentLampComponent> implements OnStart {
    
    protected obliterator = new Janitor();

    constructor(private audioService: AudioService, private readonly logger: Logger) {
        super();
        this.obliterator.Add(this.instance);
    }

    onStart(): void {}

    public flicker(): void {
        const pointLight: PointLight = this.instance.Primary.PointLight;

        const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Elastic, Enum.EasingDirection.InOut, 3, true, 0);
        let targetProperties = { Brightness: 0 };
        let tween = TweenService.Create(pointLight, tweenInfo, targetProperties);
        this.obliterator.Add(tween);
        tween.Play();
    }

    public break(): void {
        if(this.audioService) { this.audioService.playSound(this.instance.Primary.Break); }
        this.instance.Primary.PointLight.Enabled = false;

        this.instance.Intact.GetDescendants().forEach(instance => {
            if(!instance.IsA("BasePart")) { return; }

            instance.CanCollide = false;
            instance.CanTouch = false;
            instance.Transparency = 1;
        });

        this.instance.Broken.GetDescendants().forEach(instance => {
            if(!instance.IsA("BasePart")) { return; }

            instance.CanCollide = true;
            instance.CanTouch = true;
            instance.Transparency = 0;
        });

        this.instance.BreakingParts.GetChildren().forEach(part => {
            if(!part.IsA("BasePart")) { return; }
            part.Anchored = false;
        });
    }

    destroy(): void {
        super.destroy();
        this.obliterator.Cleanup();
    }
}