import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import DataPage from '../DataPage';
import ExtendedPage from '../ExtendedPage';
import FeedbackPage from '../FeedbackPage';
import FormsPage from '../FormsPage';
import InteractivePage from '../InteractivePage';
import LayoutsPage from '../LayoutsPage';
import OverviewPage from '../OverviewPage';

describe('Pages Integration', () => {
  it('renders InteractivePage without crashing', () => {
    render(<InteractivePage />);
  });

  it('renders ExtendedPage without crashing', () => {
    render(<ExtendedPage />);
  });

  it('renders OverviewPage without crashing', () => {
    render(<OverviewPage />);
  });

  it('renders FormsPage without crashing', () => {
    render(<FormsPage />);
  });

  it('renders FeedbackPage without crashing', () => {
    render(<FeedbackPage />);
  });

  it('renders DataPage without crashing', () => {
    render(<DataPage />);
  });

  it('renders LayoutsPage without crashing', () => {
    render(<LayoutsPage />);
  });
});
