(function () {
  const keywordSet = new Set([
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from',
    'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not',
    'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'
  ]);

  const builtinSet = new Set([
    'len', 'range', 'enumerate', 'list', 'dict', 'set', 'tuple', 'print',
    'sum', 'min', 'max', 'any', 'all', 'zip', 'map', 'filter', 'sorted'
  ]);

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function span(cls, text) {
    return `<span class="token ${cls}">${escapeHtml(text)}</span>`;
  }

  function highlightPython(source) {
    let i = 0;
    const len = source.length;
    let out = '';

    while (i < len) {
      const ch = source[i];

      if (ch === '#') {
        const start = i;
        while (i < len && source[i] !== '\n') i++;
        const comment = source.slice(start, i);
        out += span('comment', comment);
        continue;
      }

      if (ch === '"' || ch === "'") {
        const quote = ch;
        const start = i;
        i++;
        let triple = false;
        if (i + 1 < len && source[i] === quote && source[i + 1] === quote) {
          triple = true;
          i += 2;
        }
        while (i < len) {
          if (source[i] === '\\') {
            i += 2;
            continue;
          }
          if (source[i] === quote) {
            if (triple) {
              if (source[i + 1] === quote && source[i + 2] === quote) {
                i += 3;
                break;
              }
            } else {
              i += 1;
              break;
            }
          }
          if (source[i] === '\n' && !triple) {
            break;
          }
          i += 1;
        }
        const stringLiteral = source.slice(start, i);
        out += span('string', stringLiteral);
        continue;
      }

      if (/[0-9]/.test(ch)) {
        const start = i;
        i += 1;
        while (i < len && /[0-9_.]/.test(source[i])) i++;
        out += span('number', source.slice(start, i));
        continue;
      }

      if (/[A-Za-z_]/.test(ch)) {
        const start = i;
        i += 1;
        while (i < len && /[A-Za-z0-9_]/.test(source[i])) i++;
        const ident = source.slice(start, i);
        if (keywordSet.has(ident)) {
          out += span('keyword', ident);
        } else if (builtinSet.has(ident)) {
          out += span('builtin', ident);
        } else {
          out += escapeHtml(ident);
        }
        continue;
      }

      if (ch === '\n') {
        out += '\n';
        i += 1;
        continue;
      }

      out += escapeHtml(ch);
      i += 1;
    }

    return out;
  }

  function highlightBlock(codeEl) {
    if (codeEl.dataset.highlighted === 'true') return;
    const className = codeEl.className || '';
    const langMatch = className.match(/language-([a-zA-Z0-9]+)/);
    if (!langMatch) return;
    const lang = langMatch[1].toLowerCase();
    let highlighted = '';
    if (lang === 'python' || lang === 'py') {
      highlighted = highlightPython(codeEl.textContent);
    }
    if (highlighted) {
      codeEl.innerHTML = highlighted;
      codeEl.dataset.highlighted = 'true';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('pre code').forEach(highlightBlock);
  });
})();
