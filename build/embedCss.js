const fs = require('fs');

var css = fs.readFileSync("./css-dist/xplanFieldRevealer.min.css", {encoding:"UTF8"});
var js = fs.readFileSync("./src/xplanFieldRevealer.js", {encoding:"UTF8"});
var newJs = js.replace("{css}", css);
fs.writeFileSync("./dist/xplanFieldRevealer.js",newJs, {encoding:"UTF8"});
