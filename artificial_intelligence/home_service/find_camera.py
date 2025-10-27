import subprocess
import socket
import time

def ping_host(host):
    """Ping a host to check if it's reachable"""
    try:
        result = subprocess.run(['ping', '-n', '1', host], 
                              capture_output=True, text=True, timeout=3)
        return result.returncode == 0
    except:
        return False

def scan_network_range(base_ip, start=1, end=254):
    """Scan a range of IP addresses"""
    print(f"Scanning {base_ip}.{start} to {base_ip}.{end}...")
    found_devices = []
    
    for i in range(start, end + 1):
        ip = f"{base_ip}.{i}"
        if ping_host(ip):
            found_devices.append(ip)
            print(f"✓ Found device at {ip}")
    
    return found_devices

def main():
    print("IP Camera Finder")
    print("=" * 30)
    
    # Common network ranges to scan
    networks = [
        ("192.168.1", "Common home network"),
        ("192.168.0", "Alternative home network"),
        ("10.0.0", "Business network"),
        ("192.168.2", "Secondary network")
    ]
    
    all_found_devices = []
    
    for base_ip, description in networks:
        print(f"\n{description} ({base_ip}.x):")
        devices = scan_network_range(base_ip)
        all_found_devices.extend(devices)
        
        if not devices:
            print("  No devices found")
    
    print(f"\n{'='*30}")
    print("SCAN COMPLETE")
    print(f"{'='*30}")
    
    if all_found_devices:
        print(f"Found {len(all_found_devices)} devices:")
        for device in all_found_devices:
            print(f"  - {device}")
        
        print(f"\nNext steps:")
        print("1. Try accessing each IP in your web browser (http://IP_ADDRESS)")
        print("2. Look for camera login pages")
        print("3. Check your router's DHCP client list")
    else:
        print("No devices found on any network!")
        print("\nTroubleshooting:")
        print("1. Check if camera is powered on")
        print("2. Verify network cable connection")
        print("3. Try resetting camera to factory defaults")
        print("4. Check if camera is on a different network")

if __name__ == "__main__":
    main() 