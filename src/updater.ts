import * as os from 'os';
import { execFile } from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';
import * as request from 'request';
import * as unzipper from 'unzipper';
import { gt, valid } from 'semver';
import * as tar from 'tar-stream';
import { ExtensionContext } from 'vscode';
import { buildConfig, Config } from './config';

const fileExists = promisify(fs.exists);

function getContent({headers}: Config, link: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        request
            .get(link, {
                headers,
            }, (err, _, body) => {
                if (err) {
                    return reject(err);
                }
                resolve(body);
            });
    });
}

async function getLatestRelease(config: Config): Promise<any> {
    const {releaseEndpoint} = config;
    let data: any = {
        version: '0.0.0',
    };
    try {
        const body = await getContent(config, releaseEndpoint);
        data = JSON.parse(body);
        data.version = data.tag_name;
    } catch (err) {
        console.error(err);
    }
    if (typeof data.version === 'undefined') {
        data.version = '0.0.0';
    }
    if (data.version.startsWith('v')) {
        data.version = data.version.substring(1);
    }
    return data;
}

async function downloadFile(isWindows: boolean, link: string, target: fs.PathLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const req = request.get(link);

        if (isWindows) {
            req
                .pipe(unzipper.Parse())
                .on('entry', (entry: any) => {
                    const fileName = entry.path;
                    if (fileName == 'phpintel.exe') {
                        entry.pipe(fs.createWriteStream(target))
                            .on('close', () => {
                                resolve();
                            });
                    }
                });
        } else {
            req
                .pipe(tar.extract())
                .on('entry', (headers, stream, next) => {
                    const fileName = headers.name;
                    if (fileName == 'phpintel') {
                        stream.pipe(fs.createWriteStream(target));
                        return;
                    }

                    stream.on('end', () => {
                        next();
                    });
                    stream.resume();
                });
        }
    });
}

export async function installRelease({exeFile, isWindows}: Config, release: any) {
    const fileName = getFileName(release.version);

    for (const asset of release.assets) {
        if (fileName == asset.name) {
            await downloadFile(isWindows, asset.browser_download_url, exeFile);
            break;
        }
    }
}

export async function checkForUpdate(context: ExtensionContext): Promise<void> {
    // const config = buildConfig(context);
    // const currentVersion = await getCurrentVersion(config);
    // const latestRelease = await getLatestRelease(config);
    // console.log(`Current version: ${currentVersion}`);
    // console.log(`Latest version: ${latestRelease.version}`);
    // if (!valid(currentVersion)) {
    //     return;
    // }
    // if (currentVersion == '' || gt(latestRelease.version, currentVersion)) {
    //     console.log(`Installing ${latestRelease.version}`);
    //     await installRelease(config, latestRelease);
    // }
}

async function getCurrentVersion({exeFile}: Config): Promise<string> {
    return fileExists(exeFile)
        .then((exists) => {
            if (!exists) {
                return '';
            }

            return new Promise<string>((resolve, reject) => {
                execFile(exeFile, ['-version'], (error, stdout, stderr) => {
                    if (error != null) {
                        reject(error);
                    }
                    resolve(stdout);
                });
            });
        });
}

const platformDict: Map<string, string> = new Map<string, string>([
    ['win32', 'windows'],
    ['darwin', 'macOS'],
    ['linux', 'linux'],
]);
const archDict: Map<string, string> = new Map<string, string>([
    ['x32', '386'],
    ['x64', 'x64'],
]);
const extensionDict: Map<string, string> = new Map<string, string>([
    ['win32', 'zip'],
    ['darwin', 'tar.gz'],
    ['linux', 'tar.gz'],
]);

function getFileName(version: string) {
    const platform: string = platformDict.has(process.platform) ?
        platformDict.get(process.platform) as string : process.platform;
    const arch: string = archDict.has(os.arch()) ?
        archDict.get(os.arch()) as string : '386';
    const ext: string = extensionDict.has(process.platform) ?
        extensionDict.get(process.platform) as string : 'tar.gz';

    return `phpintel_${version}_${platform}_${arch}.${ext}`;
}