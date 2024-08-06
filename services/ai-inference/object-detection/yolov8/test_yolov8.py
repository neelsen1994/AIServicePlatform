from ultralytics import YOLO
from PIL import Image

# Load the YOLOv8 model from the 'saved_model' folder
model = YOLO("runs/detect/yolov8_turkey/weights/best.pt", "v8")

# Load the image from the 'uploaded_images' folder
image_path = 'uploaded_images/bird.jpg'
image = Image.open(image_path)

# Set the confidence threshold
confidence_threshold = 0.5

# Make prediction
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

# Output the detections
print(detections)