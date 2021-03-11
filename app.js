const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 8000; // process.env accesses heroku's environment variables
app.use(express.static(`${__dirname}/public`));

app.get("/image", (request, res) => {
  res.sendFile(
    path.join(__dirname, "./public/assets/reddit_synth_og_image.gif")
  );
});

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`);
});
