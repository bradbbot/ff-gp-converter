#!/usr/bin/env python3
import struct
import sys
import math
from collections import Counter

def deep_analyze_gplts(filename):
    """Deep analysis of .gplts file structure"""
    with open(filename, 'rb') as f:
        data = f.read()
    
    print(f"=== Deep Analysis of {filename} ===")
    print(f"File size: {len(data)} bytes")
    
    # Analyze byte patterns
    print(f"\nFirst 32 bytes: {data[:32].hex()}")
    print(f"Last 32 bytes: {data[-32:].hex()}")
    
    # Check for common file signatures
    signatures = {
        b'PK\x03\x04': 'ZIP',
        b'\x1f\x8b\x08': 'GZIP',
        b'\x78\x9c': 'ZLIB',
        b'\x78\xda': 'ZLIB',
        b'\x78\x8d': 'Possible custom compression',
        b'\x89PNG': 'PNG',
        b'GIF8': 'GIF',
        b'JFIF': 'JPEG'
    }
    
    print("\nFile signature analysis:")
    for sig, desc in signatures.items():
        if data.startswith(sig):
            print(f"  ✓ {desc}: {sig.hex()}")
        else:
            print(f"  ✗ {desc}: {sig.hex()}")
    
    # Analyze byte frequency
    byte_counts = Counter(data)
    print(f"\nMost common bytes:")
    for byte, count in byte_counts.most_common(10):
        print(f"  {byte:02x}: {count} times ({count/len(data)*100:.1f}%)")
    
    # Look for repeating patterns
    print(f"\nPattern analysis:")
    for pattern_len in [2, 4, 8]:
        patterns = Counter()
        for i in range(len(data) - pattern_len + 1):
            pattern = data[i:i+pattern_len]
            patterns[pattern] += 1
        
        most_common = patterns.most_common(3)
        if most_common and most_common[0][1] > 1:
            print(f"  {pattern_len}-byte patterns:")
            for pattern, count in most_common:
                if count > 1:
                    print(f"    {pattern.hex()}: {count} times")
    
    # Try to find structure
    print(f"\nStructure analysis:")
    
    # Check if it's encrypted by looking for entropy
    entropy = 0
    for count in byte_counts.values():
        p = count / len(data)
        if p > 0:
            entropy -= p * math.log2(p)
    
    print(f"  Estimated entropy: {entropy:.2f} bits per byte")
    if entropy > 7.5:
        print("  High entropy - likely encrypted or compressed")
    elif entropy > 6.0:
        print("  Medium entropy - possibly encoded")
    else:
        print("  Low entropy - might contain readable text")
    
    # Look for potential headers/footers
    print(f"\nPotential structure markers:")
    
    # Check for null bytes (common in structured data)
    null_count = data.count(0)
    print(f"  Null bytes: {null_count} ({null_count/len(data)*100:.1f}%)")
    
    # Check for printable text regions
    printable_regions = []
    current_region = []
    for i, byte in enumerate(data):
        if 32 <= byte <= 126:  # Printable ASCII
            current_region.append((i, byte))
        else:
            if len(current_region) >= 4:  # Minimum 4 chars
                printable_regions.append(current_region)
            current_region = []
    
    if current_region and len(current_region) >= 4:
        printable_regions.append(current_region)
    
    print(f"  Printable text regions: {len(printable_regions)}")
    for i, region in enumerate(printable_regions[:5]):  # Show first 5
        start, end = region[0][0], region[-1][0]
        text = ''.join(chr(byte) for _, byte in region)
        print(f"    Region {i+1}: offset {start}-{end}: '{text}'")
    
    return data

if __name__ == "__main__":
    filename = "Mooney M20J 201 Checklists.gplts"
    data = deep_analyze_gplts(filename)
