import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Logo from '../components/Logo.tsx';
import { STREAKS } from '../components/logoPaths.ts';

describe('Logo', () => {
  it('draws the rain as white round-ended streaks above the word', () => {
    const { container } = render(<Logo size={40} />);
    const streaks = container.querySelectorAll('.rainDashes line');
    expect(streaks.length).toBe(STREAKS.length);
    expect(container.querySelectorAll('circle').length).toBe(0);
    for (const s of streaks) {
      expect(s.parentElement.getAttribute('stroke')).toBe('#ffffff');
      expect(s.parentElement.getAttribute('stroke-linecap')).toBe('round');
    }
  });

  it('keeps the word in the text color, not white', () => {
    const { container } = render(<Logo size={40} />);
    const word = container.querySelector('svg > path');
    expect(word).toBeTruthy();
    expect(container.querySelector('svg').getAttribute('fill')).toBe('currentColor');
  });
});
