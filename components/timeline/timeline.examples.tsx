import {
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
} from './timeline.js';

function TimelineHistory() {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineIndicator />
        <TimelineContent>
          <h3>Project started</h3>
          <time dateTime="2026-10-01">1 October 2026</time>
          <a href="#kickoff">Read kickoff notes</a>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineIndicator isLast />
        <TimelineContent>
          <h3>Design approved</h3>
          <p>Ready for implementation.</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}

function TimelineHorizontal() {
  return (
    <Timeline orientation="horizontal">
      <TimelineItem>
        <TimelineIndicator>1</TimelineIndicator>
        <TimelineContent>
          <h3>Discovery</h3>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineIndicator isLast>2</TimelineIndicator>
        <TimelineContent>
          <h3>Delivery</h3>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}

export const examples = [
  { name: 'history', render: TimelineHistory },
  { name: 'horizontal', render: TimelineHorizontal },
] as const;
