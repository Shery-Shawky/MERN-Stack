const express=require('express');
const router =express.Router();
const request=require('request');
const config=require('config');
const auth = require('../../midddleware/auth')
const {check, validationResult} =require("express-validator/check")
const Profile=require('../../models/Profile')
const User=require('../../models/User');
const { response } = require('express');


router.get('/me',auth,async(req,res)=>{
    try{
        const profile=await Profile.findOne({ user:req.user.id }).populate('user',['name','avatar','image'])

        if(!profile){
            return res.status(400).json({msg:"there is no profile for this person"})
        }

        res.json(profile)
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

router.post('/',
[auth,
    [
    check('status','status is required').not().isEmpty(),
    check('skills','skills is required').not().isEmpty(),

]
],
async (req,res)=>{
const errors = validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const{
    company,
    location,
    bio,
    status,
    github,
    skills,
    instagram,
    linkedin,
    facebook
}=req.body;

//Build profile obj
const profileFields ={};
profileFields.user = req.user.id;
if(company) profileFields.company=company;
if(location) profileFields.location=location;
if(bio) profileFields.bio=bio;
if (status) profileFields.status=status;
if(github) profileFields.github=github;
if(skills) {
    profileFields.skills=skills.split(',').map(skill=>skill.trim())
} 

//Build Social obj
profileFields.social={};
if(instagram) profileFields.social.instagram=instagram;
if(linkedin) profileFields.social.linkedin=linkedin;
if(facebook) profileFields.social.facebook=facebook;


try{
    //Update
let profile =await Profile.findOne({user: req.user.id});

if(profile){
    profile= await Profile.findOneAndUpdate({user: req.user.id},{$set:profileFields},{new:true})
    return res.json(profile);
}
 //Create
 profile= new Profile(profileFields);
 await profile.save();
 res.json(profile);
}catch(err){
    console.error(err.message);
    res.status(500).send('Server Error')
}

// console.log(profileFields.skills);
// res.send('Hello')
});

//Get all profiles
router.get('/',async (req,res)=>{
try {
    const profiles=await Profile.find().populate('user',['name','avatar','image']);
    res.json(profiles)
} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
}
})

//Get Profile by user ID
router.get('/user/:user_id',async (req,res)=>{
    try {
        const profile=await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar','image']);

        if(!profile) return res.status(400).json({ msg: "there is no profile for this user"})
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: "Profile not found"})
        }
        res.status(500).send('Server Error')
    }
    });


    //Delete profile & user & posts
router.delete('/',auth,async (req,res)=>{
    try {
        //@todo remove users posts

        //remove profile
       await Profile.findOneAndRemove({user : req.user.id});
        //remove user
       await User.findOneAndRemove({ _id : req.user.id});

        res.json({msg: "user removed"})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
    });

    //Add profile experience (PUT)
    router.put('/experience',[auth,[
        check('title','Title is required').not().isEmpty(),
        check('company','Company is required').not().isEmpty(),
        check('from','From date is required').not().isEmpty(),

    ]], async (req,res)=>{
        const errors =validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            decription
        }=req.body;

        const NewExp={
            title,
            company,
            location,
            from,
            to,
            current,
            decription
        }

        try {
            const profile = await Profile.findOne({user: req.user.id})

            profile.experience.unshift(NewExp)
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    });

        //Delete experience by user id
router.delete('/experience/:exp_id',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id})
        //Get remove index
        const removeIndex= profile.experience.map(item=>item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
    });

    //Add profile Education (PUT)
    router.put('/education',[auth,[
        check('school','School is required').not().isEmpty(),
        check('degree','Degree is required').not().isEmpty(),
        check('from','From date is required').not().isEmpty(),

    ]], async (req,res)=>{
        const errors =validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }

        const {
            school,
            degree,
            from,
            to,
            current,
            decription
        }=req.body;

        const NewEducation={
            school,
            degree,
            from,
            to,
            current,
            decription
        }

        try {
            const profile = await Profile.findOne({user: req.user.id})

            profile.education.unshift(NewEducation)
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    });

        //Delete education by user id
router.delete('/education/:edu_id',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id})
        //Get remove index
        const removeIndex= profile.education.map(item=>item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
    });




module.exports=router;