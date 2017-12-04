let passport = require('passport');
let passportJwtStrategy = require('passport-jwt').Strategy;
let passportExtractJwt = require('passport-jwt').ExtractJwt;

let User = require('../../models/user');
let cfg = require('../../../config');

let params = {
    secretOrKey: cfg.jwrSecret,
    jwtFromRequest: passportExtractJwt.fromAuthHeaderWithScheme('bearer')
};

let strategy = new passportJwtStrategy(params, function(jwt_payload, done){
    let query = {id: jwt_payload.sub};
    let callback =  function(err, user){
        if(err){
            return done(err);
        }
        return done(null, user);
    };
    User.findOne(query, callback);

});

passport.use(strategy);

module.exports = passport;