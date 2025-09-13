// FF-GP Converter - ForeFlight to Garmin Checklist Converter
// Now with proper .fmd file parsing!

console.log('FF-GP Converter: Starting initialization...');

class FFGPConverter {
    constructor() {
        console.log('FF-GP Converter: Constructor called');
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.convertBtn = document.getElementById('convertBtn');
        this.progress = document.getElementById('progress');
        this.progressBar = document.getElementById('progressBar');
        this.status = document.getElementById('status');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        console.log('FF-GP Converter: Elements found:', {
            dropZone: !!this.dropZone,
            fileInput: !!this.fileInput,
            convertBtn: !!this.convertBtn
        });
        
        this.setupEventListeners();
        this.currentFile = null;
        console.log('FF-GP Converter: Initialization complete');
    }

    setupEventListeners() {
        console.log('FF-GP Converter: Setting up event listeners');
        
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
        
        console.log('FF-GP Converter: Event listeners set up');
    }

    handleFileDrop(files) {
        console.log('FF-GP Converter: File dropped', files.length);
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(files) {
        console.log('FF-GP Converter: File selected', files.length);
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFile(file) {
        console.log('FF-GP Converter: Handling file', file.name, file.size);
        
        if (!file.name.toLowerCase().endsWith('.fmd')) {
            this.showStatus('Please select a .fmd file', 'error');
            return;
        }

        this.currentFile = file;
        this.showStatus(`File loaded: ${file.name}`, 'info');
        this.convertBtn.classList.add('active');
        this.downloadBtn.style.display = 'none';
        console.log('FF-GP Converter: File loaded successfully');
    }

    async convertFile() {
        console.log('FF-GP Converter: Starting conversion...');
        
        if (!this.currentFile) {
            this.showStatus('Please select a file first', 'error');
            return;
        }

        try {
            this.showProgress();
            this.convertBtn.disabled = true;
            
            // Step 1: Decrypt the .fmd file
            this.updateProgress(20, 'Decrypting .fmd file...');
            console.log('FF-GP Converter: Calling ForeFlightDecoder.decryptFMD...');
            
            const checklistData = await ForeFlightDecoder.decryptFMD(this.currentFile);
            console.log('FF-GP Converter: Decryption successful!', checklistData);
            
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
            console.error('FF-GP Converter: Conversion error:', error);
        } finally {
            this.convertBtn.disabled = false;
        }
    }

    async createGPLTSFile(checklistData) {
        console.log('FF-GP Converter: Creating GPLTS file from data:', checklistData);
        
        // Convert the decrypted ForeFlight data to Garmin format
        // This is where we'll implement the actual Garmin .gplts format
        
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
console.log('FF-GP Converter: Adding DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
    console.log('FF-GP Converter: DOM loaded, creating converter instance');
    new FFGPConverter();
});

console.log('FF-GP Converter: Script loaded');
