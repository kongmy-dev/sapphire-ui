import { Slot as RadixSlot } from '@radix-ui/react-slot';
import type { ComponentType, HTMLAttributes, ReactNode, Ref } from 'react';
import { Slot as LibSlot } from '../slot.js';

type SlotProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement> | undefined;
  children?: ReactNode;
};
export type SlotComponent = ComponentType<SlotProps>;
export type Implementation = {
  readonly name: 'radix' | 'lib';
  readonly Slot: SlotComponent;
};

export const implementations: readonly Implementation[] = [
  { name: 'radix', Slot: RadixSlot },
  { name: 'lib', Slot: LibSlot },
];
