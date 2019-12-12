"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
exports.releaseEndpoint = 'https://api.github.com/repos/john-nguyen09/phpintel/releases/latest';
exports.headers = {
    'User-Agent': 'Mozilla/5.0',
};
exports.isWindows = process.platform == 'win32';
exports.exeFile = path.join(__dirname, '..', 'bin', exports.isWindows ? 'phpintel.exe' : 'phpintel');
