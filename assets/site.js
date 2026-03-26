const THEME_KEY = 'sub2mark-theme';

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

const getPreferredTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const updateToggleText = (button, theme) => {
  if (!button) return;
  button.textContent = theme === 'dark' ? '☀️' : '🌙';
};

const initThemeToggle = () => {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  let current = getPreferredTheme();
  applyTheme(current);
  updateToggleText(button, current);

  button.addEventListener('click', () => {
    current = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, current);
    applyTheme(current);
    updateToggleText(button, current);
  });
};

const moveThemeToggleToFooter = () => {
  const button = document.getElementById('theme-toggle');
  const footer = document.querySelector('.site-footer');
  if (!button || !footer) return;
  if (footer.contains(button)) return;
  footer.appendChild(button);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const normalizeText = (value) => (value || '').trim().replace(/\s+/g, ' ');

const buildToc = () => {
  const toc = document.getElementById('toc');
  const content = document.querySelector('.post-content');
  if (!toc || !content) return;

  const headings = Array.from(content.querySelectorAll('h1, h2, h3, h4, h5'));
  if (!headings.length) {
    toc.innerHTML = '<p class="muted">No headings yet.</p>';
    return;
  }

  const list = document.createElement('ul');

  headings.forEach((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent || 'section');
    }

    const item = document.createElement('li');
    item.dataset.level = heading.tagName.slice(1);
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent || '';
    item.appendChild(link);
    list.appendChild(item);
  });

  toc.appendChild(list);
};

const initTocToggle = () => {
  const toc = document.getElementById('toc');
  const title = document.getElementById('toc-title') || document.querySelector('.toc-title');
  if (!toc || !title) return;
  if (!title.id) title.id = 'toc-title';

  title.addEventListener('click', () => {
    toc.style.display = toc.style.display === 'none' ? '' : 'none';
  });
};

const initActiveToc = () => {
  const toc = document.getElementById('toc');
  const content = document.querySelector('.post-content');
  if (!toc || !content) return;

  const headings = Array.from(content.querySelectorAll('h1, h2, h3, h4, h5'));
  if (!headings.length) return;

  const linksById = new Map();
  headings.forEach((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent || 'section');
    }
    const link = toc.querySelector(`a[href="#${heading.id}"]`);
    if (link) linksById.set(heading.id, link);
  });

  const setActive = (id) => {
    linksById.forEach((link, key) => {
      if (key === id) {
        link.classList.add('toc-active');
      } else {
        link.classList.remove('toc-active');
      }
    });
  };

  const onScroll = () => {
    const offset = 120;
    let current = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top - offset <= 0) {
        current = heading;
      } else {
        break;
      }
    }
    if (current && current.id) {
      setActive(current.id);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

const normalizeFootnotes = () => {
  const notes = Array.from(document.querySelectorAll('.footnotes li'));
  if (!notes.length) return;

  notes.forEach((note) => {
    const backref = note.querySelector('.footnote-backref');
    if (!backref) return;
    backref.textContent = '\u2191';

    const paragraphs = note.querySelectorAll('p');
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (lastParagraph && !lastParagraph.contains(backref)) {
      lastParagraph.appendChild(document.createTextNode(' '));
      lastParagraph.appendChild(backref);
    }
  });
};

const removeSubtitleBlockquote = () => {
  const subtitle = document.querySelector('.post-subtitle');
  const content = document.querySelector('.post-content');
  if (!subtitle || !content) return;

  const firstBlockquote = content.querySelector('blockquote');
  if (!firstBlockquote) return;

  const subtitleText = normalizeText(subtitle.textContent);
  const quoteText = normalizeText(firstBlockquote.textContent);
  if (!subtitleText || subtitleText !== quoteText) return;

  firstBlockquote.remove();
};

window.addEventListener('DOMContentLoaded', () => {
  moveThemeToggleToFooter();
  initThemeToggle();
  removeSubtitleBlockquote();
  buildToc();
  initTocToggle();
  initActiveToc();
  normalizeFootnotes();
});
