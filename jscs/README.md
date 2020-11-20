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
We also love enhancements and bug fixes!  To get started, [clone the repo](https://github.com/microsoft/vscode-jscs)
and check out the [README.md](https://github.com/Microsoft/vscode-jscs/blob/master/README.md)
for more details

Enjoy!

# License
[MIT](LICENSE)