// FF-GP Converter - ForeFlight to Garmin Checklist Converter
// Now with proper .fmd file parsing!

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
            
            // Step 1: Decrypt the .fmd file
            this.updateProgress(20, 'Decrypting .fmd file...');
            const checklistData = await ForeFlightDecoder.decryptFMD(this.currentFile);
            
            // Step 2: Convert to Garmin format
            this.updateProgress(50, 'Converting to Garmin format...');
            const gpltsData = await this.createGPLTSFile(checklistData);
            
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

    async createGPLTSFile(checklistData) {
        // Convert the decrypted ForeFlight data to Garmin format
        // This is where we'll implement the actual Garmin .gplts format
        
        console.log('Decrypted checklist data:', checklistData);
        
        // For now, create a basic structure
        // TODO: Implement proper Garmin .gplts format based on your working example
        
        const encoder = new TextEncoder();
        const jsonData = JSON.stringify(checklistData, null, 2);
        const data = encoder.encode(jsonData);
        
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

    updateProgress(percent, message) {
        this.progressBar.style.width = percent + '%';
        this.showStatus(message, 'info');
    }

    showProgress() {
        this.progress.style.display = 'block';
        this.progressBar.style.width = '0%';
    }

    hideProgress() {
        this.progress.style.display = 'none';
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

// TODO: Next step - implement the actual Garmin .gplts format
// We now have the decrypted ForeFlight data, but need to:
// 1. Convert it to Garmin's protocol buffer format
// 2. Apply TAR.GZ compression
// 3. Apply AES-CBC encryption with the Garmin key
// 4. Output the correct .gplts format
