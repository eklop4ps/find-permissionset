const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const setPermissionFile = vscode.commands.registerCommand('permission-finder.setPermissionFile', async function () {
		try {
			const options = {
				canSelectMany: false,
				openLabel: 'Select Permission File',
				filters: {
					'JSON Files': ['json']
				}
			};

			const fileUri = await vscode.window.showOpenDialog(options);

			if (fileUri && fileUri[0]) {
				const filePath = fileUri[0].fsPath;
				const config = vscode.workspace.getConfiguration('permissionFinder');
				await config.update('permissionFilePath', filePath, vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage(`Permission file path set to: ${filePath}`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error selecting file: ${error.message}`);
		}
	});

	const searchPermissionSet = vscode.commands.registerCommand('permission-finder.searchPermissionSet', async function () {
		try {
			const config = vscode.workspace.getConfiguration('permissionFinder');
			const permissionFilePath = config.get('permissionFilePath');
			const fallbackPermissionSetName = config.get('fallbackPermissionSetName', 'D365 AUTOMATION');

			if (!permissionFilePath) {
				vscode.window.showErrorMessage('Permission file path is not configured. Please set "permissionFilePath" in settings.');
				return;
			}

			if (!fs.existsSync(permissionFilePath)) {
				vscode.window.showErrorMessage(`Permission file not found at ${permissionFilePath}`);
				return;
			}

			const fileContent = fs.readFileSync(permissionFilePath, 'utf8');
			const cleanedContent = fileContent.replace(/\r|\n/g, '').replace("\ufeff", "");
			const permissions = JSON.parse(cleanedContent);
		
			let objectIdInput = await vscode.window.showInputBox({
				prompt: 'Enter the Object ID',
				placeHolder: 'Object ID'
			});

			if (!objectIdInput) {
				return;
			}

			const objectId = objectIdInput.trim();

			if(isNaN(objectId)) {
				vscode.window.showErrorMessage(`"${objectId}" is not valid. Please try again with a numeric value.`);
			}

			let roleId = permissions['ID_'+objectId];

			if (roleId === undefined) {
				const insertAutomation = await vscode.window.showQuickPick(['Yes', 'No'], {
					placeHolder: `No results for object ID "${objectId}". Do you want to insert ${fallbackPermissionSetName} instead?`
				});

				roleId = (insertAutomation === 'Yes') ? fallbackPermissionSetName : null;
			}

			if (!roleId) {
				return;
			}

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active text editor found.');
				return;
			}

			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, `LibraryLowerPermissions.AddPermissionSet('${roleId.toString()}');`);
			});

		} catch (error) {
			vscode.window.showErrorMessage(`Error: ${error.message}`);
		}
	});

	context.subscriptions.push(setPermissionFile, searchPermissionSet);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
