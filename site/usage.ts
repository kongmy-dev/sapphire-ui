function captureUsage(section: Element) {
  const stage = section.querySelector('.docs-example-stage');
  const target = section.querySelector('[data-html-source]');
  if (!stage || !target) return;
  const capture = () => {
    if (!stage.childElementCount) return false;
    const block = document.createElement('div');
    block.className = 'sp-code-block docs-code';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'docs-copy';
    button.dataset.copyCode = '';
    button.textContent = 'Copy HTML';
    const pre = document.createElement('pre');
    pre.className = 'sp-code-block-pre';
    pre.tabIndex = 0;
    const code = document.createElement('code');
    code.textContent = stage.hasAttribute('data-rendered-example')
      ? (stage.querySelector('code')?.textContent ?? '')
      : (stage.getAttribute('data-usage-html') ?? stage.innerHTML);
    pre.append(code);
    const status = document.createElement('p');
    status.className = 'docs-copy-status';
    status.hidden = true;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    block.append(button, pre, status);
    target.replaceChildren(block);
    return true;
  };
  if (capture()) return;
  const observer = new MutationObserver(() => {
    if (capture()) observer.disconnect();
  });
  observer.observe(stage, { childList: true });
}

export function initUsage() {
  for (const section of document.querySelectorAll('.docs-example'))
    captureUsage(section);
}
