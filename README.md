# Splatoon Logger
A [Google Apps Script](https://developers.google.com/apps-script/) project to download buttle data from SplatNet 2.

## Prerequisites
- [Node.js](https://nodejs.org/)
- [google/clasp](https://github.com/google/clasp)

## Getting Started

### clasp
You can skip this section if you have already installed `clasp`.
#### Install
```sh
npm i @google/clasp -g
```
#### Login
```sh
clasp login
```
And follow the instruction.
#### Enable Google Apps Script API
Visit [here](https://script.google.com/home/usersettings) and enable Google Apps Script API.

### Clone this repository
```sh
git clone git@github.com:takoyaki9n/splatoon-logger.git
```

### Install dependencies
```sh
cd splatoon-logger
npm install
```

### Configuration
#### Open `.clasp.json` and change scriptId (see [here](https://github.com/google/clasp#scriptid-required)).
```json
{
  "scriptId": "Script ID",
  "rootDir": "dist"
}
```

#### Ignore `.clasp.json` (Optional)
If you don't want to push your scriptId:
```bash
git update-index --assume-unchanged .clasp.json
```

### Build project
```sh
npm run build
```

### Push
```sh
clasp push
```

### Set script properties
Set following script properties from `File > Project properties > Script properties`
#### iksm_session
Obtain `iksm_session` cookie (see [here](https://github.com/frozenpandaman/splatnet2statink/wiki/mitmproxy-instructions)) and save the value as `iksm_session@SplatNet2`.
#### Auto report (Optional)
If you want to enable auto report of disconnection set `report_enabled@SplatNet2` as `true`.

### Set time-driven trriger
Open `Edit > Current project's triggers` or click a timer icon under the menu bar and set `pullNextResult` as a time-driven trigger.
Recomended option is `Munites timer`, `Every 5 minutes`.

## Log
Open `View > Stackdriver logging`.

## Documents
- [Google Apps Script reference](https://developers.google.com/apps-script/reference/)
- [Nintendo Switch App REST API](https://github.com/ZekeSnider/NintendoSwitchRESTAPI)
- [stat.ink API](https://github.com/fetus-hina/stat.ink/blob/master/API.md)

## Others
This repository is copied from [takoyaki9n/gas-template](https://github.com/takoyaki9n/gas-template).

## License
MIT