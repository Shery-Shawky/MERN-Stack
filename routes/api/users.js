const express=require('express');
const router =express.Router();
const gravatar=require('gravatar')
const bycrpt=require('bcryptjs')
const jwt=require('jsonwebtoken'); 
const config =require('config')
const {check, validationResult} =require("express-validator/check")
const User=require('../../models/User')

// router.get('/',(req,res)=>res.send('Use router'));

router.post('/',[
    check('name','name is required').not().isEmpty(),
    check('email','please enter a valid email').isEmail(),
    check('password','please enter a password with 7 or more charachter').isLength({min:7}),

],
async (req,res)=>{
    // console.log(req.body);
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }   

    const {name,email,password}=req.body;  
    
    
    try{
    //see if user exists
    let user=await User.findOne({email})
    if(user){
      return  res.status(400).json({errors:[{msg:'User already exists'}]}) 
    }

    //get user gravatar
    const avatar=gravatar.url(email,{
        //size
       s:"200",
       //reading
       r:"pg",
       //default
       d:"mm"

    })
    user =new User({
        name,
        email,
        avatar,
        password

    })

    //Encrypt password
    const salt=await bycrpt.genSalt(10); 
    user.password=await bycrpt.hash(password,salt);
    await user.save()

    const payload={
        user:{
            id:user.id
        }
    }
    jwt.sign(payload,config.get('jwtSecret'),
    {expiresIn:360000},
    (err,token)=>{
        if(err) throw err;
        res.json({token})
    }
    
    )

    //Return jonWebtoken

    // res.send('Use registered')
    }catch(err){
    console.error(err.message);
    res.status(500).send('Server error')

    }
    
    
// router.put('/updatepic',auth,(req,res)=>{
//     User.findByIdAndUpdate(req.user._id,{$set:{avatar:req.body.avatar}},{new:true},
//         (err,result)=>{
//          if(err){
//              return res.status(422).json({error:"pic canot post"})
//          }
//          res.json(result)
//     })
// })
 
    



});


module.exports=router;