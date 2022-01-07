import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const pElement = screen.getByText(/Static site generator/i);
  expect(pElement).toBeInTheDocument();
});
