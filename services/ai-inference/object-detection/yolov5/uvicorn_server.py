###############################################################
#
# Running a python server to accept object detection request 
# and send the bbox response after getting the inference from 
# pretrained yolov5s model. It works for general classes, like
# cars, person, cats, dogs etc.
# 
################################################################ 

from fastapi import FastAPI, File, UploadFile
import torch
from PIL import Image
import io

app = FastAPI()

# Load YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'yolov5s')

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read image file
    image = Image.open(io.BytesIO(await file.read()))
    
    # Perform inference
    results = model(image)

    # Parse results
    detections = []
    for *box, conf, cls in results.xyxy[0]:  # xyxy, confidence, class
        detections.append({
            "x": box[0].item(),
            "y": box[1].item(),
            "width": (box[2] - box[0]).item(),
            "height": (box[3] - box[1]).item(),
            "confidence": conf.item(),
            "class": model.names[int(cls)]
        })
    
    return {"detections": detections}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
