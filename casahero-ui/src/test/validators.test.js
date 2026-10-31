import {
    validateConfirm,
    validateEmail,
    validateName,
    validatePassword,
    validateForm,
    MIN_PASSWORD_LENGTH,
} from "../shared/validators";

describe('validateEmail',()=>{
    it('requires a value',()=>{
        expect(validateEmail(' ')).toBe('Email is required.');
        expect(validateEmail('')).toBe('Email is required.');
        expect(validateEmail(undefined)).toBe('Email is required.');
    })
    it('rejects malformed emails',()=>{
       expect(validateEmail('jake@')).toBe('Enter a valid email address.');
       expect(validateEmail('jake@gmail')).toBe('Enter a valid email address.');
    })
    it('accepts valid email',()=>{
       expect(validateEmail('jake@gmail.com')).toBe('');
       expect(validateEmail('  jake@gmail.com  ')).toBe('');
    })
})

describe('validateName',()=>{
    it('requires a value',()=>{
        expect(validateName('')).toBe('Name is required.');
        expect(validateName('   ')).toBe('Name is required.');
        expect(validateName(undefined)).toBe('Name is required.');
    })
    it('accepts a name',()=>{
        expect(validateName('Jake')).toBe('');
    })
})

describe('validatePassword',()=>{
    it('requires a value',()=>{
        expect(validatePassword('')).toBe('Password is required.');
    })
    it('rejects short passwords',()=>{
        expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        );
    })
    it('accepts a long enough password',()=>{
        expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBe('');
    })
})

describe('validateConfirm',()=>{
    it('requires the confirmation',()=>{
        expect(validateConfirm('secret123','')).toBe('Please confirm your password.');
    })
    it('rejects a mismatch',()=>{
        expect(validateConfirm('secret123','secret124')).toBe('Passwords do not match.');
    })
    it('accepts a match',()=>{
        expect(validateConfirm('secret123','secret123')).toBe('');
    })
})

describe('validateForm',()=>{
    const rules = {
        name: validateName,
        email: validateEmail,
        confirm: (value, values) => validateConfirm(values.password, value),
    };
    it('returns only the failing fields',()=>{
        expect(validateForm({ name: 'Jake', email: 'bad', password: 'x', confirm: 'y' }, rules)).toEqual({
            email: 'Enter a valid email address.',
            confirm: 'Passwords do not match.',
        });
    })
    it('returns an empty object when everything passes',()=>{
        expect(validateForm({ name: 'Jake', email: 'jake@gmail.com', password: 'x', confirm: 'x' }, rules)).toEqual({});
    })
})
