import jwt from 'jsonwebtoken';
import { User } from '../models';

export const generateToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await user.validatePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      oabNumber: user.oabNumber,
    },
  };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  oabNumber: string,
  role: 'admin' | 'lawyer' | 'assistant' = 'assistant'
) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    oabNumber,
    role,
  });

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      oabNumber: user.oabNumber,
    },
  };
};
