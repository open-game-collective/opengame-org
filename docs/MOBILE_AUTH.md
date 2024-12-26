# Mobile App Authentication Guide

This document describes how to implement authentication in your mobile app against our authentication API.

## Overview

The authentication system uses:
- Anonymous user creation with optional email verification
- JWT tokens for session management:
  - Session tokens (15 min lifetime)
  - Refresh tokens (7 day lifetime)

## Authentication Flow

### 1. Initial User Creation

Create a new anonymous user:
```http
POST /auth/user
```

Response:
```json
{
  "userId": "user-uuid",
  "sessionToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### 2. Email Verification (Optional)

1. Request email verification code:
```http
POST /auth/email/code
Authorization: Bearer <session-token>
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

2. Verify code to link email:
```http
POST /auth/email/verify
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

Response:
```json
{
  "success": true
}
```

### 3. Token Management

Store both tokens securely (e.g., in Keychain for iOS or EncryptedSharedPreferences for Android).

The session token should be included in all API requests:
```http
GET /api/some-endpoint
Authorization: Bearer <session-token>
```

When the session token expires (HTTP 401), use the refresh token to get new tokens:
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

Response:
```json
{
  "userId": "user-uuid",
  "sessionToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

### 4. Actor-Specific Tokens

For certain features, you'll need to get actor-specific tokens:

```http
POST /auth/access-token
Authorization: Bearer <session-token>
Content-Type: application/json

{
  "actorType": "user",
  "actorId": "user-uuid"
}
```

Response:
```json
{
  "accessToken": "actor-specific-token"
}
```

## Implementation Guidelines

1. **Token Storage**
   - Store tokens securely using platform-specific secure storage
   - Never store in plain text or UserDefaults/SharedPreferences

2. **Token Refresh Strategy**
   - Implement preemptive token refresh before expiration
   - Handle 401 responses by attempting token refresh
   - Clear tokens and redirect to login on refresh failure

3. **Request Handling**
   - Create an HTTP client wrapper that:
     - Automatically adds Authorization headers
     - Handles token refresh
     - Retries failed requests after refresh

4. **Error Handling**
   - 400: Invalid request format
   - 401: Authentication required or token invalid
   - 403: Permission denied
   - 500: Server error

## Example Implementation (Swift)

```swift
class AuthManager {
    static let shared = AuthManager()
    
    private var sessionToken: String?
    private var refreshToken: String?
    
    func login(email: String, code: String) async throws -> User {
        let response = try await post("/auth/email/verify", body: [
            "email": email,
            "code": code
        ])
        
        self.sessionToken = response.sessionToken
        self.refreshToken = response.refreshToken
        
        return response.user
    }
    
    func refreshTokens() async throws {
        guard let refreshToken = self.refreshToken else {
            throw AuthError.noRefreshToken
        }
        
        let response = try await post("/auth/refresh", body: [
            "refreshToken": refreshToken
        ])
        
        self.sessionToken = response.sessionToken
        self.refreshToken = response.refreshToken
    }
}

class APIClient {
    func authenticatedRequest(_ request: URLRequest) async throws -> Data {
        var req = request
        
        if let token = AuthManager.shared.sessionToken {
            req.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await URLSession.shared.data(for: req)
        
        if (response as? HTTPURLResponse)?.statusCode == 401 {
            try await AuthManager.shared.refreshTokens()
            return try await authenticatedRequest(request)
        }
        
        return data
    }
}
```

## Example Implementation (Kotlin)

```kotlin
class AuthManager {
    private var sessionToken: String? = null
    private var refreshToken: String? = null
    
    suspend fun login(email: String, code: String): User {
        val response = api.post("/auth/email/verify", mapOf(
            "email" to email,
            "code" to code
        ))
        
        sessionToken = response.sessionToken
        refreshToken = response.refreshToken
        
        return response.user
    }
    
    suspend fun refreshTokens() {
        val refreshToken = this.refreshToken ?: throw AuthException("No refresh token")
        
        val response = api.post("/auth/refresh", mapOf(
            "refreshToken" to refreshToken
        ))
        
        sessionToken = response.sessionToken
        this.refreshToken = response.refreshToken
    }
}

class APIClient {
    suspend fun <T> authenticatedRequest(request: suspend () -> T): T {
        try {
            return request()
        } catch (e: UnauthorizedException) {
            AuthManager.refreshTokens()
            return request()
        }
    }
}
```

## Security Considerations

1. Always use HTTPS for all API requests
2. Store tokens in secure storage only
3. Clear tokens on logout
4. Implement certificate pinning
5. Add request signing for sensitive operations
6. Handle clock skew for token expiration

## Support

For questions or issues:
- Create a GitHub issue
- Contact the backend team
- Check API documentation for updates 