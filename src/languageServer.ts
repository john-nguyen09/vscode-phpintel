import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient";
import * as url from "url";
import { Uri } from "vscode";
import { exeFile } from "./config";

let client: LanguageClient;

export function startServer() {
    let serverOptions: ServerOptions = {
        command: exeFile,
    };

    let clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'php' },
        ],
        uriConverters: {
            code2Protocol: uri => url.format(url.parse(uri.toString(true))),
            protocol2Code: str => Uri.parse(str)
        },
    }

    client = new LanguageClient(
        'phpintel',
        'phpintel language server',
        serverOptions,
        clientOptions
    );

    client.start();
}

export async function stopServer(): Promise<void> {
    if (!client) {
        return undefined;
    }

    return client.stop();
}