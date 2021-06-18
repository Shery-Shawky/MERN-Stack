const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://shery:mwhgaTEBliaBU1Wd@devconnecter.ahtm7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify:false,
    useCreateIndex:true
});
const connection = mongoose.connection;

module.exports = connection;