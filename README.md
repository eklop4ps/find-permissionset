# Find Permission Set 

## Install
1. Download the `vsix`-file of the latest [release](https://github.com/eklop4ps/find-permissionset/releases)
1. Go to the Extensions panel in VS Code, and drag the `vsix` file in there.
1. Run command `Developer: Reload Window`

## Usage

1. Place your cursor at the location you want to add the permission line.
1. Run command `4PS: Find Permission set for object ID`
2. Enter the numerical ID of the object.
3. The line `LibraryLowerPermissions.AddPermissionSet(..)` with the permission set ID will be added to your editor.

**If the object ID cannot be found, adding `D365 AUTOMATION` will be proposed as fallback permission set. You can override this in setting `permissionFinder.fallbackPermissionSetName`**

## Setup

### Permission file

This extension needs a JSON file with a single object, that contains key-value combinations for each object ID (with a `ID_` prefix). It's recommended to update this file every 4-6 months.

**Example**  
```json
{
  "ID_37": "4P7SLS-ORDER-I",
  "ID_1018": "4P6GEN-GENER-I"
}
```

To generate such a file, you can follow these steps:

1. In 4PS Construct, go to the page **Expanded Permission List**
1. Set these filters
    1. Role ID: `4P*&<>FPSBAS0-TDATA-RIMD`
    1. Object Type: `Table Data`
    1. Read Permission: `Yes`
    1. Insert Permission: `Yes`
    1. Modify Permission: `Yes`
    1. Delete Permission: `Yes`
1. Open in Excel (top right corner). A file called `Expanded Permission List.xslx` will be downloaded to your machine.
1. Open Powershell in the same directory and run this command:
```powershell
$excel = New-Object -ComObject Excel.Application;$wb = $excel.Workbooks.Open((Resolve-Path "./Expanded Permission List.xlsx"));$ws = $wb.Worksheets.Item(1);$ra = @{};$rMax = ($ws.usedRange.rows).Count;Write-Host "Processing $rMax rows..." -ForegroundColor Yellow;for ($i = 2; $i -le $rMax; $i++) { $ra["ID_"+$ws.Cells.Item($i, 4).Value2] = $ws.Cells.Item($i, 1).Value2; }$ra | ConvertTo-Json -Depth 50 | Out-File -FilePath "./ExpandedPermissionList.json" -Encoding utf8;Write-Host "Done." -ForegroundColor Green;
```
1. Move the generated `ExpandedPermissionList.json` to a central location and select it via the command `4PS: Set permission file`