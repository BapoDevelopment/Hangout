import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services"

@Controller()
export class AnimationController implements OnStart {

    onStart(): void {}

    public play(animationID: string): void {
        const player = Players.LocalPlayer;

        if(!player) { return; }
        if(!player.Character) { return; }
        if(!animationID) { return; }
        const animationIDCasted: string = animationID as string;
        if(!animationIDCasted) { return; }
        
        const humanoid: Humanoid | undefined = player.Character.WaitForChild("Humanoid") as Humanoid;
        if(!humanoid) { return; }

        let animation: Animation = new Instance("Animation");
        animation.AnimationId = animationID;
        
        const animator: Animator | undefined = humanoid.WaitForChild("Animator") as Animator;
        if(!animator) { return; }

        const animationTrack: AnimationTrack = animator.LoadAnimation(animation);

        animationTrack.Play();
    }
}