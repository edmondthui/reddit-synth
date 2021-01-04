const r = new snoowrap({
  userAgent: process.env.USERAGENT,
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  refreshToken: process.env.REFRESHTOKEN,
});

export default r;
