const _ = require('lodash');
const fs = require('fs-extra');
const plist = require('plist');
const pack = require('./package.json');

const ext = (resourceName) => (resourceName ? `${pack.name}.${resourceName}` : pack.name);

const getExtensionSettings = (appConfiguration) => {
  const included = _.get(appConfiguration, 'included');
  const extension = _.find(included,
    item => item.type === 'shoutem.core.extensions' && item.id === ext()
  );

  return _.get(extension, 'attributes.settings');
};

/**
 * Configures ios project for facebook authentication
 * If authentication is enabled, info.plist is configured with
 * required keys. Otherwise it's set to empty.
 * @param {*} facebookSettings 
 */
const configureFacebookSettingsIos = (facebookSettings) => {
  console.log('Configuring Facebook login settings for iOS');

  const isFacebookAuthEnabled = _.get(facebookSettings, 'enabled', false);
  const appId = _.get(facebookSettings, 'appId');
  const appName = _.get(facebookSettings, 'appName');

  const authInfoPlist = isFacebookAuthEnabled ? {
    CFBundleURLTypes: [{
      CFBundleURLSchemes: [`fb${appId}`],
    }],
    FacebookAppID: appId,
    FacebookDisplayName: appName,
  } : {};

  fs.writeFileSync('ios/Info.plist', plist.build(authInfoPlist));
};

const configureFacebookSettingsAndroid = (facebookSettings) => {
  console.log('Configuring Facebook login settings for Android');

  const isFacebookAuthEnabled = _.get(facebookSettings, 'enabled', false);
  const appId = _.get(facebookSettings, 'appId');

  const STRINGS_FILE = 'android/src/main/res/values/strings.xml';
  const authStringXml = isFacebookAuthEnabled ?
    `<resources>\n  <string name="facebook_app_id">${appId}</string>\n</resources>` :
    '<resources>\n</resources>';

  fs.writeFileSync(STRINGS_FILE, authStringXml);
};

const configureFacebookSettings = (facebookSettings) => {
  configureFacebookSettingsIos(facebookSettings);
  configureFacebookSettingsAndroid(facebookSettings);
};

exports.preBuild = function preBuild(appConfiguration) {
  const extensionSettings = getExtensionSettings(appConfiguration);

  // configure native permissions for facebook authentication
  const facebookSettings = _.get(extensionSettings, 'providers.facebook');
  configureFacebookSettings(facebookSettings);
};
