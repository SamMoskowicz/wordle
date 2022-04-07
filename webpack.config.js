module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: __dirname + "/index.js",
  output: {
    path: __dirname + "/public",
    filename: "bundle.js"
  }
};
