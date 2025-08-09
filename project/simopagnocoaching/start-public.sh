#!/bin/bash

echo "🚀 Starting SimoPagno Coaching with PUBLIC network access..."
echo "📱 Anyone can now scan the QR code to access your app!"
echo ""

# Check if expo-cli is installed
if ! command -v expo &> /dev/null; then
    echo "❌ Expo CLI not found. Installing..."
    npm install -g @expo/cli
fi

# Start with tunnel mode for public access
echo "🌐 Starting in tunnel mode..."
expo start --tunnel

echo ""
echo "✅ App is now accessible publicly!"
echo "📋 Share the QR code with anyone to let them test your app" 