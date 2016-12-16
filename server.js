'use strict';
const express = require('express');
let app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.listen(PORT, function () {
  console.log('App listening on port 3000!');
});
