export {};
declare global {
    interface ServerStorage extends Instance {
        Doors: Folder & {
            Regular: Model;
        };
    }
}