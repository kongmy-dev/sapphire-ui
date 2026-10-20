import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/button/button.js';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/popover/popover.js';
import { cn } from '../classes.js';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command/command.js';
export type ComboboxOption = {
  value: string;
  label: string;
};
export type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};
function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ms-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(next) => {
                    onValueChange?.(next === value ? '' : next);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'me-2 size-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };
