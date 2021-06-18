const mongoose = require('mongoose');


const UserSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        default:"https://res.cloudinary.com/cnq/image/upload/v1586197723/noimage_d4ipmd.png"
           
    },
    date:{
        type:Date,
        default:Date.now
    },
    img:{
        type:String  
    },
     image:{
         
    },

})


module.exports=User=mongoose.model('user',UserSchema)