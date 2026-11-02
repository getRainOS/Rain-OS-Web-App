import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Logo from '../components/Logo.tsx';

describe('Logo', () => {
  it('draws the plain wordmark as one path', () => {
    const { container } = render(<Logo size={20} />);
    expect(container.querySelectorAll('svg > path').length).toBe(1);
    expect(container.querySelectorAll('line, circle, rect').length).toBe(0);
  });

  it('keeps the word in the text color, not white', () => {
    const { container } = render(<Logo size={20} />);
    expect(container.querySelector('svg').getAttribute('fill')).toBe('currentColor');
  });
});
