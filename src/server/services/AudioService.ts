import { OnStart, Service } from "@flamework/core";

@Service()
export class AudioService implements OnStart{
    onStart(): void {
        print("AudioService initialised.")
    }

    public playSound(sound: Sound) {
        try {
            sound.Play();
        } catch (error) {
            warn("Unable to play sound: " + tostring(sound));
        }
    }
}
