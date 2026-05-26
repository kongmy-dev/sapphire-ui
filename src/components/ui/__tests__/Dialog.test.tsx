import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from '../Dialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog 
        open={false} 
        onOpenChange={() => {}} 
        title="Delete?" 
        message="Are you sure?" 
        onConfirm={() => {}} 
      />
    );
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog 
        open={true} 
        onOpenChange={() => {}} 
        title="Delete?" 
        message="Are you sure?" 
        onConfirm={() => {}} 
      />
    );
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        title="Delete?" 
        message="Are you sure?" 
        onConfirm={onConfirm} 
        confirmLabel="Yes"
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    
    expect(onConfirm).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog 
        open={true} 
        onOpenChange={onOpenChange} 
        title="Delete?" 
        message="Are you sure?" 
        onConfirm={() => {}} 
        onCancel={onCancel}
        cancelLabel="No"
      />
    );
    
    await userEvent.click(screen.getByRole('button', { name: 'No' }));
    
    expect(onCancel).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
