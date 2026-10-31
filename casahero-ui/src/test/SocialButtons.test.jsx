import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SocialButtons from '../shared/SocialButtons';

describe('SocialButtons', () => {
  it('shows a button for each provider', () => {
    render(<SocialButtons />);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeInTheDocument();
  });

  it('calls onSelect with the provider id', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SocialButtons onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /google/i }));
    await user.click(screen.getByRole('button', { name: /facebook/i }));
    expect(onSelect).toHaveBeenNthCalledWith(1, 'google');
    expect(onSelect).toHaveBeenNthCalledWith(2, 'facebook');
  });

  it('does not crash without onSelect', async () => {
    const user = userEvent.setup();
    render(<SocialButtons />);
    await user.click(screen.getByRole('button', { name: /google/i }));
  });

  it('disables the buttons', () => {
    render(<SocialButtons disabled />);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });
});
