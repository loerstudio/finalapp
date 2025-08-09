# 🌐 Public Network Access for SimoPagno Coaching

This guide explains how to make your Expo app accessible to everyone, not just your local network.

## 🚀 Quick Start (Recommended)

### Option 1: Use the provided script
```bash
./start-public.sh
```

### Option 2: Use npm script
```bash
npm run start:public
```

### Option 3: Manual command
```bash
expo start --tunnel
```

## 📱 What Each Option Does

### `--tunnel` (Public Access)
- ✅ **Anyone can access** your app from anywhere
- ✅ Works through firewalls and NAT
- ✅ Share QR code with anyone worldwide
- ⚠️ Slightly slower than local network
- ⚠️ Requires internet connection

### `--lan` (Local Network)
- ✅ Faster than tunnel
- ✅ Anyone on same WiFi can access
- ❌ Only works on same network
- ❌ Won't work through firewalls

### Default (Localhost)
- ✅ Fastest performance
- ❌ Only works on your device
- ❌ No sharing possible

## 🔧 Configuration

The app is configured with:
- `enablePublicAccess: true` in app.json
- Network security settings for iOS and Android
- Cleartext traffic allowed for development

## 📋 Steps to Share Your App

1. **Start with public access:**
   ```bash
   npm run start:public
   ```

2. **Wait for tunnel to establish** (you'll see a public URL)

3. **Share the QR code** with anyone who wants to test

4. **They scan the QR code** with Expo Go app

## 🌍 Troubleshooting

### If tunnel doesn't work:
```bash
# Try clearing cache
expo start --clear

# Or use LAN mode as fallback
npm run start:lan
```

### If users can't connect:
- Make sure they have Expo Go app installed
- Check if your internet connection is stable
- Try restarting the development server

## 📞 Support

If you have issues with public access:
1. Check your firewall settings
2. Ensure you have a stable internet connection
3. Try using LAN mode as alternative

---

**Note:** Public access is perfect for testing with clients, team members, or anyone who needs to see your app in development! 