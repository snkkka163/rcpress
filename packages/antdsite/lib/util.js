const path = require('path');
const defaultConfig = require(path.resolve(__dirname, '../__default__/default-config'));
const chalk = require('chalk');

const configName = '.antdsite.js';
let userConfig;

module.exports.getUserConfig = () => {
  if (userConfig) return userConfig;

  let configPath;

  try {
    configPath = path.resolve(configName);
    userConfig = require(configPath);
  } catch (error) {
    console.error(
      chalk.red(
        `[AntdSite]: Error when parsing ${configName} at ${configPath}, fallback to default config, the detail error is bellow:`
      )
    );
    console.error(error);
    userConfig = defaultConfig;
  }

  return userConfig;
};

function isObject(receive) {
  return Object.prototype.toString.call(receive) === '[object Object]';
}

function deepMerge(from, to) {
  for (var key in from) {
    if (isObject(from[key]) && to && isObject(to[key])) {
      deepMerge(from[key], to[key]);
    } else {
      if (!to) {
        to = {};
      }

      to[key] = from[key];
    }
  }

  return to;
}

module.exports.getFinalConfig = function() {
  const config = module.exports.getUserConfig();

  // merge with default config.
  const finalConfig = deepMerge(config, defaultConfig);

  // validate & fix config.
  validateConfig(finalConfig);

  // We stringify head property here because type of head's value is dynamic and it is not easy to be
  // inferred by gatsbyJs.
  finalConfig.head = JSON.stringify(finalConfig.head);

  return finalConfig;
};

function validateConfig(config) {
  const themeLocales = config.themeConfig.locales;
  const locales = config.locales;

  if (locales) {
    for (let key in locales) {
      if (key != '/') {
        const newKey = '/' + key.replace(/(^\/)|(\/$)/g, '') + '/';

        if (key !== newKey) {
          locales[newKey] = locales[key];
          delete locales[key];
        }
      }
    }
  }

  if (themeLocales) {
    for (let key in themeLocales) {
      if (key != '/') {
        const newKey = '/' + key.replace(/(^\/)|(\/$)/g, '') + '/';

        if (key !== newKey) {
          themeLocales[newKey] = themeLocales[key];
          delete themeLocales[key];
        }
      }
    }
  }
}
