let auth = require('./auth');
let lists = require('./lists');

module.exports = (app) => {

    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('index', { title: 'Express' });
    });

    auth(app);
    lists(app);
}