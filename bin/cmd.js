#!/usr/bin/env node
// LICENSE : MIT
"use strict";
var init = require("../lib/init-package-json-parcel");
init().then(function () {
    process.exit(0);
}, function (error) {
    console.error(error.stack);
    process.exit(1);
});
process.on("error", function (error) {
    console.error(error);
});