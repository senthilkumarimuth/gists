import cv2
import time

# RTSP URL (replace with your camera's URL)
rtsp_url = "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554/stream1"

def connect_with_ffmpeg_backend(url, max_retries=3):
    """Connect using FFmpeg backend with specific parameters"""
    for attempt in range(max_retries):
        print(f"Attempting to connect with FFmpeg backend (attempt {attempt + 1}/{max_retries})...")
        
        # Try different connection parameters
        cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
        
        # Set various parameters to improve connection stability
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_FPS, 25)
        cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'H264'))
        
        # Test connection
        ret, frame = cap.read()
        if ret:
            print("Successfully connected with FFmpeg backend")
            return cap
        else:
            print(f"FFmpeg backend attempt {attempt + 1} failed")
            cap.release()
            if attempt < max_retries - 1:
                time.sleep(2)
    
    return None

def connect_with_gstreamer_pipeline(url, max_retries=3):
    """Connect using GStreamer pipeline (alternative method)"""
    # GStreamer pipeline for RTSP
    gst_pipeline = f'rtspsrc location={url} latency=0 ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! appsink'
    
    for attempt in range(max_retries):
        print(f"Attempting to connect with GStreamer pipeline (attempt {attempt + 1}/{max_retries})...")
        
        try:
            cap = cv2.VideoCapture(gst_pipeline, cv2.CAP_GSTREAMER)
            ret, frame = cap.read()
            if ret:
                print("Successfully connected with GStreamer pipeline")
                return cap
            else:
                print(f"GStreamer pipeline attempt {attempt + 1} failed")
                cap.release()
                if attempt < max_retries - 1:
                    time.sleep(2)
        except Exception as e:
            print(f"GStreamer error: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
    
    return None

def test_camera_connectivity():
    """Test basic network connectivity to the camera"""
    import socket
    
    host = "192.168.1.100"
    port = 554
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✓ Network connectivity to {host}:{port} is working")
            return True
        else:
            print(f"✗ Cannot reach {host}:{port}")
            return False
    except Exception as e:
        print(f"✗ Network test failed: {e}")
        return False

# Test network connectivity first
print("Testing network connectivity...")
if not test_camera_connectivity():
    print("Network connectivity test failed. Please check:")
    print("1. Camera is powered on")
    print("2. IP address is correct")
    print("3. Network connection is stable")
    print("4. Firewall settings")
    exit()

# Try different connection methods
print("\nTrying different connection methods...")

# Method 1: FFmpeg backend
cap = connect_with_ffmpeg_backend(rtsp_url)

# Method 2: GStreamer pipeline (if FFmpeg failed)
if cap is None:
    print("\nFFmpeg backend failed, trying GStreamer pipeline...")
    cap = connect_with_gstreamer_pipeline(rtsp_url)

# Method 3: Default backend with modified URL
if cap is None:
    print("\nTrying default backend with modified parameters...")
    # Try different stream paths
    alternative_urls = [
        "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554/stream2",
        "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554/live",
        "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554/h264Preview_01_main",
        "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
    ]
    
    for alt_url in alternative_urls:
        print(f"Trying alternative URL: {alt_url}")
        cap = cv2.VideoCapture(alt_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        ret, frame = cap.read()
        if ret:
            print(f"Successfully connected with alternative URL")
            break
        else:
            cap.release()

if cap is None:
    print("\nAll connection methods failed.")
    print("Please check:")
    print("1. Camera model and correct RTSP URL format")
    print("2. Username and password are correct")
    print("3. Camera supports RTSP streaming")
    print("4. Try accessing the camera's web interface to verify settings")
    exit()

# Display the stream
print("Stream connected successfully. Press 'q' to quit.")
frame_count = 0
start_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame.")
        break
    
    frame_count += 1
    if frame_count % 30 == 0:
        elapsed = time.time() - start_time
        fps = frame_count / elapsed
        print(f"FPS: {fps:.2f}")
    
    cv2.imshow("RTSP Stream", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows() 