import { LanguageClient, LanguageClientOptions, ServerOptions, TextDocumentIdentifier } from "vscode-languageclient";
import * as url from "url";
import { Uri, ExtensionContext, TextEdit, window, DecorationOptions, TextEditor, workspace } from "vscode";
import { buildConfig } from "./config";
import { Decoration } from "./decoration";

let client: LanguageClient;
let clientReady = false;
let activeEditor: TextEditor | undefined = undefined;

const hintDecorationType = window.createTextEditorDecorationType({});

export function startServer(context: ExtensionContext) {
    const { exeFile } = buildConfig(context);
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
    window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor !== undefined) {
            updateDecorations(editor, clientOptions)
        }
    });
    workspace.onDidChangeTextDocument(_ => {
        if (activeEditor !== undefined) {
            updateDecorations(activeEditor, clientOptions);
        }
    });

    client = new LanguageClient(
        'phpintel',
        'phpintel language server',
        serverOptions,
        clientOptions
    );
    client.start();
    client.onReady().then(_ => {
        clientReady = true;
        if (activeEditor !== undefined) {
            updateDecorations(activeEditor, clientOptions);
        }
    });
}

function debounce<F extends Function>(func: F, wait: number): F {
    let timeoutID: any;

    if (!Number.isInteger(wait)) {
        console.warn("Called debounce without a valid number")
        wait = 300;
    }

    // conversion through any necessary as it wont satisfy criteria otherwise
    return <any>function (this: any, ...args: any[]) {
        clearTimeout(timeoutID);
        const context = this;

        timeoutID = setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}

const updateDecorations = debounce<(e: TextEditor, clientOptions: LanguageClientOptions) => void>((editor: TextEditor, clientOptions: LanguageClientOptions) => {
    if (!clientReady) {
        return;
    }
    let uriString = editor.document.uri.toString();
    if (clientOptions.uriConverters) {
        uriString = clientOptions.uriConverters.code2Protocol(editor.document.uri);
    }
    const documentIdentifier = TextDocumentIdentifier.create(uriString);
    const decorations: DecorationOptions[] = [];
    client.sendRequest<TextEdit[]>('documentSignatures', documentIdentifier)
        .then(edits => {
            for (const edit of edits) {
                decorations.push(Decoration.paramDecoration(edit.newText, edit.range));
            }
            editor.setDecorations(hintDecorationType, decorations);
        });
}, 200);

export async function stopServer(): Promise<void> {
    if (!client) {
        return undefined;
    }

    return client.stop();
}