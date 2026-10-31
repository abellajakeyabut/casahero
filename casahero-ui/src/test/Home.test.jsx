import { render, screen } from '@testing-library/react';
import Home from '../features/dashboard/Home';

describe('Home', () => {
  it('shows the placeholder', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Home Coming soon.')).toBeInTheDocument();
  });
});
