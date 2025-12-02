# 🧪 Testing the Tinder Flow with Postman

This guide will help you simulate a full multiplayer game loop using Postman.

## Prerequisites
1. **API Running:** `nx serve api`
2. **Postman Installed**
3. **A Plex server** with movies in a library

## Setup Postman Environment
Create an Environment in Postman with these variables:
- `baseUrl`: `http://localhost:3000/api`
- `hostToken`: (will be set automatically)
- `guestToken`: (will be set automatically)

**Important:** For all auth requests, add the header:
- `Origin`: `http://localhost:3000`

---

## Phase 1: Setup Host & Plex Connection

### Step 0a: Create Host User (Email/Password)
- **Request:** `POST {{baseUrl}}/auth/sign-up/email`
- **Headers:** `Origin: http://localhost:3000`
- **Body:**
  ```json
  {
    "email": "host@test.com",
    "password": "Test1234!",
    "name": "Host"
  }
  ```
- **Result:** Returns a session with token.
- *Save* the token as `hostToken` in your environment.

### Step 0b: Configure Plex Connection (Host)
First, get a Plex PIN:
- **Request:** `GET {{baseUrl}}/plex/auth/pin`
- **Result:** Returns a `code` and `id`. Go to **plex.tv/link** and enter the code.

Check the PIN status:
- **Request:** `GET {{baseUrl}}/plex/auth/pin/{{pinId}}`
- **Result:** Once validated, returns `authToken`.

Get available Plex servers:
- **Request:** `GET {{baseUrl}}/plex/resources?token={{authToken}}`
- **Result:** Returns list of servers. Note the server URL.

Save the Plex configuration:
- **Request:** `POST {{baseUrl}}/plex/config`
- **Auth:** Bearer `{{hostToken}}`
- **Body:**
  ```json
  {
    "serverUrl": "http://YOUR_PLEX_SERVER:32400",
    "token": "{{authToken}}"
  }
  ```
- **Result:** `{ "success": { "configured": true } }`

### Step 0c: Sync Movies from Plex (Host)
Sync libraries:
- **Request:** `GET {{baseUrl}}/movies/sync/libraries`
- **Auth:** Bearer `{{hostToken}}`

Fetch movies:
- **Request:** `GET {{baseUrl}}/movies/fetch/movies/all`
- **Auth:** Bearer `{{hostToken}}`
- **Result:** Movies are now in the database!

---

## Phase 2: The Tinder Game Flow

### Step 1: Create Guest User (Anonymous)
- **Request:** `POST {{baseUrl}}/auth/sign-in/anonymous`
- **Headers:** `Origin: http://localhost:3000`
- **Result:** Returns a session with token.
- *Save* the token as `guestToken` in your environment.

### Step 2: Create Session (Host)
- **Request:** `POST {{baseUrl}}/game-sessions`
- **Auth:** Bearer `{{hostToken}}`
- **Body:**
  ```json
  {
    "movieIds": ["movie-guid-1", "movie-guid-2", "movie-guid-3"]
  }
  ```
  Or to get movies from database filters (when implemented):
  ```json
  {
    "filters": { "limit": 5 }
  }
  ```
- **Result:** You get a `code` (e.g. `ABCD`) and a list of `movieIds`.
- *Save* `sessionId`, `sessionCode` and `firstMovieId` to your environment.

### Step 3: Join Session (Guest)
- **Request:** `POST {{baseUrl}}/game-sessions/join`
- **Auth:** Bearer `{{guestToken}}`
- **Body:**
  ```json
  {
    "code": "{{sessionCode}}"
  }
  ```
- **Result:** The Guest receives the Session object. They are now in the game.

### Step 4: Host Swipes Right (Like)
- **Request:** `POST {{baseUrl}}/game-sessions/{{sessionId}}/swipe`
- **Auth:** Bearer `{{hostToken}}`
- **Body:**
  ```json
  {
    "movieId": "{{firstMovieId}}",
    "liked": true
  }
  ```
- **Result:**
  ```json
  {
    "isMatch": false
  }
  ```
  *Why?* Because the Guest hasn't voted yet.

### Step 5: Guest Swipes Right (Like)
- **Request:** `POST {{baseUrl}}/game-sessions/{{sessionId}}/swipe`
- **Auth:** Bearer `{{guestToken}}`
- **Body:**
  ```json
  {
    "movieId": "{{firstMovieId}}",
    "liked": true
  }
  ```
- **Result:**
  ```json
  {
    "isMatch": true,
    "matchedMovieId": "..."
  }
  ```
  🎉 **BOOM! IT'S A MATCH!**

---

## Testing Real-Time (Optional)
To verify WebSockets:
1. Open a WebSocket client (Postman supports it now, or `socket.io-client-tool`).
2. Connect to `ws://localhost:3000`.
3. When Step 5 happens, you should see a `match_found` event.

---

## Quick Reference: All Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Sign up (email) | POST | `/auth/sign-up/email` |
| Sign in (anonymous) | POST | `/auth/sign-in/anonymous` |
| Get Plex PIN | GET | `/plex/auth/pin` |
| Check Plex PIN | GET | `/plex/auth/pin/:id` |
| Get Plex servers | GET | `/plex/resources?token=xxx` |
| **Configure Plex** | **POST** | `/plex/config` |
| Sync libraries | GET | `/movies/sync/libraries` |
| Fetch movies | GET | `/movies/fetch/movies/:category` |
| Create session | POST | `/game-sessions` |
| Join session | POST | `/game-sessions/join` |
| Swipe | POST | `/game-sessions/:id/swipe` |
