var express = require('express');
var router = express.Router();

/* GET documentation page. */
router.get('/', function(req, res, next) {
  res.render('doc');
});

module.exports = router;
