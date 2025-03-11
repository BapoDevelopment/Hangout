export {};
declare global {
    interface Workspace extends Instance {
        Rooms: Folder;
    }

    interface ReplicatedStorage extends Instance {
        Monsters: Folder & {
            Rush: Model;
        }
    }

    interface ServerStorage extends Instance {
        Doors: Folder & {
            Regular: Model;
            Locked: Model;
            Blocked: Model;
        };
        Rooms: Folder & {
            Necessary: Folder & {
                Lobby: Model;
                Room100: Model;
            };
            Regular: Folder & {
                Room1: Model;
            }
        };
        Furniture: Folder & {
            Drawer: Model;
            Wardrobe: Model;
            Bed: Model;
            AccentLamp: Model;
        };
        Tools: Folder & {
            Key: Tool & {
                Handle: MeshPart & {
                    ProximityPromtPosition: Attachment;
                    ProximityPrompt: ProximityPrompt;
                };
            };
        }
    }
}