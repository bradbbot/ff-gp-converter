// ForeFlight .fmd file decoder based on EFIS Editor source code
class ForeFlightDecoder {
    static CIPHER_KEY = new Uint8Array([0x81, 0xe0, 0x6e, 0x41, 0xa9, 0x3f, 0x38, 0x48]);
    static CIPHER_BLOCK_SIZE = 16;

    static async decryptFMD(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            
            // Extract IV (first 16 bytes) and encrypted data
            const iv = new Uint8Array(arrayBuffer.slice(0, this.CIPHER_BLOCK_SIZE));
            const encryptedData = arrayBuffer.slice(this.CIPHER_BLOCK_SIZE);
            
            // Decrypt using AES-CBC
            const decrypted = await this.decryptAES(this.CIPHER_KEY, iv, encryptedData);
            
            // Convert to string
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decrypted);
            
            // Parse JSON
            const checklistData = JSON.parse(jsonString);
            
            return checklistData;
            
        } catch (error) {
            console.error('Failed to decrypt .fmd file:', error);
            throw new Error(`Failed to decrypt .fmd file: ${error.message}`);
        }
    }

    static async decryptAES(key, iv, data) {
        // Import the crypto key
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'AES-CBC' },
            false,
            ['decrypt']
        );
        
        // Decrypt the data
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: iv },
            cryptoKey,
            data
        );
        
        return new Uint8Array(decrypted);
    }
}

// Export for use in the main converter
window.ForeFlightDecoder = ForeFlightDecoder;
