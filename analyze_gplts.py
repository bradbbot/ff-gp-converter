#!/usr/bin/env python3
import zlib
import struct
import sys

def analyze_gplts(filename):
    """Analyze a .gplts file to understand its format"""
    with open(filename, 'rb') as f:
        data = f.read()
    
    print(f"File: {filename}")
    print(f"Size: {len(data)} bytes")
    print(f"First 16 bytes: {data[:16].hex()}")
    
    # Check for common compression signatures
    if data.startswith(b'\x78\x9c'):
        print("Detected: zlib compression")
        try:
            decompressed = zlib.decompress(data)
            print(f"Decompressed size: {len(decompressed)} bytes")
            print(f"First 100 chars: {decompressed[:100]}")
            return decompressed
        except:
            print("Failed to decompress with zlib")
    
    elif data.startswith(b'\x78\x8d'):
        print("Detected: Possible gzip-like header (78 8d)")
        # Try different offsets
        for offset in range(0, min(10, len(data))):
            try:
                decompressed = zlib.decompress(data[offset:], -15)
                print(f"Success at offset {offset}: {len(decompressed)} bytes")
                print(f"First 100 chars: {decompressed[:100]}")
                return decompressed
            except:
                continue
        
        print("No zlib decompression worked at any offset")
    
    # Try to find readable strings
    print("\nSearching for readable strings...")
    strings = []
    current_string = ""
    
    for byte in data:
        if 32 <= byte <= 126:  # Printable ASCII
            current_string += chr(byte)
        else:
            if len(current_string) >= 3:
                strings.append(current_string)
            current_string = ""
    
    if current_string and len(current_string) >= 3:
        strings.append(current_string)
    
    print(f"Found {len(strings)} potential strings:")
    for s in strings[:20]:  # Show first 20
        print(f"  '{s}'")
    
    return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = "Mooney M20J 201 Checklists.gplts"
    
    result = analyze_gplts(filename)
