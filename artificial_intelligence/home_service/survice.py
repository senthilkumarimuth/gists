import cv2


# RTSP stream URL
rtsp_url = 'rtsp://Senthilkumarrf:Senthilrf@192.168.0.100:554/stream1'

# Open video stream
cap = cv2.VideoCapture(rtsp_url)
print('me')
while cap.isOpened():
    ret, frame = cap.read()
    print('me2')
    cv2.imshow('RTSP Stream', frame)
    save_path = 'test.jpg'
    cv2.imwrite(save_path, frame)
    break

    if not ret:
        break