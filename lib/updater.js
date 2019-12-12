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
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const util_1 = require("util");
const request = __importStar(require("request"));
const unzipper = __importStar(require("unzipper"));
const semver_1 = require("semver");
const tar = __importStar(require("tar-stream"));
const config_1 = require("./config");
const fileExists = util_1.promisify(fs.exists);
function getContent(link) {
    return new Promise((resolve, reject) => {
        request
            .get(link, {
            headers: config_1.headers,
        }, (err, _, body) => {
            if (err) {
                return reject(err);
            }
            resolve(body);
        });
    });
}
function getLatestRelease() {
    return __awaiter(this, void 0, void 0, function* () {
        const body = yield getContent(config_1.releaseEndpoint);
        const data = JSON.parse(body);
        data.version = data.tag_name;
        if (data.version.startsWith('v')) {
            data.version = data.version.substring(1);
        }
        return data;
    });
}
function downloadFile(link, target) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const req = request.get(link);
            if (config_1.isWindows) {
                req
                    .pipe(unzipper.Parse())
                    .on('entry', (entry) => {
                    const fileName = entry.path;
                    if (fileName == 'phpintel.exe') {
                        entry.pipe(fs.createWriteStream(target))
                            .on('close', () => {
                            resolve();
                        });
                    }
                });
            }
            else {
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
    });
}
function installRelease(release) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = getFileName(release.version);
        for (const asset of release.assets) {
            if (fileName == asset.name) {
                yield downloadFile(asset.browser_download_url, config_1.exeFile);
                break;
            }
        }
    });
}
exports.installRelease = installRelease;
function checkForUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentVersion = yield getCurrentVersion();
        const latestRelease = yield getLatestRelease();
        console.log(`Current version: ${currentVersion}`);
        console.log(`Latest version: ${latestRelease.version}`);
        if (currentVersion == '' || semver_1.gt(latestRelease.version, currentVersion)) {
            console.log(`Installing ${latestRelease.version}`);
            yield installRelease(latestRelease);
        }
    });
}
exports.checkForUpdate = checkForUpdate;
function getCurrentVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        return fileExists(config_1.exeFile)
            .then((exists) => {
            if (!exists) {
                return '';
            }
            return new Promise((resolve, reject) => {
                child_process_1.execFile(config_1.exeFile, ['-version'], (error, stdout, stderr) => {
                    if (error != null) {
                        reject(error);
                    }
                    resolve(stdout);
                });
            });
        });
    });
}
const platformDict = new Map([
    ['win32', 'windows'],
    ['darwin', 'macOS'],
    ['linux', 'linux'],
]);
const archDict = new Map([
    ['x32', '386'],
    ['x64', 'x64'],
]);
const extensionDict = new Map([
    ['win32', 'zip'],
    ['darwin', 'tar.gz'],
    ['linux', 'tar.gz'],
]);
function getFileName(version) {
    const platform = platformDict.has(process.platform) ?
        platformDict.get(process.platform) : process.platform;
    const arch = archDict.has(os.arch()) ?
        archDict.get(os.arch()) : '386';
    const ext = extensionDict.has(process.platform) ?
        extensionDict.get(process.platform) : 'tar.gz';
    return `phpintel_${version}_${platform}_${arch}.${ext}`;
}
