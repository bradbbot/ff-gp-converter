#!/usr/bin/env python3
import sys
import math
from collections import Counter

def analyze_fmd(filename):
    """Analyze a .fmd file to understand its format"""
    with open(filename, 'rb') as f:
        data = f.read()
    
    print(f"=== Analysis of {filename} ===")
    print(f"File size: {len(data)} bytes")
    print(f"First 32 bytes: {data[:32].hex()}")
    
    # Check for common file signatures
    if data.startswith(b'PK\x03\x04'):
        print("Detected: ZIP archive")
    elif data.startswith(b'\x1f\x8b\x08'):
        print("Detected: GZIP archive")
    elif data.startswith(b'\x78\x9c') or data.startswith(b'\x78\xda'):
        print("Detected: ZLIB compression")
    elif data.startswith(b'\x04\x7f'):
        print("Detected: Custom header starting with 04 7f")
    else:
        print("Detected: Unknown format")
    
    # Analyze byte frequency
    byte_counts = Counter(data)
    print(f"\nMost common bytes:")
    for byte, count in byte_counts.most_common(10):
        print(f"  {byte:02x}: {count} times ({count/len(data)*100:.1f}%)")
    
    # Calculate entropy
    entropy = 0
    for count in byte_counts.values():
        p = count / len(data)
        if p > 0:
            entropy -= p * math.log2(p)
    
    print(f"\nEntropy: {entropy:.2f} bits per byte")
    
    # Look for readable strings
    print(f"\nSearching for readable strings...")
    strings = []
    current_string = ""
    
    for byte in data:
        if 32 <= byte <= 126:  # Printable ASCII
            current_string += chr(byte)
        else:
            if len(current_string) >= 4:
                strings.append(current_string)
            current_string = ""
    
    if current_string and len(current_string) >= 4:
        strings.append(current_string)
    
    print(f"Found {len(strings)} strings of 4+ characters:")
    for s in strings[:20]:
        print(f"  '{s}'")

if __name__ == "__main__":
    filename = "M20f checklist.fmd"
    analyze_fmd(filename)
