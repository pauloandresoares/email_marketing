let express = require('express');
let router = express.Router();
let User = require('../src/models/user');
let cfg = require('./../config');
let jwt = require('jwt-simple');
let passport = require('../src/auth/auth');

router.post('/token', function(req, res, next){
  let user = req.body;
  if(!user.username || !user.password){
      return res.status(401).send('Unauthorized');
  }

  let query = {email: user.username, password: user.password};
  
  let callback = function(err, user){
    if(err){
      return res.status(500).json({err: err});
    }
    if(!user){
      return res.status(401).send('Unauthorized');
    }
    console.log('User:');
    console.log(user.id);
    let payload = {id: user.id};
    let token = jwt.encode(payload, cfg.jwrSecret);
    return res.json({token: token});
  };
  user = User.findOne(query, callback);


});

/* GET users listing. */
router.get('/me', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  ////5a21f51e0f2b53000f30fca8
  return res.status(200).json({
    user: req.user
  });
});

router.post('/register', function(req, res, next) {
  let data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    accounts:[{
      name: req.body.account_name,
      role: 'owner',
      enabled: true,
    }]
  };

  let callback = function(err, user){
    if(err){
      return res.status(422).json({err: err});
    }
    return res.status(200).json({user: user});
  };

  User.create(data, callback);

});


module.exports = router;
