'use client';

import { Button } from '../button/button.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from './tooltip.js';

function TooltipShortcut() {
  return (
    <Tooltip content="Save your current changes">
      <Button>Save draft</Button>
    </Tooltip>
  );
}

function TooltipSharedProvider() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="sp-cluster">
        <Tooltip noProvider content="Browse previous versions" side="bottom">
          <Button>History</Button>
        </Tooltip>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <Button>Settings</Button>
          </TooltipTrigger>
          <TooltipContent side="right">Edit workspace settings</TooltipContent>
        </TooltipRoot>
      </div>
    </TooltipProvider>
  );
}

export const examples = [
  { name: 'shortcut', render: TooltipShortcut },
  { name: 'shared-provider', render: TooltipSharedProvider },
] as const;
