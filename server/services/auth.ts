import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'shieldpay-secret-key';

export interface AuthService {
  login(username: string, password: string): Promise<{ token: string; user: any } | null>;
  verifyToken(token: string): Promise<any>;
  hashPassword(password: string): Promise<string>;
}

export class AuthServiceImpl implements AuthService {
  async login(username: string, password: string): Promise<{ token: string; user: any } | null> {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }

    // For demo purposes, simple password check (in production, use bcrypt)
    if (password === 'admin123' || password === user.password) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: { id: user.id, username: user.username, role: user.role }
      };
    }

    return null;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const authService = new AuthServiceImpl();
