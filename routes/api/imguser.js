const express = require("express");
const app = express();
// app.use(express.static("public"));
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const User =require('../../models/User');
const Image = require('../../models/imguser')
const ImageChunk = require('../../models/imageChunkModel')
const connection = require('../../connection');
const routerimg = new express.Router();





const storage = new GridFsStorage({
    url: "mongodb+srv://shery:mwhgaTEBliaBU1Wd@devconnecter.ahtm7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
})
const upload = multer({ storage });
let gfs;
connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo)
    gfs.collection('uploads')
});



routerimg.post('/user/:userId',upload.single('image'), async (req, res) => {
    try {
        console.log("Uploading ...... ")
        console.log(req)
        let { filename } = req.file;
        console.log(filename)
        let { userId } = req.params;
        console.log(userId)
        let image = await Image.findOne({ filename: req.file.filename });
       // let date = new Date(image.uploadDate)
       // console.log(image)
        let user = await User.findOneAndUpdate({ _id:userId }, { image: image.filename }, {  new: true   }).exec()
        console.log(user)
      //  console.log('TIME NOW: ', date.getHours() - 12, ':', date.getMinutes())
        res.status(200).send({ user, image, message: "Uploaded successfully", success: true })
    } catch (error) {
        res.status(404).send({ error, message: "Unable to upload", success: false })
    }
})



//To get and show any image
routerimg.get('/show/:filename', (req, res) => {
    console.log(req.params.filename)
    console.log(req.params.filename)
    console.log(req.params.filename)

    gfs.files.find({ filename: req.params.filename }).toArray((err, file) => {
        console.log(file[0])
        if (!file[0] || file[0].length === 0) {
            return res.status(404).send({ err: 'No file exists' })
        }
        if (file[0].contentType === 'image/jpeg' || file[0].contentType === 'img/png' || file[0].contentType === 'img/jfif') {
            // read output
            const readstream = gfs.createReadStream(file[0].filename);
            readstream.pipe(res)
        } else {
            res.status(404).send({ err: 'No  image' })
        }
    })
})



module.exports = routerimg;