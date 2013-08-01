/**
* TroopJS requirejs/shadow
* @license MIT http://troopjs.mit-license.org/ © Tristan Guo mailto:tristanguo@outlook.com
*/
define([ "text" ], function (text) {
	"use strict";

	var EXPORTS = "exports";
	var EXTENSION = ".js";
	var PATTERN = /(.+?)#(.+)$/;
	var REQUIRE_VERSION = require.version;
	var buildMap = {};

	function amdify (scriptText, hashVal) {
		var pattern = /([^=&]+)=([^&]+)/g;
		var deps = [];
		var args = [];
		var m;

		while (m = pattern.exec(hashVal)) {
			if (m[1] === EXPORTS) {
				scriptText += ";\nreturn " + m[2] + ";\n";
			}
			else {
				deps.push("'" + m[2] + "'");
				args.push(m[1]);
			}
		}

		return "define([ " + deps.join(", ") + " ], function (" + args.join(", ") + ") {\n"
			+ scriptText
			+ "});"
	}

	return {
		load : function (name, req, onLoad, config) {
			var hashVal;
			var m;

			if (m = PATTERN.exec(name)) {
				name = m[1];
				hashVal = m[2];

				text.get(req.toUrl(name + EXTENSION), function(data) {
					var compiled = amdify(data, hashVal);

					if (config.isBuild) {
						buildMap[name] = compiled;
					}

					onLoad.fromText(name, compiled);

					if (REQUIRE_VERSION < "2.1.0") {
						req([ name ], onLoad);
					}	
				});
			}
			else {
				req([ name ], onLoad);
			}
		},

		write : function (pluginName, moduleName, write) {
			if (moduleName in buildMap) {
				write("define('" + pluginName + "!" + moduleName + "', function () { return '" + buildMap[moduleName].toString() + "';});\n");
			}
		}
	};
});