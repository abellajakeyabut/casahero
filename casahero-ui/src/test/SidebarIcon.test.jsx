import { render } from '@testing-library/react';
import SidebarIcon from '../shared/sidebar/SidebarIcon';

const NAMES = [
  'listings',
  'properties',
  'leases',
  'rent',
  'maintenance',
  'messages',
  'home',
  'search',
  'documents',
];

describe('SidebarIcon', () => {
  it.each(NAMES)('draws the %s icon', (name) => {
    const { container } = render(<SidebarIcon name={name} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '20');
  });

  it('uses a custom size', () => {
    const { container } = render(<SidebarIcon name="home" size={32} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '32');
  });

  it('renders nothing for an unknown icon', () => {
    const { container } = render(<SidebarIcon name="nope" />);
    expect(container).toBeEmptyDOMElement();
  });
});
