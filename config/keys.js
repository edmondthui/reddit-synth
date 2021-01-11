<<<<<<< HEAD
if (process.env.NODE_ENV === "production") {
  module.exports = require("./snoo_prod");
} else {
  module.exports = require("./snoo");
}
=======
module.exports = {
  userAgent: process.env.USERAGENT,
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  refreshToken: process.env.REFRESHTOKEN,
}
>>>>>>> 80dffb4268564240c53b7243af1479090246f30c
