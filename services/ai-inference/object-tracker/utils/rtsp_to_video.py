import cv2

def save_rtsp_stream_to_video(rtsp_url, output_file, codec='XVID', fps=30.0, frame_width=1920, frame_height=1080):
    # Open the RTSP stream
    cap = cv2.VideoCapture(rtsp_url)

    # Check if the video capture object is opened successfully
    if not cap.isOpened():
        print(f"Error: Unable to open RTSP stream {rtsp_url}")
        return

    # Get the codec
    fourcc = cv2.VideoWriter_fourcc(*codec)
    
    # Create a VideoWriter object
    out = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))

    print(f"Recording RTSP stream to {output_file}")

    while True:
        # Read frame-by-frame
        ret, frame = cap.read()

        # Break the loop if the stream ends
        if not ret:
            print("End of stream or error occurred")
            break

        # Resize the frame to the desired resolution (optional)
        frame = cv2.resize(frame, (frame_width, frame_height))

        # Write the frame to the video file
        out.write(frame)

    # Release everything if the job is finished
    cap.release()
    out.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    rtsp_url = "rtsp://admin:Mettenhof@10.16.12.173:554"
    output_file = "output_video.mp4"
    save_rtsp_stream_to_video(rtsp_url, output_file)
