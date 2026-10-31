import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../shared/sidebar/Sidebar';
import { menus } from '../shared/sidebar/menus';

describe('Sidebar', () => {
  it('shows the landlord menu', () => {
    render(<Sidebar role="landlord" activeKey="home" onSelect={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'landlord menu' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(menus.landlord.length);
    expect(screen.getByText('Leases')).toBeInTheDocument();
  });

  it('falls back to the tenant menu without a role', () => {
    render(<Sidebar activeKey="home" onSelect={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'tenant menu' })).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('marks the active item', () => {
    render(<Sidebar role="tenant" activeKey="rent" onSelect={vi.fn()} />);
    const rent = screen.getByRole('button', { name: 'Rent' });
    expect(rent).toHaveAttribute('aria-current', 'page');
    expect(rent).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the item key', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Sidebar role="tenant" activeKey="home" onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Messages' }));
    expect(onSelect).toHaveBeenCalledWith('messages');
  });
});
