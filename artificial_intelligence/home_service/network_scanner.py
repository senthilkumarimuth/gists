import socket
import subprocess
import threading
import time
from concurrent.futures import ThreadPoolExecutor

def ping_host(host):
    """Ping a host to check if it's reachable"""
    try:
        result = subprocess.run(['ping', '-n', '1', host], 
                              capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except:
        return False

def scan_port(host, port):
    """Scan a specific port on a host"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

def scan_network_range(base_ip, start=1, end=254):
    """Scan a range of IP addresses"""
    print(f"Scanning network range {base_ip}.{start} to {base_ip}.{end}")
    print("This may take a few minutes...")
    
    reachable_hosts = []
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        # Ping scan
        futures = {executor.submit(ping_host, f"{base_ip}.{i}"): i for i in range(start, end + 1)}
        
        for future in futures:
            ip = futures[future]
            if future.result():
                reachable_hosts.append(f"{base_ip}.{ip}")
                print(f"✓ Found device at {base_ip}.{ip}")
    
    return reachable_hosts

def scan_ports_on_host(host, ports):
    """Scan specific ports on a host"""
    print(f"\nScanning ports on {host}:")
    
    open_ports = []
    for port in ports:
        if scan_port(host, port):
            service_name = get_service_name(port)
            print(f"✓ Port {port} ({service_name}) is open")
            open_ports.append((port, service_name))
        else:
            print(f"✗ Port {port} is closed")
    
    return open_ports

def get_service_name(port):
    """Get common service name for port"""
    services = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        25: "SMTP",
        53: "DNS",
        80: "HTTP",
        110: "POP3",
        143: "IMAP",
        443: "HTTPS",
        554: "RTSP",
        8000: "HTTP Alt",
        8080: "HTTP Alt",
        8554: "RTSP Alt",
        10554: "RTSP Alt"
    }
    return services.get(port, "Unknown")

def main():
    print("Network Scanner for IP Camera Discovery")
    print("=" * 50)
    
    # Your camera's IP base
    camera_ip = "192.168.1.100"
    base_ip = "192.168.1"
    
    print(f"Target camera IP: {camera_ip}")
    
    # Test 1: Check if camera IP is reachable
    print(f"\n1. Testing connectivity to {camera_ip}...")
    if ping_host(camera_ip):
        print(f"✓ {camera_ip} is reachable")
    else:
        print(f"✗ {camera_ip} is not reachable")
        print("\nLet's scan the network to find devices...")
        
        # Scan network range
        reachable = scan_network_range(base_ip)
        
        if reachable:
            print(f"\nFound {len(reachable)} reachable devices:")
            for host in reachable:
                print(f"  - {host}")
        else:
            print("No devices found on network")
            return
    
    # Test 2: Scan common ports on camera
    print(f"\n2. Scanning common ports on {camera_ip}...")
    common_ports = [80, 443, 554, 8000, 8080, 8554, 10554, 22, 23]
    open_ports = scan_ports_on_host(camera_ip, common_ports)
    
    # Test 3: Check if web interface is accessible
    print(f"\n3. Testing web interface...")
    try:
        import urllib.request
        urllib.request.urlopen(f"http://{camera_ip}", timeout=5)
        print(f"✓ Web interface accessible at http://{camera_ip}")
    except:
        print(f"✗ Web interface not accessible at http://{camera_ip}")
    
    # Test 4: RTSP specific test
    print(f"\n4. RTSP specific tests...")
    
    # Test different RTSP ports
    rtsp_ports = [554, 8554, 10554]
    for port in rtsp_ports:
        if scan_port(camera_ip, port):
            print(f"✓ RTSP port {port} is open")
            
            # Try to connect to RTSP
            try:
                import cv2
                test_url = f"rtsp://Senthilkumarrf:Senthilrf@{camera_ip}:{port}/stream1"
                cap = cv2.VideoCapture(test_url, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                
                start_time = time.time()
                ret, frame = cap.read()
                elapsed = time.time() - start_time
                
                if ret and elapsed < 10:
                    print(f"✓ RTSP stream working on port {port}")
                else:
                    print(f"✗ RTSP stream failed on port {port} (elapsed: {elapsed:.2f}s)")
                
                cap.release()
                
            except Exception as e:
                print(f"✗ RTSP test failed on port {port}: {e}")
        else:
            print(f"✗ RTSP port {port} is closed")
    
    # Summary
    print(f"\n{'='*50}")
    print("SCAN SUMMARY:")
    print(f"{'='*50}")
    
    if open_ports:
        print("Open ports found:")
        for port, service in open_ports:
            print(f"  - Port {port}: {service}")
    
    print(f"\nRecommendations:")
    if 80 in [p[0] for p in open_ports]:
        print("1. Try accessing web interface: http://192.168.1.100")
    if 554 in [p[0] for p in open_ports]:
        print("2. RTSP port 554 is open - check camera settings")
    else:
        print("2. RTSP port 554 is closed - check if RTSP is enabled")
    
    print("3. Verify username/password in camera settings")
    print("4. Check camera documentation for correct RTSP URL format")

if __name__ == "__main__":
    main() 