# gas-template
A template to write [Google Apps Script](https://developers.google.com/apps-script/) in TypeScript.

## Prerequisites
- [Node.js](https://nodejs.org/)
- [google/clasp](https://github.com/google/clasp)

## Getting Started
### Clone the repository
```sh
git clone git@github.com:takoyaki9n/gas-template.git <project_name>
```

### Install dependencies
```sh
cd <project_name>
npm install
```

### Configuration
#### Open `.clasp.json` and change [scriptId](https://github.com/google/clasp#scriptid-required).
```json
{
  "scriptId": "Script ID",
  "rootDir": "dist"
}
```
#### (Optional) Ignore `.clasp.json`
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

## Documents
- [Google Apps Script reference](https://developers.google.com/apps-script/reference/)

## Others
This repository is created based on
[howdy39/gas-clasp-starter](https://github.com/howdy39/gas-clasp-starter).

## License
MIT