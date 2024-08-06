import cv2

output_video_path = 'output_tracker_MOGSubtract.mp4'
output_mask_path = 'output_mask_tracker_MOGSubtract.mp4'

cap = cv2.VideoCapture("output_videoXVID.mp4")

# Get video properties
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))
out2 = cv2.VideoWriter(output_mask_path, fourcc, fps, (frame_width, frame_height), isColor=False)

# Object Detection from stable camera in the barn
object_detector = cv2.createBackgroundSubtractorKNN()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Object Detection
    mask =object_detector.apply(frame)
    _, mask = cv2.threshold(mask, 254, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(mask,cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        # Calculate area and remove small regions not representing the Turkeys
        area = cv2.contourArea(cnt)

        if area > 300:
            # cv2.drawContours(frame, [cnt], -1, (0,255,0), 2)
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(frame, (x,y), (x + w, y + h), (0,255,0), 2)

    cv2.imshow("frame", frame)
    cv2.imshow("mask",mask)

    out.write(frame)
    out2.write(mask)

    key = cv2.waitKey(30)

    if key == 27:
        break

cap.release()
out.release()
out2.release()
cv2.destroyAllWindows()