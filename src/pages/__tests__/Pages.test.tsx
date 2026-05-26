import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import InteractivePage from '../InteractivePage';
import ExtendedPage from '../ExtendedPage';
import OverviewPage from '../OverviewPage';
import FormsPage from '../FormsPage';
import FeedbackPage from '../FeedbackPage';
import DataPage from '../DataPage';
import LayoutsPage from '../LayoutsPage';

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
