# IP Camera Connectivity Troubleshooting Guide

## Problem Diagnosis
The network scanner shows that **192.168.1.100 is not reachable**, which means the camera is either:
1. Not powered on
2. Not connected to the network
3. Using a different IP address
4. On a different network segment

## Step-by-Step Troubleshooting

### 1. Check Camera Physical Connection
- [ ] Ensure camera is powered on (check power LED)
- [ ] Verify Ethernet cable is connected to camera
- [ ] Check if camera's network LED is blinking
- [ ] Try a different Ethernet cable if available

### 2. Verify Network Configuration
- [ ] Check your computer's IP address: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
- [ ] Ensure your computer is on the same network as the camera
- [ ] Typical home network ranges: 192.168.1.x, 192.168.0.x, 10.0.0.x

### 3. Find the Camera's Actual IP Address

#### Method A: Check Camera Documentation
- Look for default IP address in camera manual
- Common default IPs: 192.168.1.100, 192.168.1.64, 192.168.0.100

#### Method B: Use Camera's Discovery Tool
- Many IP cameras come with discovery software
- Install the manufacturer's discovery tool
- Run it to find cameras on your network

#### Method C: Check Router's DHCP Client List
- Log into your router's admin panel (usually 192.168.1.1 or 192.168.0.1)
- Look for "DHCP Client List" or "Connected Devices"
- Find your camera in the list

#### Method D: Reset Camera to Factory Defaults
- Most cameras have a reset button
- Hold reset button for 10-30 seconds while powered on
- Camera will revert to default IP address

### 4. Test Different Network Ranges

Run this script to scan different common network ranges:

```python
import subprocess
import socket

def scan_network(base_ip):
    print(f"Scanning {base_ip}.1 to {base_ip}.254...")
    for i in range(1, 255):
        ip = f"{base_ip}.{i}"
        try:
            result = subprocess.run(['ping', '-n', '1', ip], 
                                  capture_output=True, text=True, timeout=2)
            if result.returncode == 0:
                print(f"Found device at {ip}")
        except:
            pass

# Common network ranges
networks = ["192.168.1", "192.168.0", "10.0.0", "192.168.2"]
for network in networks:
    scan_network(network)
```

### 5. Camera-Specific Troubleshooting

#### If you know the camera model:
- Search for "[Camera Model] default IP address"
- Check manufacturer's website for setup guide
- Look for default username/password

#### Common Camera Defaults:
- **Hikvision**: 192.168.1.64, admin/12345
- **Dahua**: 192.168.1.108, admin/admin
- **Axis**: 192.168.0.90, root/pass
- **Foscam**: 192.168.1.100, admin/admin
- **Reolink**: 192.168.1.100, admin/admin

### 6. Test Web Interface First
Once you find the correct IP:

1. Open web browser
2. Navigate to `http://[CAMERA_IP]`
3. Login with credentials
4. Check RTSP settings in camera configuration

### 7. Verify RTSP Settings
In camera's web interface:
- [ ] Enable RTSP streaming
- [ ] Note the correct RTSP port (usually 554)
- [ ] Check username/password for RTSP
- [ ] Verify stream path (e.g., /stream1, /live, /h264Preview_01_main)

### 8. Test RTSP Connection
Once you have the correct IP and settings:

```python
import cv2

# Replace with correct values
camera_ip = "192.168.1.XXX"  # Actual camera IP
username = "admin"           # RTSP username
password = "password"        # RTSP password
port = 554                   # RTSP port
stream_path = "/stream1"     # Stream path

rtsp_url = f"rtsp://{username}:{password}@{camera_ip}:{port}{stream_path}"

cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

ret, frame = cap.read()
if ret:
    print("RTSP connection successful!")
    cv2.imshow("Test", frame)
    cv2.waitKey(3000)
else:
    print("RTSP connection failed")

cap.release()
cv2.destroyAllWindows()
```

## Quick Commands to Try

### Windows Commands:
```cmd
# Check your network configuration
ipconfig

# Ping common camera IPs
ping 192.168.1.100
ping 192.168.1.64
ping 192.168.0.100

# Scan network (requires nmap)
nmap -sn 192.168.1.0/24
```

### Linux/Mac Commands:
```bash
# Check network configuration
ifconfig

# Ping test
ping -c 4 192.168.1.100

# Scan network
nmap -sn 192.168.1.0/24
```

## Next Steps
1. **Find the correct IP address** using the methods above
2. **Test web interface** access first
3. **Verify RTSP settings** in camera configuration
4. **Update your script** with correct IP and credentials
5. **Test RTSP connection** with the working parameters

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Camera not found | Check power, network cable, reset to defaults |
| Wrong IP address | Use discovery tools or check router DHCP list |
| Authentication failed | Check username/password in camera settings |
| RTSP port closed | Enable RTSP streaming in camera configuration |
| Stream path wrong | Check camera documentation for correct path |

## Need More Help?
- Check camera manufacturer's support website
- Look for camera-specific forums or communities
- Verify camera model and search for specific setup guides 