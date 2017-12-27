const passport = require('../auth/auth');

let auth = require('./auth');
let lists = require('./lists');
let campaigns = require('./campaigns');
let leads = require('./leads');

module.exports = (app) => {

    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('index', { title: 'Express' });
    });
    
    app.use('/api', passport.authenticate('jwt', {session: false}));

    auth(app);
    lists(app);
    campaigns(app);
    leads(app);
}