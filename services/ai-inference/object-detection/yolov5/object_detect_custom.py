###########################################################################################################
#
# A sample utility to perform object detection with yolov5 custom weights and save the resulting video
# in the local root directory.
#
############################################################################################################

import cv2
import torch

# Load the YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='runs/train/exp/weights/best.pt', force_reload=True)

# Set the confidence threshold
CONFIDENCE_THRESHOLD = 0.5

# Function to process each frame
def process_frame(frame, model, confidence_threshold):
    # Perform inference
    results = model(frame)
    
    # Convert results to a Pandas DataFrame
    df = results.pandas().xyxy[0]
    
    # Draw bounding boxes
    for index, row in df.iterrows():
        if row['confidence'] >= confidence_threshold:
            # Get bounding box coordinates and label
            x1, y1, x2, y2, confidence, class_id, name = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax']), row['confidence'], row['class'], row['name']
            
            # Draw the bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw the label
            label = f"{name} {confidence:.2f}"
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    return frame

# Path to the video file
video_path = '.\input_video_data\input_video.mp4'

# Open the video file
cap = cv2.VideoCapture(video_path)

# Get video properties
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

# Define the codec and create a VideoWriter object
out = cv2.VideoWriter('output.avi', cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'), fps, (frame_width, frame_height))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # Process the frame with the model
    frame = process_frame(frame, model, CONFIDENCE_THRESHOLD)
    
    # Write the frame to the output video
    out.write(frame)
    
    # Display the frame (optional)
    cv2.imshow('Frame', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the video capture and writer objects
cap.release()
out.release()
cv2.destroyAllWindows()
