export {};
declare global {
    interface Workspace extends Instance {
        
    }

    interface ReplicatedStorage extends Instance {
        PlayerAnimations: Folder & {
            Punch: Animation;
        };
        Money: Folder;
    }

    interface ServerStorage extends Instance {

    }

    interface Lighting extends Instance {
        
    }
}