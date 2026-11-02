import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Logo from '../components/Logo.tsx';

describe('Logo', () => {
  it('draws the white circle mark with three rain lines, then the word', () => {
    const { container } = render(<Logo size={22} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
    expect(svgs[0].querySelector('circle').getAttribute('fill')).toBe('#ffffff');
    expect(svgs[0].querySelectorAll('line').length).toBe(3);
    expect(svgs[1].querySelectorAll('path').length).toBe(1);
  });

  it('labels the logo for screen readers and keeps the word in the text color', () => {
    const { container } = render(<Logo size={22} label="rain" />);
    expect(container.querySelector('[role="img"]').getAttribute('aria-label')).toBe('rain');
    expect(container.querySelectorAll('svg')[1].getAttribute('fill')).toBe('currentColor');
  });
});
