"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
const url = __importStar(require("url"));
const vscode_1 = require("vscode");
const config_1 = require("./config");
let client;
function startServer() {
    let serverOptions = {
        command: config_1.exeFile,
    };
    let clientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'php' },
        ],
        uriConverters: {
            code2Protocol: uri => url.format(url.parse(uri.toString(true))),
            protocol2Code: str => vscode_1.Uri.parse(str)
        },
    };
    client = new vscode_languageclient_1.LanguageClient('phpintel', 'phpintel language server', serverOptions, clientOptions);
    client.start();
}
exports.startServer = startServer;
function stopServer() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client) {
            return undefined;
        }
        return client.stop();
    });
}
exports.stopServer = stopServer;
