import React, { useState } from 'react';
import axios from 'axios';

function AIServices() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResult(null); // Clear previous result when selecting a new file
    setError(null); // Clear any previous errors
  };

  const uploadToEndpoint = async (url, key) => {
    const formData = new FormData();
    formData.append(key, selectedFile);

    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.error(`Upload error to ${url}:`, err);
      setError(`Failed to upload the image to ${url}. Error: ${err.message}`);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file before uploading.');
      return;
    }

    //const result1000 = await uploadToEndpoint('http://localhost:1000/uploadS3', 'file');
    //console.log('Response from port 1000:', result1000);

    const res_json = await uploadToEndpoint('http://localhost:5000/route', 'image');
    console.log('Response from port 5000:', res_json);

    if (res_json) {             // && result1000
      // Handle the results from both requests as needed
      // For example, you could merge the results or display them separately
      setResult(res_json); // You can change this to handle both results as needed
      setError(null); // Clear any previous errors

      // Calculate and store image dimensions
      const img = new Image();
      img.onload = () => {
        const maxImageSize = 1000; // Maximum size you want to display (adjust as needed)
        let newWidth = img.width;
        let newHeight = img.height;

        // Scale down the image if it's larger than maxImageSize
        if (newWidth > maxImageSize) {
          const scaleFactor = maxImageSize / newWidth;
          newWidth *= scaleFactor;
          newHeight *= scaleFactor;
        }

        setImgDimensions({ width: newWidth, height: newHeight });
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  };

  return (
    <div style={{ flex: 2, padding: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: 'lightyellow'}}>
      <h2>AI Services</h2>
      <div style={{ marginBottom: '20px', backgroundColor: 'white' }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: '400px', padding: '8px 16px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>Upload</button>
      </div>
      {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}
      {result && (
        <div style={{ position: 'relative', width: imgDimensions.width, height: imgDimensions.height, margin: 'auto', textAlign: 'center' }}>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Uploaded"
            style={{ width: '100%', height: '100%', maxWidth: '100%', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}
          />
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            viewBox={`0 0 ${imgDimensions.width} ${imgDimensions.height}`} // Set viewBox based on image dimensions
          >
            {result.detections.map((box, index) => (
              <rect
                key={index}
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                style={{ stroke: 'red', fill: 'none', strokeWidth: 2 }}
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}

export default AIServices;
