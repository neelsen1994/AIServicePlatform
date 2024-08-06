// index.js
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs');
const FormData = require('form-data');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Configure CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Adjust this to your frontend URL
  credentials: true,                // Allow cookies to be sent with the requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure 'uploads' folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set storage engine for Multer to store in the local disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname) // Date.now() + path.extname(file.originalname)); // Append extension
  }
});
const upload = multer({ storage: storage });

// Configure AWS SDK
//const s3 = new AWS.S3({
//  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//  region: process.env.AWS_REGION
//});
//
//const upload = multer({
//  storage: multerS3({
//    s3: s3,
//    bucket: process.env.AWS_BUCKET_NAME,
//    acl: 'public-read',
//    metadata: function (req, file, cb) {
//      cb(null, { fieldName: file.fieldname });
//    },
//    key: function (req, file, cb) {
//      cb(null, Date.now().toString() + '-' + file.originalname);
//    }
//  })
//});

app.post('/route', upload.single('image'), async (req, res) => {

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Ensure the path is correct and set the path where the image is locally saved
  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  //console.log('File path:', filePath);

  const uploadToEndpoint = async (url, key) => {
    const formData = new FormData();
    formData.append(key, fs.createReadStream(filePath));

    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (err) {
      console.error(`Upload error to ${url}:`, err);
      setError(`Failed GW Server to upload the image to ${url}. Error: ${err.message}`);
      return null;
    }
  };

  const response_s3 = await uploadToEndpoint('http://localhost:1000/uploadS3', 'file');
  // console.log('Response from port 1000:', response_s3);

  const response_detection = await uploadToEndpoint('http://localhost:8000/detect', 'file');
  // console.log('Response from port 8000:', response_detection);

  res.status(200).json(response_detection.data);

  //const filePath = path.join(__dirname, req.file.path);
  //console.log('RequestType',req.file.mimetype)
  //console.log('RequestFileName',req.file.originalname)
  // // try {
  // //   // Send file to AI service
  // //   const formData = new FormData();
  // //   formData.append('file', fs.createReadStream(filePath));
  // //   //formData.append('file', req.file.buffer, {
  // //   //  filename: req.file.originalname,
  // //   //  contentType: req.file.mimetype
  // //   //});
  // //   ///////////////////////
  // //   const response1 = await axios.post('http://localhost:8000/detect', formData, {
  // //     headers: { 'Content-Type': 'multipart/form-data' }
  // //   });

    ////const response2 = await axios.post('http://localhost:1000/uploadS3', formData, {
    ////  headers: { 'Content-Type': 'multipart/form-data' }
    ////});
    //console.log(response1.data)
  // //  res.status(200).json(response1.data);
    ///////////////////////////////

    //axios.all([
    //  axios.post('http://localhost:8000/detect', formData, {
    //    headers: { 'Content-Type': 'multipart/form-data' }
    //  }),
    //  axios.post('http://localhost:1000/uploadS3', formData, {
    //    headers: { 'Content-Type': 'multipart/form-data' }
    //  })
    //]).then(axios.spread((aiInfRes, uploadS3Res) => {
    //    res.status(200).json({ inference: aiInfRes.data, S3: uploadS3Res.data });
    //}));
    
  // //} catch (err) {
  // //  console.error(err);
  // //  res.status(500).json({ message: 'Gateway Server Failed', error: err.message });
  // //}
  
  //res.send({
  //  message: 'File uploaded successfully!',
  //  fileUrl: req.file.path
  //});
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
