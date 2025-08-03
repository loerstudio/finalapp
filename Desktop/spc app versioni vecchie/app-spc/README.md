# SPC Fitness App - QR Code Integration

A premium React Native fitness app with comprehensive QR code scanning and generation capabilities.

## Features

### QR Code Functionality
- **QR Code Scanning**: Scan QR codes using the device camera
- **QR Code Generation**: Generate QR codes for various app data
- **Smart QR Processing**: Automatically handle different QR code types (user, workout, nutrition, progress)
- **Premium UI**: Black and white design with red accents
- **Camera Permissions**: Proper permission handling for iOS and Android

### QR Code Types Supported
- **User QR Codes**: Share user profiles and information
- **Workout QR Codes**: Quick access to workout routines
- **Nutrition QR Codes**: Meal and nutrition plan sharing
- **Progress QR Codes**: Progress tracking and sharing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Expo Go** on your mobile device from App Store/Google Play

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device**
   - Scan the QR code with Expo Go app
   - Or press 'i' for iOS simulator
   - Or press 'a' for Android emulator

### QR Code Usage

#### Scanning QR Codes
1. Navigate to Home Screen
2. Tap "QR Code" in Quick Actions
3. Grant camera permission when prompted
4. Point camera at QR code to scan
5. App will automatically process and handle the QR code

#### Generating QR Codes
1. Navigate to Home Screen
2. Tap "QR Code" in Quick Actions
3. Tap "Generate QR" tab
4. View your generated QR code
5. Share or save the QR code

## Technical Implementation

### Key Components

#### QRCodeScreen (`src/screens/QRCodeScreen.tsx`)
- Main QR code interface
- Camera integration with `expo-barcode-scanner`
- QR code generation with `react-native-qrcode-svg`
- Premium UI with dark theme

#### QRCodeService (`src/services/qrCode.ts`)
- QR code data structure management
- Type-specific QR code generation
- Smart QR code parsing and handling
- Navigation integration

#### QRCodeGenerator (`src/components/QRCodeGenerator.tsx`)
- Reusable QR code modal component
- Customizable styling and options
- Share functionality support

### Dependencies

#### Core QR Code Libraries
- `expo-barcode-scanner`: Camera-based QR code scanning
- `expo-camera`: Camera permission and access
- `react-native-qrcode-svg`: QR code generation
- `react-native-svg`: SVG support for QR codes

#### Navigation
- `@react-navigation/native`: Core navigation
- `@react-navigation/stack`: Stack navigation
- `@react-navigation/bottom-tabs`: Tab navigation

### File Structure
```
src/
├── components/
│   ├── Navigation.tsx
│   └── QRCodeGenerator.tsx
├── screens/
│   ├── HomeScreen.tsx
│   └── QRCodeScreen.tsx
├── services/
│   └── qrCode.ts
└── constants/
    └── colors.ts
```

## QR Code Data Format

QR codes contain JSON data with the following structure:

```json
{
  "id": "unique-identifier",
  "type": "user|workout|nutrition|progress",
  "data": {
    // Type-specific data
  },
  "timestamp": 1234567890
}
```

### Example QR Code Data

#### User QR Code
```json
{
  "id": "user-123",
  "type": "user",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "membershipType": "Premium"
  },
  "timestamp": 1703123456789
}
```

#### Workout QR Code
```json
{
  "id": "workout-456",
  "type": "workout",
  "data": {
    "name": "Upper Body Strength",
    "duration": "45 minutes",
    "difficulty": "Intermediate"
  },
  "timestamp": 1703123456789
}
```

## Permissions

### iOS
- Camera access for QR code scanning
- Photo library access for saving QR codes

### Android
- Camera permission
- Storage permissions for saving QR codes

## Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Go to device settings
   - Find SPC Fitness app
   - Enable camera permission

2. **QR Code Not Scanning**
   - Ensure good lighting
   - Hold device steady
   - Check QR code is not damaged

3. **App Crashes on QR Screen**
   - Restart Expo development server
   - Clear app cache
   - Reinstall dependencies

### Development Tips

1. **Testing QR Codes**
   - Use online QR code generators for testing
   - Test with different QR code sizes
   - Verify data format matches expected structure

2. **Performance Optimization**
   - QR codes are generated on-demand
   - Scanning uses native camera APIs
   - Minimal memory footprint

## Contributing

1. Follow the existing code style
2. Test QR functionality on both iOS and Android
3. Ensure camera permissions work correctly
4. Update documentation for new features

## License

This project is proprietary software for SPC Fitness. 