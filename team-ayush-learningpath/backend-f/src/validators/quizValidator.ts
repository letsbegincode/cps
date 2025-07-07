import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const submitQuizRules = () => [
    // Ensure 'score' is a number between 0 and 100
    body('score')
        .isNumeric()
        .withMessage('Score must be a number.')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Score must be between 0 and 100.'),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors: object[] = [];
    errors.array().map(err => extractedErrors.push({ [(err as any).path]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
};