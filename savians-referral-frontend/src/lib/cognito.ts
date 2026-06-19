/**
 * AWS Cognito Authentication Library
 * 
 * Handles all Cognito operations: login, logout, token management, password changes
 */

import {
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

// Cognito Pool Configuration
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

// ============================================
// AUTHENTICATION
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Sign in with email and password
 */
export function signIn(credentials: LoginCredentials): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: credentials.email,
      Password: credentials.password,
    });

    const cognitoUser = new CognitoUser({
      Username: credentials.email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          expiresIn: session.getIdToken().getExpiration(),
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes) => {
        // This should not happen with the current signup flow
        reject(new Error('Password change required'));
      },
    });
  });
}

/**
 * Sign out current user
 */
export function signOut(): Promise<void> {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    resolve();
  });
}

/**
 * Get current authenticated user's session
 */
export function getCurrentSession(): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('No session found'));
        return;
      }

      if (!session.isValid()) {
        reject(new Error('Session is not valid'));
        return;
      }

      resolve(session);
    });
  });
}

/**
 * Get current user's ID token (JWT)
 */
export async function getIdToken(): Promise<string> {
  const session = await getCurrentSession();
  return session.getIdToken().getJwtToken();
}

/**
 * Get current user's access token
 */
export async function getAccessToken(): Promise<string> {
  const session = await getCurrentSession();
  return session.getAccessToken().getJwtToken();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentSession();
    return true;
  } catch {
    return false;
  }
}

/**
 * Refresh the current session
 */
export function refreshSession(): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('No session found'));
        return;
      }

      const refreshToken = session.getRefreshToken();
      cognitoUser.refreshSession(refreshToken, (refreshErr, newSession) => {
        if (refreshErr) {
          reject(refreshErr);
          return;
        }
        resolve(newSession);
      });
    });
  });
}

// ============================================
// USER REGISTRATION
// ============================================

export interface SignUpAttributes {
  email: string;
  name: string;
  phone?: string;
}

/**
 * Sign up a new user (called by backend, not directly used in frontend)
 * Frontend uses backend API: POST /api/auth/signup
 */
export function signUp(
  email: string,
  password: string,
  attributes: SignUpAttributes
): Promise<CognitoUser> {
  return new Promise((resolve, reject) => {
    const attributeList: CognitoUserAttribute[] = [
      new CognitoUserAttribute({ Name: 'email', Value: attributes.email }),
      new CognitoUserAttribute({ Name: 'name', Value: attributes.name }),
    ];

    if (attributes.phone) {
      attributeList.push(
        new CognitoUserAttribute({ Name: 'phone_number', Value: attributes.phone })
      );
    }

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result) {
        reject(new Error('Sign up failed'));
        return;
      }
      resolve(result.user);
    });
  });
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * Change password for authenticated user
 */
export function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((sessionErr: Error | null, session: CognitoUserSession | null) => {
      if (sessionErr || !session) {
        reject(sessionErr || new Error('No session'));
        return;
      }

      cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

/**
 * Initiate forgot password flow
 */
export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Confirm forgot password with code
 */
export function confirmPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

// ============================================
// USER ATTRIBUTES
// ============================================

/**
 * Get current user's attributes
 */
export function getUserAttributes(): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((sessionErr: Error | null, session: CognitoUserSession | null) => {
      if (sessionErr || !session) {
        reject(sessionErr || new Error('No session'));
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        if (!attributes) {
          reject(new Error('No attributes found'));
          return;
        }

        const attributeMap: Record<string, string> = {};
        attributes.forEach((attr) => {
          attributeMap[attr.Name] = attr.Value;
        });

        resolve(attributeMap);
      });
    });
  });
}

// ============================================
// TOKEN UTILITIES
// ============================================

/**
 * Decode JWT payload (without verification)
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Get user role from ID token
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const idToken = await getIdToken();
    const payload = decodeToken(idToken);
    
    // Cognito stores groups in "cognito:groups" claim
    const groups = payload['cognito:groups'];
    if (Array.isArray(groups) && groups.length > 0) {
      return groups[0]; // Return first group as role
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}
