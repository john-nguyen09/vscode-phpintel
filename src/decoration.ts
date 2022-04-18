import { Range, DecorationOptions, workspace } from "vscode";

export namespace Decoration {
    export function paramDecoration(variableName: string, range: Range): DecorationOptions {
        const text = `${variableName.substring(1)}:`;
        const editor = workspace.getConfiguration('editor');
        const fontSize = (editor.get('fontSize') as number) * 0.875;
        return {
            range,
            renderOptions: {
                before: {
                    color: '#6C706F',
                    // backgroundColor: '#DEDEDE',
                    contentText: text,
                    margin: "0 2px 0 0; padding: 3px",
                    fontWeight: `400; font-size: ${fontSize}px`,
                },
            },
        }
    }
}