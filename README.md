# FF-GP Converter

A web-based tool to convert ForeFlight (.fmd) checklist files to Garmin (.gplts) format for use in Garmin Pilot.

## Features

- **Drag & Drop Interface**: Simply drag your .fmd file onto the converter
- **Instant Conversion**: Convert ForeFlight checklists to Garmin format in seconds
- **Web-Based**: No installation required, works in any modern browser
- **Privacy-First**: All processing happens locally in your browser

## How to Use

1. Open the converter in your web browser
2. Drag and drop your .fmd file onto the designated area
3. The converter will automatically process the file
4. Download your converted .gplts file
5. Import the .gplts file into Garmin Pilot

## Technical Details

This converter is based on the reverse-engineered Garmin .gplts format and implements:

- AES-CBC encryption (required by Garmin Pilot)
- TAR.GZ compression
- Protocol Buffer serialization
- UUID generation for checklist items

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## License

MIT License - see LICENSE file for details

## Disclaimer

This tool is provided as-is for educational and personal use. Use at your own risk when importing checklists into flight software.
