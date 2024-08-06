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
  console.log('Response from port 1000:', response_s3.data);
  

  const response_detection = await uploadToEndpoint('http://localhost:8000/detect', 'file');
  // console.log('Response from port 8000:', response_detection);

  res.status(200).json(response_detection.data);
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
