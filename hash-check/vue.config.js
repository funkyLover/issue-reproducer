const PrettierPlugin = require("prettier-webpack-plugin");
const md5 = require("md5");
const fs = require("fs-extra");

function compareModules(a, b) {
  if (a.resource < b.resource) {
    return -1;
  }
  if (a.resource > b.resource) {
    return 1;
  }
  return 0;
}

function getModuleSource(module) {
  var _source = module._source || {};
  return _source._value || "";
}

function concatenateSource(result, module_source) {
  return result + module_source;
}

function WebpackMd5Hash() {}
let count = 1;
WebpackMd5Hash.prototype.apply = function(compiler) {
  compiler.plugin("compilation", function(compilation) {
    compilation.plugin("chunk-hash", function(chunk, chunkHash) {
      var modules = chunk.mapModules
        ? chunk.mapModules(getModuleSource)
        : chunk.modules.map(getModuleSource);
      var source = modules.sort(compareModules).reduce(concatenateSource, ""); // we provide an initialValue in case there is an empty module source. Ref: http://es5.github.io/#x15.4.4.21
      fs.ensureFileSync(`./soucre/${count}`);
      fs.writeFileSync(`./soucre/${count}`, source);
      count += 1;
      var chunk_hash = md5(source);

      chunkHash.digest = function() {
        return chunk_hash;
      };
    });
  });
};

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  chainWebpack: config => {
    // config.plugin("hash").use(WebpackMd5Hash);
    config
      .plugin("prettier")
      .use(PrettierPlugin, [
        {
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          encoding: "utf-8",
          endOfLine: "lf"
        }
      ])
      .before("vue-loader");
  }
};
