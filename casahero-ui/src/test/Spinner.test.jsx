import { render, screen } from '@testing-library/react';
import Spinner from '../shared/Spinner';

describe('Spinner', () => {
  it('renders nothing when hidden', () => {
    render(<Spinner show={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the default message', () => {
    render(<Spinner show />);
    expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('shows a custom message in a portal on document.body', () => {
    const { container } = render(<Spinner show message="Logging in.." />);
    expect(screen.getByText('Logging in..')).toBeInTheDocument();
    // rendered into body, not inside the component's own container
    expect(container).toBeEmptyDOMElement();
  });
});
