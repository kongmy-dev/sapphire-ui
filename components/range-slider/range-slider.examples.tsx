'use client';

import { useState } from 'react';
import { Card } from '../card/card.js';
import { RangeSlider, Slider } from './range-slider.js';

function SliderStates() {
  return (
    <div className="sp-stack">
      <Slider
        variant="light"
        defaultValue={[50]}
        aria-label="Volume"
        showValue
      />
      <Slider
        variant="light"
        defaultValue={[30]}
        aria-label="Unavailable volume"
        disabled
        showValue
      />
      <Card variant="dark">
        <Slider defaultValue={[40]} aria-label="Brightness" />
      </Card>
    </div>
  );
}

function SliderControlled() {
  const [value, setValue] = useState([20, 80]);
  return (
    <RangeSlider
      variant="light"
      value={value}
      onValueChange={setValue}
      aria-label={['Minimum price', 'Maximum price']}
      min={0}
      max={100}
      step={5}
      minStepsBetweenThumbs={1}
      showValue
    />
  );
}

export const examples = [
  { name: 'states', render: SliderStates },
  { name: 'controlled', render: SliderControlled },
] as const;
