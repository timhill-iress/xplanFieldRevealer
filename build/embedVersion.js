const fs = require('fs');

var pjson = fs.readFileSync("./package.json", {encoding:"UTF8"});
var p = JSON.parse(pjson);
var js = fs.readFileSync("./dist/xplanFieldRevealer.js", {encoding:"UTF8"});
var re = new RegExp("{version}", "g");
var newJs = js.replace(re, p.version);
fs.writeFileSync("./dist/xplanFieldRevealer.js",newJs, {encoding:"UTF8"});
