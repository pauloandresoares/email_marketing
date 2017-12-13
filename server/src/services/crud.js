function CrudService (model){
    this.model = model;
}

CrudService.prototype.list = function () {
    return new Promise((resolve, reject) => {
        this.model.find(null, (err, result) => {
            return resolve({data: result});
        })
    })
}


CrudService.prototype.insert = function (data) {
    return new Promise((resolve, reject) => {
        this.model.create(data, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

module.exports = CrudService;