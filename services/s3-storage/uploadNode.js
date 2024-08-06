const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Configure CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Adjust this to your frontend URL
  credentials: true,                // Allow cookies to be sent with the requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

app.post('/uploadS3', upload.single('file'), (req, res) => {
  res.send({
    message: 'File uploaded successfully!',
    fileUrl: req.file.location
  });
});

app.listen(1000, () => {
  console.log('Server is running on port 1000');
});
