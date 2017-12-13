const CrudService  = require('../services/crud')

function GenericController(model) {
    this.service = new CrudService(model);

    this.index = (req, res) => {
        this.service.list()
            .then((result) => {
                return res.json(result);     
            });
    }

    this.add = (req, res) => {
        this.service.insert(req.body)
            .then((result) => {
                return res.json(result);     
            }).catch((err) => {
                return res.status(422).json(err);
            });
    }
    this.view = (req, res) => {
        return res.json({status: 'in progress'});  
    }
    this.edit = (req, res) => {
        return res.json({status: 'in progress'});  
    }
    this.delete = (req, res) => {
        return res.json({status: 'in progress'});  
    }
}

module.exports = GenericController;