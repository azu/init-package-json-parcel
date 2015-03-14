// LICENSE : MIT
"use strict";
var init = require('init-package-json');
var path = require('path');
var fs = require("fs-extra");
var npm = require("npm");
// a path to a promzard module.  In the event that this file is
// not found, one will be provided for you.
var initFile = path.resolve(process.env.HOME, '.npm-init');
var dir = process.cwd();
var packageJSONPath = path.join(dir, "package.json");
function createConfigAsync(userName, packageName) {
    var repo = userName + "/" + packageName;
    return new Promise(function (resolve, reject) {
        npm.load({}, function (error) {
            if (error) {
                return reject(error);
            }
            resolve({
                "name": packageName,
                "repository": {
                    "type": "git",
                    "url": "https://github.com/" + repo + ".git"
                },
                "homepage": "https://github.com/" + repo,
                "author": npm.config.get("init.author.name"),
                "email": npm.config.get("email"),
                "license": npm.config.get("init.license")
            })
        })
    });
}

/**
 * write package.json if not exist pacakge.json
 * This is trick function.
 * https://github.com/npm/init-package-json has not configurable value for pacakge.json
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
function initPackageJSONAsync() {
    return getGitUserNameAsync().then(function (userName) {
        var packageName = path.basename(dir);
        console.log("user.name: " + userName);
        return createConfigAsync(userName, packageName).then(function (configData) {
            var init = initAsync.bind(this, configData);
            return writeTemplateJSONAsync(configData).then(init);
        });
    });
}

module.exports = initPackageJSONAsync;