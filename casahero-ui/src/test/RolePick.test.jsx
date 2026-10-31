import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './utils';
import RolePick from '../features/authentication/RolePick';

describe('RolePick (controlled)', () => {
  it('checks the role from value', () => {
    renderWithProviders(<RolePick value="landlord" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Landlord')).toBeChecked();
    expect(screen.getByLabelText('Tenant')).not.toBeChecked();
  });

  it('calls onChange with the picked role', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<RolePick value="tenant" onChange={onChange} />);
    await user.click(screen.getByText('Landlord'));
    expect(onChange).toHaveBeenCalledWith('landlord');
  });

  it('can switch back to tenant', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<RolePick value="landlord" onChange={onChange} />);
    await user.click(screen.getByText('Tenant'));
    expect(onChange).toHaveBeenCalledWith('tenant');
  });
});

describe('RolePick (uncontrolled)', () => {
  it('reads the role from the user context', () => {
    renderWithProviders(<RolePick />, { userContext: { default_role: 'tenant' } });
    expect(screen.getByLabelText('Tenant')).toBeChecked();
  });

  it('writes the picked role into the user context', async () => {
    const { user, updateUserContext } = renderWithProviders(<RolePick />, {
      userContext: { default_role: 'tenant', username: 'jake' },
    });
    await user.click(screen.getByText('Landlord'));
    expect(updateUserContext).toHaveBeenCalledWith({ default_role: 'landlord', username: 'jake' });
    expect(screen.getByLabelText('Landlord')).toBeChecked();
  });
});
