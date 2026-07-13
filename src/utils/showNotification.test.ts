import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showNotification } from './showNotification';

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { notifications } from '@mantine/notifications';

describe('showNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows success notification with green color', () => {
    const message = 'Schema saved successfully';

    showNotification(message, 'green');

    expect(notifications.show).toHaveBeenCalledWith({
      message,
      color: 'green',
      style: { minHeight: '60px' },
    });
  });

  it('shows error notification with red color', () => {
    const message = 'Failed to save schema';

    showNotification(message, 'red');

    expect(notifications.show).toHaveBeenCalledWith({
      message,
      color: 'red',
      style: { minHeight: '60px' },
    });
  });

  it('shows notification with correct message', () => {
    const message = 'Custom message';

    showNotification(message, 'green');

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom message',
      })
    );
  });

  it('shows notification with correct style', () => {
    const message = 'Test message';

    showNotification(message, 'green');

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        style: { minHeight: '60px' },
      })
    );
  });

  it('calls notifications.show exactly once', () => {
    const message = 'Test message';

    showNotification(message, 'green');

    expect(notifications.show).toHaveBeenCalledTimes(1);
  });

  it('handles empty message', () => {
    const message = '';

    showNotification(message, 'red');

    expect(notifications.show).toHaveBeenCalledWith({
      message: '',
      color: 'red',
      style: { minHeight: '60px' },
    });
  });

  it('handles message with special characters', () => {
    const message = 'Error: Schema is invalid! 🚨';

    showNotification(message, 'red');

    expect(notifications.show).toHaveBeenCalledWith({
      message,
      color: 'red',
      style: { minHeight: '60px' },
    });
  });
});
