for (const frame of document.querySelectorAll('iframe')) {
  frame.addEventListener('load', () => {
    const content = frame.contentDocument?.getElementById('example');
    if (!content) return;
    const resize = () => {
      const height = Math.ceil(content.getBoundingClientRect().height + 48);
      frame.height = String(Math.min(640, Math.max(160, height)));
    };
    new ResizeObserver(resize).observe(content);
    resize();
  });
}
