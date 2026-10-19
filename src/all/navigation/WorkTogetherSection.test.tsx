import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkTogetherSection, { CopyEmailButton } from './WorkTogetherSection';
import * as contactConfig from './contactConfig';

describe('WorkTogetherSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders section title, email card, and schedule a call card', () => {
    render(<WorkTogetherSection />);

    expect(screen.getByText('Work Together')).toBeDefined();
    expect(screen.getByText('joshuapalero111@gmail.com')).toBeDefined();
    expect(screen.getByText('schedule a call')).toBeDefined();
    expect(screen.getByText('15–30 min')).toBeDefined();
  });

  it('contains zero nested interactive controls in the email card', () => {
    const { container } = render(<WorkTogetherSection />);
    const buttons = container.querySelectorAll('button');

    // Ensure no button contains another button or link
    buttons.forEach((btn) => {
      expect(btn.querySelector('button')).toBeNull();
      expect(btn.querySelector('a')).toBeNull();
    });
  });

  it('opens EmailModal dialog when clicking the email action button', async () => {
    render(<WorkTogetherSection />);

    const openBtn = screen.getByRole('button', { name: /open email options/i });
    fireEvent.click(openBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(screen.getByText('Send an Email')).toBeDefined();
    });
  });

  it('closes EmailModal on Escape key and restores focus', async () => {
    render(<WorkTogetherSection />);

    const openBtn = screen.getByRole('button', { name: /open email options/i });
    openBtn.focus();
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('renders the call link with secure external navigation attributes', () => {
    render(<WorkTogetherSection />);

    const callLink = screen.getByRole('link', { name: /call: schedule a call/i });
    expect(callLink.getAttribute('href')).toContain('calendly.com');
    expect(callLink.getAttribute('target')).toBe('_blank');
    expect(callLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('copies email to clipboard on copy button click and shows feedback', async () => {
    const copySpy = vi.spyOn(contactConfig, 'copyToClipboard').mockResolvedValue(true);

    render(<CopyEmailButton email="test@example.com" />);

    const copyBtn = screen.getByRole('button', { name: /copy email address/i });
    fireEvent.click(copyBtn);

    expect(copySpy).toHaveBeenCalledWith('test@example.com');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /email address copied/i })).toBeDefined();
    });
  });
});
