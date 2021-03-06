const model = require('../models/list');
const CrudService  = require('../services/crud');
const GenericController  = require('./generic');
const service = new CrudService(model);

module.exports = function (app) {
    const controller = new GenericController(model);
    return controller;
}