// LICENSE : MIT
"use strict";
var init = require("../lib/init-package-json-parcel");
init().then(function () {
    process.exit(0);
}, function (error) {
    console.error(error);
    process.exit(1);
});
process.on("error", function (error) {
    console.error(error);
});