export {};
declare global {
    interface ServerStorage extends Instance {
        Doors: Folder & {
            Regular: Model;
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
    }
}