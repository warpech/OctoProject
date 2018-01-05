<h1 align="center">
  <br>
  <a href="https://github.com/Starcounter/OctoProject">
    <img src="./icons/logo.svg" alt="OctoProject logo" width="200">
  </a>
  <br>
  OctoProject
  <br>
</h1>

<h4 align="center">Browser extension that helps to work with multiple projects on GitHub</h4>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/octoproject/hgaipodkndbjmmkjielfphdnfhgnagfj">
    <img src="https://img.shields.io/chrome-web-store/v/hgaipodkndbjmmkjielfphdnfhgnagfj.svg"
         alt="Chrome Web Store">
  </a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/octoproject/">
    <img src="https://img.shields.io/amo/v/octoproject.svg">
    </a>
</p>

## Installing

You can install it for [Chrome](https://chrome.google.com/webstore/detail/octoproject/hgaipodkndbjmmkjielfphdnfhgnagfj) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/octoproject/).

## Build Setup

``` bash
# install dependencies
npm install

# build for production with minification
npm run build

```

After you build, you'll have a `build` directory with two sub-directories `webextension` and `firefox`. WebExtension folder can be used for every browser that supports WebExtension except Firefox, and you can use `firefox` directory with you-guessed-it browser.

## Adding to browser

- **Chrome**: You can add `build/webextension` folder as an unpacked extension by going to `chrome://extensions/` and clicking "**Load unpacked extension**".
- **Firefox**: You can add `build/firefox` folder as an unpacked extension by going to `about:debugging#addons` then clicking "**Load Temporary Add-on**" and selecting `manifest.json` file.
- **Opera**: You can add `build/webextension` folder as an unpacked extension by clicking **Menu** (or press alt), then selecting "Extensions", then on the top-right corner select "**Developer Mode**" then "**Load unpacked extension**", then select the folder.

## Easier development

You can run 
``` bash
npm install -g webpack
webpack -w
```
This will watch for file changes and compile again after every file modification you make. Then in the browser, you'll need to "Reload extension" after each modification. Each modification will take you ~2 seconds to see live. Easy enough.

## Publishing

After you build, you'll need to `zip` the extension and upload it to the desired store.

## To do

Write tests
