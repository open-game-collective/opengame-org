# Authentication in Your App

This document describes the authentication flow for both web browsers and mobile applications.

## Overview

The application uses email-based authentication with 6-digit codes and a dual-token system:
- **Access Token**: Short-lived token (15 minutes) used for API requests
- **Refresh Token**: Long-lived token (7 days) used to obtain new access tokens

## Authentication Flows

### 1. Email Authentication

All clients (web and mobile) start with email authentication:

1. **Request Login Code**
   ```http
   POST /auth/email/code
   Content-Type: application/json
   
   {
     "email": "user@example.com"
   }
   ```
   Returns:
   ```json
   {
     "success": true,
     "message": "Code sent to email",
     "expiresIn": 600
   }
   ```

2. **Verify Code**
   ```http
   POST /auth/email/verify
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "code": "123456"
   }
   ```
   Returns:
   ```json
   {
     "userId": "user_123",
     "accessToken": "...",
     "refreshToken": "..."
   }
   ```

### 2. Web Browser Flow

After email verification, the web browser automatically handles token management through cookies:

1. **Initial Session Creation**
   - Happens automatically after email verification
   - Creates both access and refresh tokens
   - Stores tokens in HTTP-only cookies
   - Access Token Cookie: `session_token` (15m expiry)
   - Refresh Token Cookie: `refresh_token` (7d expiry)

2. **Automatic Token Refresh**
   - Handled by server middleware
   - When access token expires, automatically uses refresh token
   - Transparent to the user
   - Sets new cookies with updated tokens

### 3. Mobile App Flow

After email verification, mobile apps must manually manage token lifecycle:

1. **Manual Token Refresh**
   ```http
   POST /auth/refresh
   Content-Type: application/json
   
   {
     "refreshToken": "..."
   }
   ```
   Returns:
   ```json
   {
     "userId": "user_123",
     "accessToken": "...",
     "refreshToken": "..."  // New refresh token
   }
   ```

2. **Actor Kit Access**
   ```http
   POST /auth/access-token
   Authorization: Bearer {session_access_token}
   Content-Type: application/json
   
   {
     "actorType": "user",
     "actorId": "user_123"
   }
   ```
   Returns:
   ```json
   {
     "accessToken": "..."  // Actor-specific access token
   }
   ```

## Token Types

### Session Access Token
- Purpose: Authenticate general API requests
- Lifetime: 15 minutes
- Contains: `userId`, `sessionId`
- Format: JWT

### Session Refresh Token
- Purpose: Obtain new access tokens
- Lifetime: 7 days
- Contains: `userId`
- Format: JWT

### Actor Access Token
- Purpose: Authenticate Actor Kit WebSocket connections
- Lifetime: 24 hours
- Contains: `actorId`, `actorType`, `callerId`
- Format: JWT

## Security Considerations

1. **Token Storage**
   - Web: HTTP-only cookies with secure flag
   - Mobile: Secure storage (Keychain/Keystore)

2. **Token Transmission**
   - Always over HTTPS
   - Authorization header for mobile
   - Cookies for web

3. **Token Rotation**
   - New refresh token issued with each refresh
   - Invalidates old refresh tokens

4. **CSRF Protection**
   - Web: SameSite=Strict cookie attribute
   - Mobile: Not needed (no cookie-based auth)

5. **Email Verification**
   - Rate limit code requests (3 per 10 minutes per email)
   - Rate limit verification attempts (5 per code)
   - Implement exponential backoff for failed attempts
   - 6-digit codes expire after 10 minutes
   - One active code per email

## API Endpoints

### `/auth/user`
Creates a new anonymous user.
- Method: POST
- No authentication required
- Returns user ID and tokens
- Example:
  ```http
  POST /auth/user
  ```
  Response:
  ```json
  {
    "userId": "user_123",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### `/auth/email/code`
Requests a verification code be sent to an email.
- Method: POST
- Requires valid access token
- Rate limited
- Example:
  ```http
  POST /auth/email/code
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

  {
    "email": "user@example.com"
  }
  ```
  Response:
  ```json
  {
    "success": true,
    "message": "Code sent to email",
    "expiresIn": 600
  }
  ```

### `/auth/email/verify`
Verifies email code and links email to user account.
- Method: POST
- Requires valid access token
- Example:
  ```http
  POST /auth/email/verify
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
  Response:
  ```json
  {
    "userId": "user_123",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### `/auth/refresh`
Refreshes an expired access token.
- Method: POST
- Requires refresh token
- Example:
  ```http
  POST /auth/refresh
  Content-Type: application/json

  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
  Response:
  ```json
  {
    "userId": "user_123",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### `/auth/access-token`
Generates actor-specific access tokens for Actor Kit.
- Method: POST
- Requires valid session access token
- Example:
  ```http
  POST /auth/access-token
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

  {
    "actorType": "user",
    "actorId": "user_123"
  }
  ```
  Response:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### `/auth/one-time-token`
Generates a one-time token for cross-site authentication.
- Method: POST
- Requires valid session token
- Returns a short-lived JWT token containing the user ID
- Token expires in 30 seconds
- Example:
  ```http
  POST /auth/one-time-token
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  ```
  Response:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

## Cross-Site Authentication Flow

1. Site A requests a one-time token:
```typescript
const response = await fetch('https://site-a.com/auth/one-time-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${currentSessionToken}`
  }
});
const { token } = await response.json();
```

2. Site A sends the token to Site B (via URL parameter, postMessage, etc.)

3. Site B verifies the token:
```typescript
import { jwtVerify } from "jose";

async function verifyOneTimeToken(token: string) {
  try {
    const verified = await jwtVerify(
      token, 
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    
    // Check token audience and expiry
    if (verified.payload.aud !== "ONE_TIME") {
      throw new Error("Invalid token type");
    }
    
    return verified.payload.userId as string;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
```

## Complete Example Flow

Here's a complete example of a user journey from anonymous to verified:

```typescript
// 1. Create anonymous user
const createUser = await fetch('https://opengame.org/auth/user', {
  method: 'POST'
});
const { userId, accessToken, refreshToken } = await createUser.json();

// 2. Get actor-specific token for real-time features
const actorToken = await fetch('https://opengame.org/auth/access-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    actorType: 'user',
    actorId: userId
  })
});
const { accessToken: actorAccessToken } = await actorToken.json();

// 3. Later: Request email verification
const requestCode = await fetch('https://opengame.org/auth/email/code', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

// 4. Verify email with code
const verifyEmail = await fetch('https://opengame.org/auth/email/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456'
  })
});
const { 
  userId: verifiedUserId, 
  accessToken: newAccessToken, 
  refreshToken: newRefreshToken 
} = await verifyEmail.json();

// 5. Refresh token when needed
const refresh = await fetch('https://opengame.org/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: newRefreshToken
  })
});
```

## Implementation Notes

1. Web browsers handle token refresh automatically through middleware
2. Mobile apps must implement token refresh logic
3. Actor Kit connections require separate access tokens
4. All tokens are JWTs with different payloads and lifetimes
5. Email verification codes stored in KV with expiry
6. User accounts created on first successful verification

## Example Flows

### New User Registration (Mobile)
```sequence
Client -> Server: POST /auth/access-token {actorType, actorId}
Server -> Client: {accessToken} // Actor-specific token
Client -> Server: POST /auth/email/code {email}
Server -> Email: Send 6-digit code
Server -> Client: {success: true}
Client -> Server: POST /auth/email/verify {email, code}
Server -> Client: {userId, accessToken, refreshToken}
```

### Existing User Login (Web)
```sequence
Client -> Server: POST /auth/email/code {email}
Server -> Email: Send 6-digit code
Server -> Client: {success: true}
Client -> Server: POST /auth/email/verify {email, code}
Server -> Client: Set cookies & redirect to app
Server -> Client: Auto-refresh via middleware
```

### Token Refresh (Mobile)
```sequence
Client -> Server: POST /auth/refresh {refreshToken}
Server -> Client: {userId, accessToken, refreshToken}
```