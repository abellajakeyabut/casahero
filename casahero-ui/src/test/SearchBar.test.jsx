import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './utils';
import SearchBar from '../features/search/SearchBar';

const regionSelect = () => document.querySelector('#region');
const citySelect = () => document.querySelector('#city');

const setup = (props) => renderWithProviders(<SearchBar onSearch={vi.fn()} {...props} />);

describe('SearchBar', () => {
  it('shows a spinner while the lookups load, then the property types', async () => {
    setup();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(await screen.findByLabelText('Condo')).toBeInTheDocument();
    expect(screen.getByLabelText('HDB')).toBeChecked();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('keeps the city select disabled until a region is chosen', async () => {
    setup();
    await screen.findByRole('option', { name: 'East' });
    expect(citySelect()).toBeDisabled();
  });

  it('submits the chosen filters', async () => {
    const onSearch = vi.fn();
    const { user } = setup({ onSearch });

    await user.click(await screen.findByLabelText('Condo'));
    await user.selectOptions(regionSelect(), 'East');
    await screen.findByRole('option', { name: 'Tampines' });
    await waitFor(() => expect(citySelect()).toBeEnabled());
    await user.selectOptions(citySelect(), 'Tampines');
    await user.click(screen.getByRole('button', { name: 'Increase Beds' }));
    await user.click(screen.getByRole('button', { name: 'Increase Bath' }));
    await user.click(screen.getByRole('button', { name: 'Increase Bath' }));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith({
      type: 'Condo',
      region: 'East',
      city: 'Tampines',
      bed: 1,
      bath: 2,
    });
  });

  it('clears the city when the region changes', async () => {
    const onSearch = vi.fn();
    const { user } = setup({ onSearch, initialFilters: { region: 'East', city: 'Tampines' } });
    await screen.findByRole('option', { name: 'West' });
    await user.selectOptions(regionSelect(), 'West');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ region: 'West', city: '' }));
  });

  it('pre-fills from initialFilters', async () => {
    setup({ initialFilters: { type: 'Landed', region: 'East', city: 'Bedok', bed: 3 } });
    expect(await screen.findByLabelText('Landed')).toBeChecked();
    await waitFor(() => expect(regionSelect()).toHaveValue('East'));
    await waitFor(() => expect(citySelect()).toHaveValue('Bedok'));
    expect(screen.getByText('3+')).toBeInTheDocument();
  });

  it('does not crash without onSearch', async () => {
    const { user } = renderWithProviders(<SearchBar />);
    await user.click(screen.getByRole('button', { name: 'Search' }));
  });
});
