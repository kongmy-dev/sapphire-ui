import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
  const colors = {
    color: 'var(--popover-foreground)',
    '--normal-bg': 'var(--popover)',
    '--normal-text': 'var(--popover-foreground)',
    '--normal-border': 'var(--border)',
  };
  return <Sonner className="toaster group" style={colors} {...props} />;
}

export { Toaster };
