# 🧪 Testing the Tinder Flow with Postman

This guide will help you simulate a full multiplayer game loop using Postman.

## Prerequisites
1. **API Running:** `nx serve api`
2. **Postman Installed**
3. **Host Token:** You need one existing user token for the Host.
   - *Tip:* Sign in as Host first to get your Bearer token.

## Setup Postman Environment
Create an Environment in Postman with these variables:
- `baseUrl`: `http://localhost:3000/api`
- `hostToken`: `<Paste Host Bearer Token>`

## The Scenario (Happy Path)

### Step 0: Guest Auth (Anonymous)
- **Request:** `POST /auth/sign-up/anonymous`
- **Body:** `{ "name": "GuestUser" }`
- **Result:** Returns a token.
- *Postman Magic:* The script automatically saves `guestToken` to your environment.

### Step 1: Create Session (Host)
- **Request:** `POST /sessions`
- **Body:** `{ "filters": { "limit": 5 } }`
- **Result:** You get a `code` (e.g. `ABCD`) and a list of `movieIds`.
- *Postman Magic:* The script automatically saves `sessionId`, `sessionCode` and `firstMovieId`.

### Step 2: Join Session (Guest)
- **Request:** `POST /sessions/join`
- **Body:** `{ "code": "{{sessionCode}}" }`
- **Result:** The Guest receives the Session object. They are now in the game.

### Step 3: Host Swipes Right (Like)
- **Request:** `POST /sessions/:id/swipe`
- **Body:** `{ "movieId": "{{firstMovieId}}", "liked": true }`
- **Result:**
  ```json
  {
    "isMatch": false
  }
  ```
  *Why?* Because the Guest hasn't voted yet.

### Step 4: Guest Swipes Right (Like)
- **Request:** `POST /sessions/:id/swipe`
- **Body:** `{ "movieId": "{{firstMovieId}}", "liked": true }`
- **Result:**
  ```json
  {
    "isMatch": true,
    "matchedMovieId": "..."
  }
  ```
  🎉 **BOOM! IT'S A MATCH!**

## Testing Real-Time (Optional)
To verify WebSockets:
1. Open a WebSocket client (Postman supports it now, or `socket.io-client-tool`).
2. Connect to `ws://localhost:3000`.
3. When Step 4 happens, you should see a `match_found` event.
