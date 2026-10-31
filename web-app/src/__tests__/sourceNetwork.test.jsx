import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SourceNetwork from '../components/marketing/SourceNetwork.tsx';

// jsdom has no canvas; returning null makes the component skip drawing.
HTMLCanvasElement.prototype.getContext = () => null;

describe('SourceNetwork', () => {
  it('renders a decorative canvas that screen readers skip', () => {
    const { container } = render(<SourceNetwork />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not start an animation loop when reduced motion is on', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    window.matchMedia = vi.fn().mockImplementation(q => ({
      matches: q.includes('reduce'),
      media: q,
      addEventListener() {},
      removeEventListener() {},
    }));
    render(<SourceNetwork />);
    expect(raf).not.toHaveBeenCalled();
    raf.mockRestore();
  });
});
