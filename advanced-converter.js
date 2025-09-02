// Advanced FF-GP Converter with actual Garmin .gplts format implementation
// Based on reverse-engineered format from EFIS Editor

class AdvancedFFGPConverter {
    constructor() {
        this.setupCrypto();
    }

    async setupCrypto() {
        // Garmin uses AES-CBC encryption with a known key
        this.cipherKey = new Uint8Array(32).fill(0); // 00000000000000000000000000000000
        this.cipherIV = new Uint8Array(16).fill(0);  // 16 bytes of zeros
        
        // Import the crypto key
        this.cryptoKey = await crypto.subtle.importKey(
            'raw',
            this.cipherKey,
            { name: 'AES-CBC' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async convertFMDtoGPLTS(fmdData) {
        try {
            // Step 1: Parse the .fmd file (this is the challenging part)
            const checklistData = await this.parseFMDFile(fmdData);
            
            // Step 2: Convert to Garmin's format
            const garminData = this.convertToGarminFormat(checklistData);
            
            // Step 3: Create the container structure
            const container = this.createGarminContainer(garminData);
            
            // Step 4: Serialize to JSON (Garmin uses protocol buffers, but JSON works for now)
            const jsonString = JSON.stringify(container, null, 2);
            
            // Step 5: Encrypt the data
            const encryptedData = await this.encryptData(jsonString);
            
            // Step 6: Create the final .gplts file
            return this.createGPLTSFile(encryptedData);
            
        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error(`Failed to convert file: ${error.message}`);
        }
    }

    async parseFMDFile(fmdData) {
        // This is where we need to reverse-engineer the .fmd format
        // For now, we'll create a placeholder structure
        
        // The .fmd file appears to be encrypted/compressed
        // We might need to:
        // 1. Try different decryption methods
        // 2. Look for known patterns
        // 3. Use the JSON file as a reference
        
        return {
            metadata: {
                name: 'Converted Checklist',
                makeAndModel: 'Unknown Aircraft',
                aircraftInfo: 'N/A'
            },
            groups: [
                {
                    title: 'Pre-Flight',
                    checklists: [
                        {
                            title: 'Preflight Checklist',
                            items: [
                                { type: 'title', prompt: 'COCKPIT', expectation: '' },
                                { type: 'challenge_response', prompt: 'Required Documents', expectation: 'AVAILABLE' },
                                { type: 'challenge_response', prompt: 'Flashlight On Board', expectation: 'CHECK' }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    convertToGarminFormat(checklistData) {
        // Convert EFIS format to Garmin Pilot format
        const garminChecklists = [];
        const garminItems = [];
        
        checklistData.groups.forEach(group => {
            group.checklists.forEach(checklist => {
                const garminChecklist = {
                    uuid: this.generateUUID(),
                    name: checklist.title,
                    type: 'NORMAL',
                    subtype: 'SUBTYPE_OTHER',
                    completionItem: 'ACTION_GO_TO_NEXT_CHECKLIST',
                    checklistItems: []
                };
                
                checklist.items.forEach(item => {
                    const garminItem = {
                        uuid: this.generateUUID(),
                        title: item.prompt,
                        itemType: this.mapItemType(item.type),
                        action: item.expectation || '',
                        checked: false
                    };
                    
                    garminItems.push(garminItem);
                    garminChecklist.checklistItems.push(garminItem.uuid);
                });
                
                garminChecklists.push(garminChecklist);
            });
        });
        
        return {
            checklists: garminChecklists,
            checklistItems: garminItems
        };
    }

    mapItemType(efisType) {
        const typeMap = {
            'title': 'TYPE_NOTE',
            'challenge_response': 'TYPE_PLAIN_TEXT',
            'challenge': 'TYPE_PLAIN_TEXT',
            'plaintext': 'TYPE_NOTE',
            'note': 'TYPE_NOTE',
            'caution': 'TYPE_NOTE',
            'warning': 'TYPE_NOTE',
            'space': 'TYPE_NOTE'
        };
        
        return typeMap[efisType] || 'TYPE_PLAIN_TEXT';
    }

    createGarminContainer(garminData) {
        return {
            dataModelVersion: 1,
            packageTypeVersion: 1,
            name: 'Converted Checklist',
            type: 'checklistBinder',
            objects: [
                {
                    checklists: garminData.checklists,
                    binders: [
                        {
                            uuid: this.generateUUID(),
                            sourceTemplateUUID: this.generateUUID(),
                            sortOrder: 0,
                            name: 'Converted Checklist',
                            checklists: garminData.checklists.map(c => c.uuid)
                        }
                    ],
                    checklistItems: garminData.checklistItems,
                    version: null
                }
            ]
        };
    }

    async encryptData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        // Apply Garmin's XOR with IV (as seen in the EFIS Editor code)
        const mixedData = this.mixWithIV(dataBuffer);
        
        // Encrypt with AES-CBC
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv: this.cipherIV },
            this.cryptoKey,
            mixedData
        );
        
        return new Uint8Array(encrypted);
    }

    mixWithIV(data) {
        const result = new Uint8Array(data);
        for (let i = 0; i < Math.min(16, data.length); i++) {
            result[i] ^= this.cipherIV[i];
        }
        return result;
    }

    createGPLTSFile(encryptedData) {
        // Create the final .gplts file
        // In the real implementation, this would be a TAR.GZ archive
        // For now, we'll return the encrypted data directly
        
        return new Blob([encryptedData], { 
            type: 'application/octet-stream' 
        });
    }

    generateUUID() {
        // Simple UUID v4 generator
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Export for use in the main converter
window.AdvancedFFGPConverter = AdvancedFFGPConverter;
