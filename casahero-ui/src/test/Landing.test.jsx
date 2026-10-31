import { screen } from '@testing-library/react';
import { renderWithProviders, makeUser } from './utils';
import Landing from '../features/landing/Landing';

describe('Landing', () => {
  it('shows the search bar and the landlord sign-up link to guests', () => {
    renderWithProviders(<Landing />);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Own a property?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up as a landlord' })).toHaveAttribute(
      'href',
      '/signup?role=landlord',
    );
  });

  it('hides the landlord call-to-action for logged-in users', () => {
    renderWithProviders(<Landing />, { userContext: makeUser() });
    expect(screen.queryByText('Own a property?')).not.toBeInTheDocument();
  });

  it('goes to /search with the chosen filters', async () => {
    const { user } = renderWithProviders(<Landing />);
    await user.click(await screen.findByLabelText('Condo'));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/search?type=Condo');
  });
});
