var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET cool users page. */
router.get('/cool-users', function(req, res, next) {
  res.render('cool-users', {
    userName: 'Taras',
    users: [
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Smith', email: 'jane.smith@example.com' },
      { name: 'Peter Jones', email: 'peter.jones@example.com' }
    ]
  });
});

module.exports = router;