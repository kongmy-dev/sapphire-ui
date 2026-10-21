const descriptions: Record<string, string> = {
  accordion:
    'Reveal related sections on demand. Use an accordion for optional details or FAQs when readers benefit from scanning headings before opening content.',
  'admin-layout':
    'Frame an application with a sidebar and a main workspace. Use it for admin tools with persistent navigation across several sections.',
  alert:
    'Place a status message beside the content it affects. Use an alert for validation, success or warnings that should remain visible while the reader acts.',
  analytics:
    'Load consent-aware analytics for a site. Use it when measurement must follow the visitor’s privacy choices rather than start on every page load.',
  avatar:
    'Identify a person with a portrait or initials fallback. Use it beside names in accounts, comments and member lists.',
  'avatar-group':
    'Show several people in a compact overlapping group. Use it for collaborators or participants when individual portraits would take too much space.',
  badge:
    'Attach a short status or category to an item. Use badges for labels such as Draft or Active; keep longer explanations in nearby text.',
  banner:
    'Show a dismissible announcement across a page. Use it for a service update or timely notice that applies beyond one field or card.',
  'bar-chart':
    'Compare magnitudes across named categories. Use bars when readers need to see which values are larger and still read each label and value.',
  breadcrumb:
    'Show the current page’s place in a hierarchy. Use breadcrumbs on nested content so readers can return to a parent section.',
  button:
    'Trigger an action such as saving, submitting or opening a dialog. Use the primary variant for the main action, outline for alternatives and destructive for irreversible changes.',
  callout:
    'Highlight a tip, caution or supporting explanation within a document. Use a callout when readers need context before continuing with the surrounding content.',
  card: 'Group related content and actions on a distinct surface. Use a card for a self-contained item such as a project, summary or feature.',
  checkbox:
    'Select independent options or acknowledge a condition. Use checkboxes when several choices may be selected; use a radio group for one choice.',
  chip: 'Represent a compact selectable filter or removable item. Use chips for active filters or short selections that readers can change in place.',
  'code-block':
    'Present multiline code with preserved whitespace and optional copy feedback. Use it for commands and usage examples that readers need to inspect or reuse.',
  'command-palette':
    'Find and run commands from a searchable keyboard dialog. Use it when an application has many actions that are difficult to reach through navigation alone.',
  container:
    'Constrain and centre a page’s content width. Use it to align sections and preserve a readable measure across large screens.',
  'cookie-banner':
    'Collect and revisit privacy choices for optional cookies. Use it with consent-aware integrations so the visitor’s decision controls what runs.',
  dialog:
    'Focus attention on a task in a modal overlay. Use it for a short form, review or confirmation; provide a clear title and a way to close and return to the trigger.',
  document:
    'Compose a structured document with editorial sections and supporting details. Use these HTML classes for reports, briefs and printable reading surfaces.',
  'dropdown-menu':
    'Offer a menu of actions from a compact trigger. Use it for secondary commands attached to an item; use a select for choosing a form value.',
  empty:
    'Explain why a collection has no content and what to do next. Use it for first use, no search results or a cleared workspace.',
  'form-field':
    'Keep a label, control, help text and validation message together. Use it for forms where every input needs an accessible name and nearby guidance.',
  'hover-card':
    'Preview supporting information about a linked item. Use it for optional context available on hover or focus; keep essential actions in the main flow.',
  'icon-mark':
    'Place an icon within a consistent visual mark. Use it to introduce a feature or category beside a readable text label.',
  input:
    'Collect a short value in a single-line field. Use an appropriate input type and visible label; use a textarea for longer responses.',
  kbd: 'Display a keyboard key or shortcut in text. Use it alongside an action to show how readers can reach it from the keyboard.',
  'key-value-list':
    'Pair concise labels with values. Use it for record details, account metadata and summaries that do not need table columns.',
  label:
    'Give a form control a visible, programmatically associated name. Use it with a matching control ID so clicking the label reaches the field.',
  layout:
    'Arrange content with shared stack, cluster and column primitives. Use them to control spacing and responsive composition without per-page layout rules.',
  'margin-note':
    'Place a short annotation beside the main reading flow. Use it for supporting context that should stay close to the relevant passage.',
  'mobile-nav':
    'Expose site navigation in a compact mobile menu. Use it when the full link list cannot fit beside the brand at narrow widths.',
  'native-select':
    'Choose one value through the browser’s native select control. Use it for straightforward forms where platform behaviour is preferable to a custom popup.',
  'page-section':
    'Group a page section with a heading and consistent spacing. Use it to build a clear reading sequence across landing or content pages.',
  pagination:
    'Move through a collection divided into pages. Use it when readers need stable page positions and direct access to earlier results.',
  'passphrase-gate':
    'Show a lightweight passphrase prompt before client-side content. Use it only for casual access friction; it does not protect secrets or replace server authorization.',
  popover:
    'Open a small interactive surface anchored to a trigger. Use it for contextual controls that should remain near the item being edited.',
  progress:
    'Show how far a known task has advanced. Use a determinate value when progress can be measured; use a spinner when it cannot.',
  'proposal-layout':
    'Frame a proposal with its title, sections and supporting content. Use it for client-facing documents that need a consistent editorial structure.',
  prose:
    'Prose gives ordinary article HTML consistent typography and spacing: headings, paragraphs, lists, links, quotations and code. Use it for documentation, articles and other long-form content.',
  'radio-group':
    'Choose exactly one option from a visible set. Use it when readers should compare the available choices without opening a menu.',
  'range-slider':
    'Adjust a numeric value within known bounds. Use it when approximate adjustment matters, with a visible value and keyboard access for precise changes.',
  'scroll-area':
    'Keep overflowing content within a bounded region. Use it for long lists or panels that must share a screen with other controls.',
  'segmented-bar':
    'Show how several parts contribute to a total. Use it for a compact composition summary with readable labels or a nearby legend.',
  select:
    'Choose a value through a styled list popup. Use it for form choices that need the shared visual treatment and keyboard navigation.',
  'seo-head':
    'Set document metadata for titles, descriptions and link previews. Use it at the page boundary so metadata describes the current page rather than an embedded example.',
  separator:
    'Divide adjacent groups of content with a quiet rule. Use it when spacing alone does not make a section boundary clear.',
  sheet:
    'Open a task in a panel anchored to a screen edge. Use it for contextual editing or details that need more room than a popover.',
  'site-footer':
    'Close a site page with secondary links and ownership details. Use it consistently across public pages so supporting navigation stays predictable.',
  'site-header':
    'Present the site brand and primary navigation. Use it at the top of public pages with mobile navigation for narrower screens.',
  skeleton:
    'Reserve the shape of content while it loads. Use it when a predictable layout helps prevent the page from shifting as data arrives.',
  sparkline:
    'Show a compact trend beside a value. Use it as supporting context for a metric, with text that conveys the meaning without relying on the line alone.',
  spinner:
    'Indicate that work is in progress without a measurable percentage. Use it with a status label so the waiting state is clear to assistive technology.',
  'split-layout':
    'Divide a workspace into resizable panels. Use it when readers need to adjust the space given to a list, editor or detail view.',
  stat: 'Present one key metric with a label and supporting change. Use it for a summary value readers need to find quickly.',
  'stat-group':
    'Align related summary metrics in one group. Use it to compare a small set of key values with consistent labels and spacing.',
  steps:
    'Show the sequence and current position of a process. Use it when readers need to understand what has happened and what comes next.',
  switch:
    'Turn a setting on or off immediately. Use it for a binary preference; use a checkbox when the choice is submitted as part of a form.',
  table:
    'Compare structured records across shared columns. Use it when readers need to scan, align and compare values across rows.',
  'table-of-contents':
    'Link to headings within a long page. Use it for documents where readers benefit from jumping directly to a section.',
  tabs: 'Switch between related panels within the same context. Use tabs for peer views of one subject, with a clear selected tab and keyboard navigation.',
  textarea:
    'Collect a longer, multiline response. Use it for messages, notes and descriptions with a visible label and nearby help text.',
  'theme-provider':
    'Coordinate the selected colour scheme across a React application. Use it at the application boundary when controls need to read or change the theme.',
  'theme-toggle':
    'Let readers choose a colour scheme. Use it with the shared theme state so the choice persists and follows the application’s theme contract.',
  timeline:
    'Present events in chronological order. Use it for activity, milestones or a record’s history when sequence is more important than columns.',
  toast:
    'Confirm a recent action without interrupting the current task. Use it for brief feedback; keep messages that require a decision in the page or a dialog.',
  toggle:
    'Switch a pressed state on a compact control. Use it for view or formatting options where the button’s selected state communicates the current setting.',
  tooltip:
    'Explain a control with a short label on hover or focus. Use it for supplementary guidance; give icon-only controls an accessible name independently.',
  'vertical-tabs-layout':
    'Organize related workspace panels beside a vertical tab list. Use it for settings or detail screens with several peer sections.',
  'wizard-layout':
    'Guide a task through a sequence of steps. Use it for a longer workflow that benefits from progress, focused stages and explicit next and back actions.',
};

export function componentDescription(name: string) {
  const description = descriptions[name];
  if (!description) throw new Error(`Missing component purpose: ${name}`);
  return description;
}
