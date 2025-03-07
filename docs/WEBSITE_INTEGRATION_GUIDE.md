# One-Time Token Authentication Integration Guide

This document describes how to integrate with our authentication service to enable cross-app authentication using one-time tokens.

## Overview

Our authentication service provides one-time tokens that can be used to securely transfer user authentication between different applications. The tokens:
- Expire after 30 seconds
- Can only be used once
- Contain the user's ID
- Are signed with your app's JWT secret

## API Endpoint

### Request One-Time Token

```http
POST https://api.opengame.org/auth/one-time-token
Authorization: Bearer <session_token>
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Error Responses:
```json
// 401 - Missing Authorization Header
{
  "error": "Missing authorization header"
}

// 401 - Invalid Session Token
{
  "error": "Invalid session token"
}
```

## Integration Steps

1. **Request Configuration**
   - Contact support to get your JWT secret
   - Add the JWT secret to your app's environment variables
   - Configure your app's allowed domains/origins

2. **Generate Token**
```typescript
async function getOneTimeToken(sessionToken: string): Promise<string> {
  const response = await fetch('https://api.opengame.org/auth/one-time-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get one-time token');
  }

  const { token } = await response.json();
  return token;
}
```

3. **Verify Token in Your App**
```typescript
import { jwtVerify } from "jose";

interface VerifiedToken {
  userId: string;
}

async function verifyOneTimeToken(token: string): Promise<VerifiedToken> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // Check token type
    if (verified.payload.aud !== "ONE_TIME") {
      throw new Error("Invalid token type");
    }

    return {
      userId: verified.payload.userId as string
    };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
```

## Example Use Cases

### 1. Deep Linking Between Apps

```typescript
// App A: Share auth with App B
async function shareAuthWithAppB() {
  const token = await getOneTimeToken(currentSessionToken);
  const url = `appb://auth?token=${token}`;
  Linking.openURL(url);
}

// App B: Handle incoming auth
async function handleIncomingAuth(url: string) {
  const token = new URL(url).searchParams.get('token');
  if (!token) return;

  try {
    const { userId } = await verifyOneTimeToken(token);
    await loginUser(userId);
  } catch (error) {
    showError('Invalid or expired token');
  }
}
```

### 2. QR Code Login

```typescript
// Web: Generate QR code
async function generateAuthQR() {
  const token = await getOneTimeToken(sessionToken);
  return generateQRCode(`myapp://auth?token=${token}`);
}

// Mobile: Scan QR code
async function handleScannedQR(qrData: string) {
  const url = new URL(qrData);
  const token = url.searchParams.get('token');
  
  if (!token) return;
  
  try {
    const { userId } = await verifyOneTimeToken(token);
    await loginUser(userId);
  } catch (error) {
    showError('Invalid or expired QR code');
  }
}
```

## Security Requirements

1. **Token Handling**
   - Never store tokens
   - Use immediately upon receipt
   - Clear from memory after use
   - Implement proper error handling

2. **Transport Security**
   - Always use HTTPS
   - Validate SSL certificates
   - Don't send tokens in URL query parameters (except for deep links)

3. **Error Handling**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Don't expose token details in errors
   - Log errors for debugging

## Getting Started

1. Contact support@opengame.org to:
   - Get your JWT secret
   - Register your app's domains/origins
   - Set up monitoring and alerts

2. Implement token verification in your app

3. Test thoroughly with our staging environment

4. Deploy to production

## Support

For integration support:
- Email: integration-support@opengame.org
- API Status: status.opengame.org
- Documentation: docs.opengame.org/auth

## Version History

| Version | Changes                                  |
|---------|------------------------------------------|
| 1.0.0   | Initial one-time token implementation    | 