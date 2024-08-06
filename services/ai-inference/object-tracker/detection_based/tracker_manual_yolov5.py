#############################################################################################################
# 
# Track objects using yolov5 detection model and euclidean distance matching. Results are saved in video_data.
# This file is part of the object tracking task. For convenience, it is kept in this folder.
# 
##############################################################################################################

import cv2
import torch
import math
import numpy as np

def remove_duplicates(input_dict):
    # Initialize a set to keep track of seen (x, y) values
    seen_values = set()
    # Initialize a new dictionary to store the result
    result_dict = {}

    for key, value in input_dict.items():
        if value not in seen_values:
            # If the value has not been seen, add it to the result dictionary
            result_dict[key] = value
            # Add the value to the seen set
            seen_values.add(value)

    return result_dict

# Load the YOLOv5 model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='models/best_yolov5.pt', force_reload=True)

# Set the confidence threshold
CONFIDENCE_THRESHOLD = 0.5

# Path to the video file
video_path = '.\data\input_video.mp4'
output_video_path = '.\data\output_tracker_yolov5.mp4'

# Open the video file
cap = cv2.VideoCapture(video_path)

# Get video properties
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))


# Initialize count
count = 0

centre_points_prev_frame = []

tracking_history = {}
list_of_dicts = {}

tracking_objects = {}
track_id = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Centre Pt current frame
    centre_points_cur_frame = []
    
    count += 1
    # Perform inference
    results = model(frame)
    
    # Convert results to a Pandas DataFrame
    df = results.pandas().xyxy[0]

    # Draw bounding boxes
    for index, row in df.iterrows():
        # Get bounding box coordinates and label
        x1, y1, x2, y2, confidence, class_id, name = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax']), row['confidence'], row['class'], row['name']
        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)
        centre_points_cur_frame.append((cx, cy))
        #print("FRAME N: ", count, " ", x1, y1, x2, y2)

        # Draw the bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    
    if count <= 2:
        for pt in centre_points_cur_frame:
            for pt2 in centre_points_prev_frame:
                distance = math.hypot(pt2[0] - pt[0], pt2[1] - pt[1])

                if distance < 30:
                    tracking_objects[track_id] = pt
                    track_id += 1
    else:

        tracking_objects_copy = tracking_objects.copy()
        centre_points_cur_frame_copy = centre_points_cur_frame.copy()

        for object_id, pt2 in tracking_objects_copy.items():
            object_exists = False
            for pt in centre_points_cur_frame_copy:

                distance = math.hypot(pt2[0] - pt[0], pt2[1] - pt[1])
                
                # Update IDs position
                if distance < 30:
                    tracking_objects[object_id] = pt
                    object_exists = True
                    if pt in centre_points_cur_frame:
                        centre_points_cur_frame.remove(pt)
                    continue
            
            # Remove IDs lost
            if not object_exists:
                tracking_objects.pop(object_id)

        # Add new IDs found
        for pt in centre_points_cur_frame:
            tracking_objects[track_id] = pt
            track_id += 1

    
    #print("Tracking Objects")
    #print(tracking_objects)

    tracking_objects = remove_duplicates(tracking_objects)

    #print("LEN", len(tracking_objects))

    for object_id, pt in tracking_objects.items():
        cv2.circle(frame, pt, 5, (0, 0, 255), -1)
        cv2.putText(frame, str(object_id), (pt[0], pt[1] - 7), 0, 1, (0, 0, 255), 1)
        
        ## Update tracking history
        #for key, value in tracking_objects.items():
        #    if key not in tracking_history:
        #        tracking_history[key] = []
        #    tracking_history[key].append(value)
#
        ## Draw the polylines
        #for key, points in tracking_history.items():
        #    if len(points) > 1:
        #        # Convert points to the format required by polylines
        #        pts = np.array(points, np.int32)
        #        pts = pts.reshape((-1, 1, 2))
        #        cv2.polylines(frame, [pts], isClosed=False, color=(255, 0, 0), thickness=2)

    

        #cv2.circle(frame, pt, 5, (0, 0, 255), -1)
        
    # Display the frame (optional)
    cv2.imshow('Frame', frame)

    out.write(frame)  ###################

    # Make a copy of the points
    centre_points_prev_frame = centre_points_cur_frame.copy()

    key = cv2.waitKey(1)
    if  key == 27:
        break

# Release the video capture and writer objects
cap.release()
out.release()
cv2.destroyAllWindows()
