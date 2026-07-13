import { notifications } from '@mantine/notifications';

export const showNotification = (message: string, color: 'green' | 'red') => {
  notifications.show({
    message,
    color,
    style: { minHeight: '60px' },
  });
};
