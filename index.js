
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require("body-parser");
const inspect = require("util").inspect;
const COUCHURL = "http://arwen-cdb.ibcp.fr:5984/";

var rawBodySaver = function (req, res, buf, encoding) {
  req.rawBody = "";

  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

app.all('*', function (req, res) {
  const headers = { ...req.headers };
  const method = req.method;
  const url = COUCHURL + req.originalUrl;

  const r = http.request(url, {
    method,
    headers
  }, (response) => {
    let data = ""

    response.on('data', chunk => {
      data += chunk
    })

    response.on('end', () => {
      for (const [name, value] of Object.entries(response.headers)) {
        res.setHeader(name, value)
      }
      res.send(data);
    })
  });

  r.write(req.rawBody || "")
  r.end()
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
