let auth = require('./auth');

module.exports = function (app) {
    const controller = require('../controllers/campaigns')(app);
    
    app.get('/api/campaigns', controller.index);
    app.post('/api/campaigns', controller.add);
    app.get('/api/campaigns/:id', controller.view);
    app.put('/api/campaigns/:id', controller.edit);
    app.delete('/api/campaigns/:id', controller.delete);

}