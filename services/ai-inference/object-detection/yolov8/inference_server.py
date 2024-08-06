import cv2
import torch
import math
import numpy as np
from ultralytics import YOLO


from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import argparse
import csv
import os
import platform
import sys
from pathlib import Path
import torch
from PIL import Image
import io
import numpy as np

app = FastAPI()

# Load the YOLOv5 model
model = YOLO("runs/detect/yolov8_turkey/weights/best.pt", "v8")

# Set the confidence threshold
confidence_threshold = 0.5


@app.post("/detect")
async def upload_image(file: UploadFile = File(...)):
    try:
        # You can add logic here to process the file if needed
        contents = await file.read()
        try:
            image = Image.open(io.BytesIO(contents))
        except Exception as e:
            return JSONResponse(status_code=400, content={"message": "Failed to load image", "error": str(e)})        
        
        # Save the image to a specified location (Optional)

        # save_path = f"./uploaded_images/{file.filename}"
        # os.makedirs(os.path.dirname(save_path), exist_ok=True)
        # with open(save_path, "wb") as f:
        #     f.write(contents)

        # Get image properties
        width, height = image.size
        format = image.format
        mode = image.mode

        # Print image properties
        # print(f"Image saved at: {save_path}")
        print(f"Image dimensions: {width}x{height}")
        print(f"Image format: {format}")
        print(f"Image mode: {mode}")

        # weights= 'runs/train/exp/weights/best.pt'
        results = model(image)

        # Extract the bounding box, class, and confidence
        detections = []
        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                if conf >= confidence_threshold:
                    x_min, y_min, x_max, y_max = box.xyxy[0].tolist()
                    width = x_max - x_min
                    height = y_max - y_min
                    detection = {
                        "x": int(x_min),
                        "y": int(y_min),
                        "width": int(width),
                        "height": int(height),
                        "confidence": conf,
                        "class": result.names[int(box.cls[0])]  # Ensure this corresponds to the class name
                    }
                    detections.append(detection)

        # detects = run(source=save_path, weights=weights, save_txt=True)
        # print(f"Detections in YOLOv8: {detections}")
        
        # For now, we'll just return a success message
        return JSONResponse(status_code=200, content={"message": "Object Detection successfully", "detections": detections})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Failed to detect object in image", "error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
