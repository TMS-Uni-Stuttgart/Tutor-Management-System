const args = process.argv;
var exec = require("child_process").execSync;
var arg3 = "";
if (args[4] != undefined) {
  arg3 = args[4];
}

var cmd = "cd client && " + args[2] + " " + args[3] + " " + arg3;

var options = {
  encoding: "utf8"
};

console.log(exec(cmd, options));
