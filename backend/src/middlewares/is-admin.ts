import jwt from 'jsonwebtoken'
import { errorHandler } from '~/utils/error.ts'
import { Request, Response, NextFunction } from 'express'
import User from '../models/User.model.ts'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return next(errorHandler(401, 'Not authenticated!'))
  }

  const token = authHeader.split(' ')[1]
  let decodedToken
  try {
    if (!token) {
      return next(errorHandler(401, 'Not authenticated!'))
    } else {
      decodedToken = jwt.verify(token.toString(), process.env.JWT_SECRET as string) as { userId: string; email: string }
    }
  } catch (err) {
    next(errorHandler(500, 'An error occurred! Try again later!'))
  }
  if (!decodedToken) {
    return next(errorHandler(401, 'Not authenticated!'))
  }

  const user = await User.findById(decodedToken.userId)

  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}