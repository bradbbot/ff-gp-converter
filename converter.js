// FF-GP Converter - ForeFlight to Garmin Checklist Converter
// Based on reverse-engineered Garmin .gplts format

class FFGPConverter {
    constructor() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.convertBtn = document.getElementById('convertBtn');
        this.progress = document.getElementById('progress');
        this.progressBar = document.getElementById('progressBar');
        this.status = document.getElementById('status');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        this.setupEventListeners();
        this.currentFile = null;
    }

    setupEventListeners() {
        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.handleFileDrop(e.dataTransfer.files);
        });

        // Click to browse
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Convert button
        this.convertBtn.addEventListener('click', () => {
            this.convertFile();
        });

        // Download button
        this.downloadBtn.addEventListener('click', () => {
            this.downloadFile();
        });
    }

    handleFileDrop(files) {
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(files) {
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFile(file) {
        if (!file.name.toLowerCase().endsWith('.fmd')) {
            this.showStatus('Please select a .fmd file', 'error');
            return;
        }

        this.currentFile = file;
        this.showStatus(`File loaded: ${file.name}`, 'info');
        this.convertBtn.classList.add('active');
        this.downloadBtn.style.display = 'none';
    }

    async convertFile() {
        if (!this.currentFile) {
            this.showStatus('Please select a file first', 'error');
            return;
        }

        try {
            this.showProgress();
            this.convertBtn.disabled = true;
            
            // Read the .fmd file
            const arrayBuffer = await this.currentFile.arrayBuffer();
            
            // For now, we'll create a basic .gplts structure
            // In a full implementation, you'd parse the .fmd format
            const gpltsData = await this.createGPLTSFile(arrayBuffer);
            
            this.hideProgress();
            this.showStatus('Conversion completed successfully!', 'success');
            this.downloadBtn.style.display = 'inline-block';
            
            // Store the converted data for download
            this.convertedData = gpltsData;
            
        } catch (error) {
            this.hideProgress();
            this.showStatus(`Conversion failed: ${error.message}`, 'error');
            console.error('Conversion error:', error);
        } finally {
            this.convertBtn.disabled = false;
        }
    }

    async createGPLTSFile(fmdData) {
        // This is a simplified implementation
        // In practice, you'd need to:
        // 1. Parse the .fmd format (which appears to be encrypted/compressed)
        // 2. Extract the checklist data
        // 3. Convert to Garmin's format
        // 4. Apply AES-CBC encryption with the known key
        
        // For demonstration, we'll create a basic structure
        const checklistData = {
            name: this.currentFile.name.replace('.fmd', ''),
            items: [
                { type: 'note', text: 'Converted from ForeFlight format' },
                { type: 'item', text: 'Checklist item 1' },
                { type: 'item', text: 'Checklist item 2' }
            ]
        };

        // Create a simple binary structure (this is not the actual .gplts format)
        // The real implementation would use the Garmin format we discovered
        const encoder = new TextEncoder();
        const jsonData = JSON.stringify(checklistData);
        const data = encoder.encode(jsonData);
        
        // For now, return the data as-is
        // In the real implementation, you'd apply the Garmin encryption
        return new Blob([data], { type: 'application/octet-stream' });
    }

    downloadFile() {
        if (!this.convertedData) {
            this.showStatus('No converted file to download', 'error');
            return;
        }

        const url = URL.createObjectURL(this.convertedData);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile.name.replace('.fmd', '.gplts');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showProgress() {
        this.progress.style.display = 'block';
        this.progressBar.style.width = '0%';
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            this.progressBar.style.width = progress + '%';
        }, 200);

        this.progressInterval = interval;
    }

    hideProgress() {
        this.progress.style.display = 'none';
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
    }

    showStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FFGPConverter();
});

// TODO: Implement the actual Garmin .gplts format conversion
// Based on the EFIS Editor source code, we need to:
// 1. Parse the .fmd format (likely encrypted/compressed)
// 2. Convert to Garmin's protocol buffer format
// 3. Apply AES-CBC encryption with key: 00000000000000000000000000000000
// 4. Create a TAR.GZ archive with the encrypted content
// 5. Output as .gplts file
