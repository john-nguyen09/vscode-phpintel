import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient";
import * as url from "url";
import { Uri, ExtensionContext } from "vscode";
import { buildConfig } from "./config";

let client: LanguageClient;

export function startServer(context: ExtensionContext) {
    const {exeFile} = buildConfig(context);
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