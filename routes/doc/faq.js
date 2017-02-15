var express = require('express');
var router = express.Router();

/* GET FAQ page. */
router.get('/', function(req, res, next) {
  res.render('doc/faq', { partials: { footer: 'doc/footer' } });
});

module.exports = router;
