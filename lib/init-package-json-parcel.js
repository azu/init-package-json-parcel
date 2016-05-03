// LICENSE : MIT
"use strict";
var init = require('init-package-json');
var path = require('path');
var fs = require("fs-extra");
var npm = require("npm");
var ObjectAssign = require("object.assign");
var dir = process.cwd();
var packageJSONPath = path.join(dir, "package.json");
function loadNPM() {
    return new Promise(function (resolve, reject) {
        npm.load({}, function (error) {
            if (error) {
                return reject(error);
            }
            resolve(npm);
        });
    });
}
function createInitConfig() {
    return {
        "scope": npm.config.get('scope'),
        "save-prefix": npm.config.get('save-prefix'),
        "save-exact": npm.config.get('save-exact')
    };
}
// write package.json - before init
function createGitBaseConfig() {
    return {
        "author": npm.config.get("init.author.name"),
        "email": npm.config.get("email"),
        "license": npm.config.get("init.license")
    };
}

// merge to package.json - after init
function createNpmBaselConfig(userName, packageName) {
    var repo = userName + "/" + packageName;
    return {
        "name": packageName,
        "repository": {
            "type": "git",
            "url": "https://github.com/" + repo + ".git"
        },
        "author": npm.config.get("init.author.name"),
        "email": npm.config.get("email"),
        "homepage": "https://github.com/" + repo,
        "license": npm.config.get("init.license"),
        "files": ["src/", "lib/"]
    };
}
/**
 * write package.json if not exist package.json
 * This is trick function.
 * https://github.com/npm/init-package-json has not configurable value for package.json
 */
function writeTemplateJSONAsync(config) {
    return new Promise(function (resolve) {
        fs.access(packageJSONPath, fs.R_OK | fs.W_OK, function (err) {
            if (!err) {
                return resolve("exists");
            }
            fs.writeFileSync(packageJSONPath, JSON.stringify(config, null, 2) + '\n', "utf-8");
            resolve("write");
        });
    });
}
function writeForceJSONAsync(config) {
    return new Promise(function (resolve) {
        fs.writeFileSync(packageJSONPath, JSON.stringify(config, null, 2) + '\n', "utf-8");
        resolve();
    });
}


function getGitUserNameAsync() {
    var exec = require('child_process').exec;
    return new Promise(function (resolve, reject) {
        exec('git config user.name', function (err, userName, stderr) {
            if (err) {
                return reject(error);
            }
            if (userName.length === 0) {
                return reject(new Error("`git config user.name` return empty string."));
            }
            resolve(userName.trim());
        });
    });
}
function initAsync(configData) {
    var initFile = path.resolve(process.env.HOME, '.npm-init');
    return new Promise(function (resolve, reject) {
        init(dir, initFile, configData, function (er, data) {
            if (er) {
                fs.removeSync(packageJSONPath);
                return reject(er);
            }
            // the data's already been written to {dir}/package.json
            // now you can do stuff with it
            resolve(data);
        });
    });
}
// too bad way
function initPackageJSONAsync() {
    return loadNPM().then(function () {
        // prepare initial data - based on Git config
        var writableConfigData = createGitBaseConfig();
        return writeTemplateJSONAsync(writableConfigData);
    }).then(function () {
        // npm init - interactive config
        return initAsync(createInitConfig());
    }).then(function (packageJSON) {
        // after merge deafest config - based on npmrc
        // only merge empty filed of package.json
        return getGitUserNameAsync().then(function (userName) {
            var packageName = path.basename(dir);
            // files, repository, homepage
            var configDataForMerge = createNpmBaselConfig(userName, packageName);
            var mergeJSON = ObjectAssign({}, configDataForMerge, packageJSON);
            return writeForceJSONAsync(mergeJSON);
        });
    });
}
module.exports = initPackageJSONAsync;