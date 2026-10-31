import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Logo from '../components/Logo.tsx';
import { DOTS } from '../components/logoPaths.ts';

describe('Logo', () => {
  it('draws the rain as white round dots above the word', () => {
    const { container } = render(<Logo size={40} />);
    const dots = container.querySelectorAll('.rainDashes circle');
    expect(dots.length).toBe(DOTS.length);
    expect(container.querySelectorAll('rect').length).toBe(0);
    for (const d of dots) expect(d.parentElement.getAttribute('fill')).toBe('#ffffff');
  });

  it('keeps the word in the text color, not white', () => {
    const { container } = render(<Logo size={40} />);
    const word = container.querySelector('svg > path');
    expect(word).toBeTruthy();
    expect(container.querySelector('svg').getAttribute('fill')).toBe('currentColor');
  });
});
