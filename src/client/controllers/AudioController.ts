import { Players } from "@rbxts/services";

export class AudioController {
	public playSound(soundId: string): void {
		const newSound = new Instance("Sound");
		newSound.SoundId = soundId;
		newSound.Parent = Players.LocalPlayer;
		newSound.Play();

		newSound.Ended.Connect(() => {
			newSound.Destroy();
		});
	}
}
