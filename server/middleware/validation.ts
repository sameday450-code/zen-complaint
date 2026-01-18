/**
 * Input Validation Middleware
 * Sanitizes and validates user inputs to prevent XSS and injection attacks
 */

import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation result handler
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Login validation rules
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

/**
 * Station creation validation
 */
export const stationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage('Station name must be 2-100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .escape(),
];

/**
 * Complaint submission validation
 */
export const complaintValidation = [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage('Customer name must be 2-100 characters'),
  body('customerPhone')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid phone number is required'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .escape()
    .withMessage('Category is required'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .escape()
    .withMessage('Description must be 10-2000 characters'),
  body('stationId')
    .isUUID()
    .withMessage('Valid station ID is required'),
];

/**
 * Admin registration validation
 */
export const adminValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage('Name must be 2-100 characters'),
];
