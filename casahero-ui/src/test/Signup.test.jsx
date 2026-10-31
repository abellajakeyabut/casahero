import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils';
import Signup from '../features/signup/Signup';

const setup = (route = '/signup', options) => renderWithProviders(<Signup />, { route, ...options });

const fill = async (user, { name, email, password, confirm }) => {
  if (name) await user.type(screen.getByPlaceholderText('Name'), name);
  if (email) await user.type(screen.getByPlaceholderText('Email'), email);
  if (password) await user.type(screen.getByPlaceholderText('Password'), password);
  if (confirm) await user.type(screen.getByPlaceholderText('Confirm Password'), confirm);
};

describe('Signup', () => {
  it('defaults to the tenant role and previews its theme', () => {
    setup();
    expect(screen.getByLabelText('Tenant')).toBeChecked();
    expect(document.documentElement.dataset.role).toBe('tenant');
  });

  it('preselects the landlord role from ?role=landlord', () => {
    setup('/signup?role=landlord', { userContext: { default_role: 'tenant' } });
    expect(screen.getByLabelText('Landlord')).toBeChecked();
    expect(document.documentElement.dataset.role).toBe('landlord');
  });

  it('uses the role from the user context when the param is unknown', () => {
    setup('/signup?role=admin', { userContext: { default_role: 'landlord' } });
    expect(screen.getByLabelText('Landlord')).toBeChecked();
  });

  it('switches the theme when another role is picked', async () => {
    const { user } = setup();
    await user.click(screen.getByText('Landlord'));
    expect(document.documentElement.dataset.role).toBe('landlord');
  });

  it('puts the previous theme back when it unmounts', () => {
    document.documentElement.dataset.role = 'landlord';
    const { unmount } = setup();
    expect(document.documentElement.dataset.role).toBe('tenant');
    unmount();
    expect(document.documentElement.dataset.role).toBe('landlord');
  });

  it('removes the theme on unmount when there was none before', () => {
    const { unmount } = setup();
    unmount();
    expect(document.documentElement.dataset.role).toBeUndefined();
  });

  it('lists every error when the empty form is submitted', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Name is required.');
    expect(alert).toHaveTextContent('Email is required.');
    expect(alert).toHaveTextContent('Password is required.');
    expect(alert).toHaveTextContent('Please confirm your password.');
    expect(screen.getByPlaceholderText('Name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates a field when it loses focus', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText('Email'), 'jake@');
    await user.tab();
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.');

    await user.type(screen.getByPlaceholderText('Email'), 'gmail.com');
    await user.tab();
    // clicking back into Email blurred Password, so only its error is left
    expect(screen.getByRole('alert')).not.toHaveTextContent('Enter a valid email address.');
    expect(screen.getByRole('alert')).toHaveTextContent('Password is required.');
  });

  it('validates name, password and confirmation on blur', async () => {
    const { user } = setup();
    await user.click(screen.getByPlaceholderText('Name'));
    await user.tab();
    await fill(user, { password: 'short', confirm: 'other' });
    await user.tab();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Name is required.');
    expect(alert).toHaveTextContent('Password must be at least 8 characters.');
    expect(alert).toHaveTextContent('Passwords do not match.');
  });

  it('shows the success modal after signing up', async () => {
    const { user } = setup();
    await fill(user, {
      name: 'New Tenant',
      email: `tenant.${Date.now()}@example.com`,
      password: 'password123',
      confirm: 'password123',
    });
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Registration Successful...');
  });

  it('does not show the modal when the email is taken', async () => {
    const { user } = setup();
    await fill(user, {
      name: 'Jake',
      email: 'jake@gmail.com',
      password: 'password123',
      confirm: 'password123',
    });
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));
    // wait for the request to finish: the buttons stay enabled because loading never turns on
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
