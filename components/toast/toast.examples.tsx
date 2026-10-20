'use client';

import { useRef } from 'react';
import { Button } from '../button/button.js';
import { Toast, type ToastRef, type ToastType } from './toast.js';

function ToastStatuses() {
  const toast = useRef<ToastRef>(null);
  const success: ToastType = 'success';
  return (
    <div className="sp-cluster">
      <Button onClick={() => toast.current?.show('Changes saved', success)}>
        Show success
      </Button>
      <Button
        onClick={() => toast.current?.show('A new update is available', 'info')}
      >
        Show information
      </Button>
      <Button
        onClick={() =>
          toast.current?.show('Your session expires soon', 'warning')
        }
      >
        Show warning
      </Button>
      <Button
        onClick={() => toast.current?.show('Unable to save changes', 'error')}
      >
        Show error
      </Button>
      <Toast ref={toast} />
    </div>
  );
}

function ToastDuration() {
  const toast = useRef<ToastRef>(null);
  return (
    <>
      <Button
        onClick={() =>
          toast.current?.show('Copied to clipboard', 'success', 500)
        }
      >
        Show short notification
      </Button>
      <Toast ref={toast} />
    </>
  );
}

export const examples = [
  { name: 'statuses', render: ToastStatuses },
  { name: 'duration', render: ToastDuration },
] as const;
