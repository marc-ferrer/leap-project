'use strict';
const path = require('path');
const express = require('express');
let app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.static(path.resolve(__dirname, 'games')));

app.listen(PORT, function () {
  console.log('App listening on port 3000!');
});
