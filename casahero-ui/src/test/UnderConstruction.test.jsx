import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils';
import UnderConstruction from '../underconstruction/UnderConstruction';

describe('UnderConstruction', () => {
  it('shows the banner and the coming-soon message', () => {
    renderWithProviders(<UnderConstruction />);
    expect(screen.getByRole('heading', { name: 'Welcome to Casahero' })).toBeInTheDocument();
    expect(screen.getByText(/currently being built/i)).toBeInTheDocument();
    expect(screen.getByText('Welcome, Guest !')).toBeInTheDocument();
  });
});
