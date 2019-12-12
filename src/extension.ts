import { ExtensionContext } from "vscode";
import { startServer, stopServer } from "./languageServer";
import { checkForUpdate } from "./updater";

export async function activate(context: ExtensionContext): Promise<void> {
    await checkForUpdate();
    startServer();
}

export function deactivate(): Thenable<void> | undefined {
    return stopServer();
}