import * as path from 'path';
import { ExtensionContext } from "vscode";
const homedir = require('os').homedir();
import * as fs from 'fs';

const releaseEndpoint = 'https://api.github.com/repos/john-nguyen09/phpintel/releases/latest';
const headers = {
    'User-Agent': 'Mozilla/5.0',
};
const isWindows = process.platform == 'win32';
const appPath = path.join(homedir, '.phpintel');

export type Config = {
    releaseEndpoint: string;
    headers: {
        'User-Agent': string;
    };
    isWindows: boolean;
    exeFile: string;
    appPath: string;
}

export function buildConfig(context: ExtensionContext): Config {
    if (!fs.existsSync(path.join(appPath, 'bin'))) {
        fs.mkdirSync(path.join(appPath, 'bin'), { recursive: true } as any);
    }
    return {
        releaseEndpoint,
        headers,
        isWindows,
        exeFile: path.resolve(appPath, 'bin', isWindows ? 'phpintel.exe' : 'phpintel'),
        appPath,
    }
}