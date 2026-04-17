import { Response } from 'express';
import { loginUser, registerUser } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const result = await loginUser(email, password);
    return res.json(result);
  } catch (error: any) {
    return res.status(401).json({
      error: error.message,
    });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, oabNumber, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required',
      });
    }

    const result = await registerUser(name, email, password, oabNumber, role || 'assistant');
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { User } = await import('../models');
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'email', 'role', 'oabNumber'],
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
