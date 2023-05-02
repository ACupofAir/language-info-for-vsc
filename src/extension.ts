import * as vscode from 'vscode';
import * as os from 'os';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	let inputMethodID = getInputMethodID();
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	let inputMethodName = getInputMethodName(inputMethodID);
	statusBarItem.text = `$(keyboard) ${inputMethodName}`;
	statusBarItem.show();

	// 监听系统输入法变化
	setInterval(() => {
		let newInputMethodID = getInputMethodID();
		let newInputMethodName = getInputMethodName(newInputMethodID);
		if (newInputMethodID !== inputMethodID) {
			inputMethodID = newInputMethodID;
			statusBarItem.text = `$(keyboard) ${newInputMethodName}`;
		}
	}, 1000);
}

function getInputMethodName(inputMethodID: string): string {
	if (inputMethodID === '1033') {
		return 'EN';
	} else if (inputMethodID === '2052') {
		return 'ZH';
	} else {
		return inputMethodID;
	}
}

function getInputMethodID(): string {
	if (os.platform() === 'darwin') {
		// macOS
		let inputSource = os.userInfo().username;
		let output = '';
		try {
			output = String.fromCharCode.apply(null, Array.from(new Uint16Array(cp.execSync(`/usr/bin/defaults read /Users/${inputSource}/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep -A 2 'KeyboardLayout Name' | tail -n 1 | cut -d '"' -f 2`))));
		} catch (error) {
			output = 'Unknown';
		}
		return output.trim();
	} else if (os.platform() === 'win32') {
		// Windows
		let output = '';
		try {
			output = String.fromCharCode.apply(null, Array.from(new Uint16Array(cp.execSync(`powershell.exe -Command "im-select.exe"`))));
		} catch (error) {
			output = 'Unknown';
		}
		return output.trim();
	} else {
		return 'Unknown';
	}
}

