if (process.env.NODE_ENV === "production") {
  console.log("prod");
  module.exports = require("./snoo_prod");
} else {
  console.log("dev");
  module.exports = require("./snoo");
}
