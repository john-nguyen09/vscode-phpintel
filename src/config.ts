import * as path from 'path';

export const releaseEndpoint = 'https://api.github.com/repos/john-nguyen09/phpintel/releases/latest';
export const headers = {
    'User-Agent': 'Mozilla/5.0',
};
export const isWindows = process.platform == 'win32';
export const exeFile = path.join(__dirname, '..', 'bin', isWindows ? 'phpintel.exe' : 'phpintel');