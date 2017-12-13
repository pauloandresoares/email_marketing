let auth = require('./auth');

module.exports = function (app) {
    const controller = require('../controllers/lists')(app);
    
    app.get('/api/lists', controller.index);
    app.post('/api/lists', controller.add);
    app.get('/api/lists/:id', controller.view);
    app.put('/api/lists/:id', controller.edit);
    app.delete('/api/lists/:id', controller.delete);

}