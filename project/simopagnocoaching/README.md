# SimoPagno Coaching App

A React Native fitness and nutrition coaching app built with Expo.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device
- Python 3.7+ (for backend server)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup YouTube API (Optional - for Pagno Feed)

Per utilizzare il Pagno Feed con video reali del canale YouTube:

```bash
# Esegui lo script di setup automatico
./setup-youtube-api.sh

# Oppure configura manualmente:
# 1. Copia env.example come .env
# 2. Aggiungi la tua YouTube API Key
# 3. Ottieni l'API Key gratuita su: https://console.cloud.google.com/
```

**Nota**: L'API YouTube è gratuita (10,000 unità/giorno) e opzionale. Senza configurazione, l'app userà dati demo.

### 3. Start the Backend Server (Optional)

If you want to use the PagnoCalories feature:

```bash
# Make the script executable (first time only)
chmod +x start-backend.sh

# Start the backend server
./start-backend.sh
```

The backend server will run on `http://localhost:8081`

### 4. Start the Expo Development Server

```bash
npm start
```

### 5. Run on Expo Go

1. Open the Expo Go app on your mobile device
2. Scan the QR code displayed in your terminal
3. The app will load on your device

## Features

- **Home Screen**: Welcome dashboard with recent workouts and progress
- **Workout Tracking**: Log and track your workouts
- **PagnoCalories**: AI-powered food recognition and calorie counting
- **Pagno Feed**: YouTube Shorts feed from @simopagnocoaching channel
- **Nutrition Planning**: Meal plans and nutrition tracking
- **Settings**: User account management

## YouTube API Setup

### 🎬 Pagno Feed Feature

Il Pagno Feed mostra i video del canale @simopagnocoaching direttamente nell'app:

- **Gratuito**: 10,000 unità API al giorno
- **Automatico**: Fallback ai dati demo se l'API non è configurata
- **Sicuro**: API Key protetta con restrizioni

### 📋 Setup Step-by-Step

1. **Vai su Google Cloud Console**: https://console.cloud.google.com/
2. **Crea un nuovo progetto**: "SimoPagnoCoaching-YouTube"
3. **Abilita YouTube Data API v3**: Menu → API e servizi → Libreria
4. **Crea credenziali**: API e servizi → Credenziali → Chiave API
5. **Configura restrizioni** (consigliato):
   - Restrizioni applicazioni: "Siti web HTTP"
   - Restrizioni API: "YouTube Data API v3"

### 🔧 Configurazione Automatica

```bash
# Esegui lo script di setup
./setup-youtube-api.sh

# Inserisci la tua API Key quando richiesto
# Lo script creerà automaticamente il file .env
```

### 📊 Monitoraggio Utilizzo

- **Dashboard**: https://console.cloud.google.com/
- **Quota gratuita**: 10,000 unità/giorno
- **Costo aggiuntivo**: $5 per 1,000 unità extra

## Troubleshooting

### Common Issues

1. **App won't load in Expo Go**
   - Make sure your phone and computer are on the same WiFi network
   - Try switching between "Tunnel", "LAN", and "Local" connection types in Expo

2. **PagnoCalories feature not working**
   - Make sure the backend server is running (`./start-backend.sh`)
   - Check that the server is accessible at `http://localhost:8081`

3. **Pagno Feed not loading videos**
   - Check that YouTube API Key is configured in `.env`
   - Verify API quota hasn't been exceeded
   - Check console logs for API errors

4. **Image picker not working**
   - Grant camera and photo library permissions when prompted
   - On iOS, you may need to manually enable permissions in Settings

### Development

- **iOS**: Press `i` in the terminal to open iOS simulator
- **Android**: Press `a` in the terminal to open Android emulator
- **Web**: Press `w` in the terminal to open in web browser

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
│   └── PagnoFeedScreen.tsx  # YouTube feed screen
├── navigation/     # Navigation configuration
├── context/        # React Context providers
├── styles/         # Theme and styling
├── assets/         # Images, fonts, etc.
└── services/       # API and external services
    └── youtubeService.ts    # YouTube API integration
```

## Backend API

The backend provides a simple API for food analysis:

- `POST /analyze` - Analyze food images and return nutrition data
- `GET /` - Health check endpoint

## YouTube API

The YouTube service provides:

- `getChannelVideos()` - Fetch videos from @simopagnocoaching channel
- `searchVideos(query)` - Search videos by title/description
- `getChannelStats()` - Get channel statistics
- Automatic fallback to mock data if API is not configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

SimoPagno Coaching - [www.simonepagnottoni.it](http://www.simonepagnottoni.it)

Project Link: [https://github.com/yourusername/simopagno-coaching](https://github.com/yourusername/simopagno-coaching) 