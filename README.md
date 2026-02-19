# Find Permission Set 

## Install
1. Download the `vsix`-file from  the latest [release](https://github.com/eklop4ps/find-permissionset/releases)
1. Go to the Extensions panel in VS Code, and drag the `vsix` file in there.
1. Run command `Developer: Reload Window`

## Setup
1. Create a permissions file, as described below, and move it to a suitable location.
1. Run command `4PS: Set permission file` and select the permission file.
1. Run command `Developer: Reload Window`

## Usage

1. Place your cursor at the location you want to add the permission line.
1. Run command `4PS: Find Permission set for object ID`
2. Enter the numerical ID of the object.
3. The line `LibraryLowerPermissions.AddPermissionSet(..)` with the permission set ID will be added to your editor.

## How to generate permissions file

1. In 4PS Construct, go to the page **Expanded Permission List**
1. Set these filters
    1. Role ID: `4P*&<>FPSBAS0-TDATA-RIMD`
    1. Object Type: `Table Data`
    1. Read Permission: `Yes`
    1. Insert Permission: `Yes`
    1. Modify Permission: `Yes`
    1. Delete Permission: `Yes`
1. Open in Excel (top right corner)
1. Open the downloaded `xslx` on your machine
1. Remove all columns except `Object ID` and `Role ID` and sort by `Object ID`
1. Save a copy of the file **as csv**, as `ExpandedPermissionList.csv`
1. Open Powershell in the same directory and run this command:
```powershell
$csvd = Import-Csv -Path "./ExpandedPermissionList.csv" -Delimiter ';';$ra = @{};foreach ($r in $csvd) { $ra[("ID_{0}" -f $r.'Object Id')] = $r.'Role Id' };$ra | ConvertTo-Json -Depth 50 | Out-File -FilePath "./ExpandedPermissionList.json" -Encoding utf8
```
1. Point the setting `Permission File Path`in VS Code to this JSON-file.