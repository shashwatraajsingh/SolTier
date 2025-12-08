# Debugging: "Failed to Connect X" Issue

## Quick Fixes

### 1. Check if Backend is Running
```bash
curl http://localhost:3001/health
```

Expected output:
```json
{"status":"healthy",...}
```

### 2. Test X Connection Directly
```bash
# Register a creator first
curl -X POST http://localhost:3001/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"YOUR_WALLET_ADDRESS","role":"creator"}'

# Then connect X
curl -X POST http://localhost:3001/api/x/connect \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"YOUR_WALLET_ADDRESS","username":"your_twitter_handle"}'
```

### 3. Check Browser Console
Open browser DevTools (F12) → Console tab
Look for errors like:
- CORS errors
- Network errors
- API endpoint errors

### 4. Restart Frontend (if needed)
The .env.local file was just created. You need to restart the frontend:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd /home/shashwat/SolTier/reach-pay
npm run dev
```

### 5. Common Issues & Solutions

**Issue: CORS Error**
- Check backend logs
- Backend should show: `CORS_ORIGIN=*` (allows all origins)

**Issue: "User not found" or "Only creators can connect X"**
- Solution: You need to select "I'm a Creator" role first
- The improved code now handles this automatically

**Issue: Network Error / Can't reach backend**
- Check if backend is running on port 3001
- Check if .env.local has correct URL: `NEXT_PUBLIC_API_URL=http://localhost:3001`

## Step-by-Step Flow

1. Connect wallet ✅
2. Select "I'm a Creator" ✅
3. User gets registered automatically ✅
4. Click "Connect X Account" ✅
5. Enter your X username (no @ symbol)
6. Should succeed!

## Testing in Browser

1. Open http://localhost:3000
2. Open DevTools (F12)
3. Go to Network tab
4. Try connecting X
5. Look for the POST request to `/api/x/connect`
6. Check the response

## Backend Logs

Check the backend terminal for logs like:
```
2025-12-08 21:49:07 [info]: X account connected: <wallet> -> @<username>
```

If you see errors, they'll appear in red in the backend terminal.

## If Still Not Working

Please check:
1. Is the backend terminal showing any errors?
2. What does the browser console show when you try to connect X?
3. What is the exact error message you see in the toast notification?

Share these details and I can help further!
