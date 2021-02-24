if (process.env.NODE_ENV === "production") {
  module.exports = require("./snoo_prod");
} else {
  module.exports = require("./snoo");
}
