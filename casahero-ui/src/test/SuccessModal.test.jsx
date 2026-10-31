import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from './utils';
import SuccessModal from '../features/signup/SuccessModal';

describe('SuccessModal', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('counts down from the given seconds', () => {
    renderWithProviders(<SuccessModal seconds={3} />, { route: '/signup' });
    expect(screen.getByRole('dialog')).toHaveTextContent('Registration Successful...');
    expect(screen.getByRole('button')).toHaveTextContent('Login again (3)');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button')).toHaveTextContent('Login again (2)');
  });

  it('goes to /login when the countdown ends', () => {
    renderWithProviders(<SuccessModal />, { route: '/signup' });
    expect(screen.getByRole('button')).toHaveTextContent('(5)');
    for (let i = 0; i < 5; i += 1) act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('goes to /login straight away on click', () => {
    renderWithProviders(<SuccessModal />, { route: '/signup' });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
