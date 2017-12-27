let mongoose = require('mongoose');
s
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI,{ useMongoClient: true}, function(err){
    if(err){
        console.log('Mongoose error =>', err);
    }
    console.log('Mongoose ');
});

module.exports = mongoose;