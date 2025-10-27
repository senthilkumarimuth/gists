import cv2
import time
import socket
import subprocess
import sys
import os

# RTSP URL (replace with your camera's URL)
rtsp_url = "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554/stream1"

def test_network_connectivity():
    """Test basic network connectivity to the camera"""
    print("=== Network Connectivity Test ===")
    
    host = "192.168.1.100"
    port = 554
    
    # Test 1: Basic socket connection
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✓ Socket connection to {host}:{port} successful")
        else:
            print(f"✗ Socket connection to {host}:{port} failed (error code: {result})")
            return False
    except Exception as e:
        print(f"✗ Socket test failed: {e}")
        return False
    
    # Test 2: Ping test
    try:
        result = subprocess.run(['ping', '-n', '4', host], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print(f"✓ Ping to {host} successful")
        else:
            print(f"✗ Ping to {host} failed")
            return False
    except Exception as e:
        print(f"✗ Ping test failed: {e}")
        return False
    
    return True

def test_rtsp_with_ffprobe():
    """Test RTSP stream using ffprobe (if available)"""
    print("\n=== FFprobe RTSP Test ===")
    
    try:
        # Test with ffprobe
        cmd = [
            'ffprobe', '-v', 'quiet', '-print_format', 'json', 
            '-show_streams', '-timeout', '10000000', rtsp_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            print("✓ FFprobe successfully connected to RTSP stream")
            print("Stream information available")
            return True
        else:
            print(f"✗ FFprobe failed: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("⚠ FFprobe not found. Install FFmpeg to enable this test.")
        return False
    except subprocess.TimeoutExpired:
        print("✗ FFprobe test timed out")
        return False
    except Exception as e:
        print(f"✗ FFprobe test failed: {e}")
        return False

def test_opencv_backends():
    """Test different OpenCV backends"""
    print("\n=== OpenCV Backend Tests ===")
    
    backends = [
        (cv2.CAP_FFMPEG, "FFMPEG"),
        (cv2.CAP_ANY, "ANY"),
        (cv2.CAP_GSTREAMER, "GSTREAMER")
    ]
    
    for backend_id, backend_name in backends:
        print(f"\nTesting {backend_name} backend...")
        
        try:
            # Create capture with specific backend
            cap = cv2.VideoCapture(rtsp_url, backend_id)
            
            # Set timeout and buffer parameters
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            cap.set(cv2.CAP_PROP_FPS, 25)
            
            # Try to read a frame with timeout
            start_time = time.time()
            ret, frame = cap.read()
            elapsed = time.time() - start_time
            
            if ret:
                print(f"✓ {backend_name} backend: Successfully read frame in {elapsed:.2f}s")
                cap.release()
                return cap, backend_name
            else:
                print(f"✗ {backend_name} backend: Failed to read frame (elapsed: {elapsed:.2f}s)")
                cap.release()
                
        except Exception as e:
            print(f"✗ {backend_name} backend: Exception - {e}")
    
    return None, None

def test_alternative_urls():
    """Test common RTSP URL patterns"""
    print("\n=== Alternative RTSP URL Tests ===")
    
    base_url = "rtsp://Senthilkumarrf:Senthilrf@192.168.1.100:554"
    
    # Common RTSP stream paths
    stream_paths = [
        "/stream1",
        "/stream2", 
        "/live",
        "/live/av0",
        "/live/av1",
        "/live/av2",
        "/live/av3",
        "/h264Preview_01_main",
        "/h264Preview_01_sub",
        "/cam/realmonitor?channel=1&subtype=0",
        "/cam/realmonitor?channel=1&subtype=1",
        "/cam/realmonitor?channel=1&subtype=2",
        "/axis-media/media.amp",
        "/axis-media/media.amp?videocodec=h264",
        "/axis-media/media.amp?videocodec=mpeg4",
        "/onvif1",
        "/onvif2",
        "/video1",
        "/video2",
        "/main",
        "/sub"
    ]
    
    for path in stream_paths:
        test_url = base_url + path
        print(f"Testing: {test_url}")
        
        try:
            cap = cv2.VideoCapture(test_url, cv2.CAP_FFMPEG)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            start_time = time.time()
            ret, frame = cap.read()
            elapsed = time.time() - start_time
            
            if ret and elapsed < 10:  # Success if we get a frame within 10 seconds
                print(f"✓ SUCCESS with URL: {test_url}")
                print(f"  Frame read in {elapsed:.2f} seconds")
                cap.release()
                return test_url
            else:
                print(f"✗ Failed (elapsed: {elapsed:.2f}s)")
                cap.release()
                
        except Exception as e:
            print(f"✗ Exception: {e}")
    
    return None

def main():
    print("RTSP Camera Connection Diagnostic Tool")
    print("=" * 50)
    
    # Test 1: Network connectivity
    if not test_network_connectivity():
        print("\n❌ Network connectivity test failed!")
        print("Please check:")
        print("1. Camera is powered on")
        print("2. IP address 192.168.1.100 is correct")
        print("3. Your computer is on the same network")
        print("4. Firewall is not blocking port 554")
        return
    
    # Test 2: FFprobe test
    ffprobe_success = test_rtsp_with_ffprobe()
    
    # Test 3: OpenCV backends
    cap, backend_name = test_opencv_backends()
    
    if cap is not None:
        print(f"\n✅ SUCCESS: Connected using {backend_name} backend!")
        print("Stream is working. Press 'q' to quit.")
        
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
        return
    
    # Test 4: Alternative URLs
    print("\nTrying alternative RTSP URLs...")
    working_url = test_alternative_urls()
    
    if working_url:
        print(f"\n✅ SUCCESS: Found working URL: {working_url}")
        print("You can use this URL in your main script.")
    else:
        print("\n❌ All connection attempts failed!")
        print("\nTroubleshooting recommendations:")
        print("1. Check camera documentation for correct RTSP URL format")
        print("2. Verify username/password in camera settings")
        print("3. Try accessing camera web interface at http://192.168.1.100")
        print("4. Check if RTSP streaming is enabled in camera settings")
        print("5. Try different ports (554, 8554, 10554)")
        print("6. Consider using ONVIF discovery tools")

if __name__ == "__main__":
    main() 