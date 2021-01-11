if (process.env.NODE_ENV === "production") {
  module.exports = require("./snoo_prod");
} else {
  console.log("dev");
  module.exports = require("./snoo");
}
