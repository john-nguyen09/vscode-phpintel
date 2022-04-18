# vscode-phpintel
The extension counter part that supports phpintel language server which can be found at https://github.com/john-nguyen09/phpintel

## Installation
Steps:
- Install the vscode extension (2 ways):
    - Clone this repo, run `npm i && npm run package`, this generates a .vsix file which can be installed in vscode using "Install from VSIX"
    - Install from VSIX using the .vsix file from this repo, it is mostly packaged using the latest code with above commands
- Download/Compile the binary of the language server and store in `bin/phpintel` (`bin/phpintel.exe` if you are using Windows) relative to the `appPath`. `appPath` is a configuration inside vscode or by default it is stored at $HOME/.phpintel on any OS.
- Once installed, reload vscode. Under extension output panel for phpintel, it should say "phpintel server initialised"

## Configuration
The config is minimal & self-explanatory. But there is one useful tip which can be used to toggle inline signature:
- Use [Toggle extension](https://marketplace.visualstudio.com/items?itemName=rebornix.toggle) by Peng Lv
- Below is a sample config which can be added to vscode keyboard shortcuts:
    ```json
    {
        "key": "ctrl+k ctrl+a",
        "command": "toggle",
        "when": "editorTextFocus",
        "args": {
            "id": "minimap",
            "value": [
                {
                    "phpintel.showInlineSignatures": true
                },
                {
                    "phpintel.showInlineSignatures": false
                }
            ]
        }
    }
    ```
    This config toggles inline signature on the spot by pressing `ctrl+k ctrl+a`.
