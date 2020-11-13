![alt text](http://vsmarketplacebadge.apphb.com/version/ms-vscode.jscs.svg "Marketplace")

![alt text](http://vsmarketplacebadge.apphb.com/installs/ms-vscode.jscs.svg "Installs")

# JSCS Support for Visual Studio Code

[JSCS](https://jscs-dev.github.io) support for Visual Studio Code. 

> **❗IMPORTANT**: JSCS [is deprecated and has merged with ESLint](https://medium.com/@markelog/jscs-end-of-the-line-bc9bf0b3fdb2).
> 
> Please migrate your projects to ESLint and use the VS Code [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

# Installation and Usage

The JSCS Linter is available in the Visual Studio Code Gallery.  To install, press `F1` and
select `Extensions: Install Extensions` and then search for and select `JSCS Linting`.

Install JSCS in your workspace (or globally using the `-g` switch).

``` bash
# install locally to the workspace
npm install jscs
```

Once installed, the JSCS Linter will automatically analyze your JavaScript files and return style warnings
based on the rules you define in a `.jscsrc` file or in your settings.

## Configuring the JSCS Linter

The best way to configure how the linter flags issues in your code is to create a `.jscsrc` file in the 
root of your workspace. The VS Code JSCS Linter will look for this file first and if no `.jscsrc` file is found
it will look into your custom [Settings](https://code.visualstudio.com/docs/customization/userandworkspace). 

Here are the available settings options:

Enable or disable the JSCS Linter for JavaScript files in this workspace.
``` json
"jscs.enable": boolean
```

The JSCS preset to use, possible values: `airbnb`, `crockford`, `google`, `grunt`, `idiomatic`, `jquery`, `mdcs`, `node-style-guide`, `wikimedia`, `wordpress`, `yandex`.
``` json				
"jscs.preset": string
```

Disable the JSCS Linter if no `.jscsrc` configuration file is found, default is `false`.
``` json
"jscs.disableIfNoConfig": boolean
```

Set [JSCS configuration rules](http://jscs.info/rules) in your settings file directly.
``` json
"jscs.configuration": object
```

# Development
The JSCS Linter is a great way to learn how to create extensions for VS Code. 
We also love enhancements and bug fixes!  Here's how to get started:

``` bash
git clone https://github.com/microsoft/vscode-jscs
cd vscode-jscs/jscs
npm install
cd ../jscs-server
npm install
```
## Developing the Server
- Open VS Code on the `jscs-server` folder
- Run `npm run compile` or `npm run watch` to build the server and copy it into the `jscs` folder
- To debug, press F5 *once the extension is loaded*, this will attach the debugger to the server. 
If you try to attach too soon you will get a timeout error from the debugger.

## Developing the Extension
- Open VS Code on the `jscs` folder
- To run, press `F5` to build the app, launch the extension environment, and attach a debugger

Enjoy!

# License
[MIT](LICENSE)
