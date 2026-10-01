import './style.css';
import { findVersion, MA_VERSIONS } from './config/versions';
import { defaultMapping, newId, rowsToCues, splitIntoSubCues, type Cue, type Mapping } from './cues';
import { no as t } from './i18n/no';
import { buildCommandLine, buildCommands, buildMacroXml, prepareCues } from './ma3/macro';
import { MAX_NAME_LENGTH, slugify } from './ma3/sanitize';
import { buildZip, MACRO_DIR } from './ma3/zip';
import { parsePastedText, parseTextItems, type ParsedTable } from './parse';
import { extractPdfText } from './parse/pdf';
import { loadSettings, saveSettings, type Settings } from './settings';
import { fill, h } from './ui/dom';

interface State {
  table: ParsedTable | null;
  mapping: Mapping;
  cues: Cue[];
  settings: Settings;
  message: { kind: 'info' | 'error' | 'warn'; text: string } | null;
}

const state: State = {
  table: null,
  mapping: { number: null, start: null, duration: null, title: null },
  cues: [],
  settings: loadSettings(),
  message: null,
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const sections = {
  upload: h('section', { class: 'card' }),
  columns: h('section', { class: 'card' }),
  review: h('section', { class: 'card' }),
  settings: h('section', { class: 'card' }),
  output: h('section', { class: 'card' }),
};

document.title = t.appTitle;
app.append(
  h('header', {}, h('h1', {}, t.appTitle), h('p', { class: 'muted' }, t.appIntro)),
  ...Object.values(sections),
);

// ---------- Step 1: upload ----------

function renderUpload() {
  const fileInput = h('input', {
    type: 'file',
    accept: 'application/pdf,.pdf',
    hidden: true,
    onchange: () => fileInput.files?.[0] && loadPdf(fileInput.files[0]),
  });
  const drop = h(
    'div',
    { class: 'dropzone' },
    t.dropHint,
    ' ',
    h('button', { type: 'button', class: 'linklike', onclick: () => fileInput.click() }, t.chooseFile),
    fileInput,
  );
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('over');
    const file = e.dataTransfer?.files[0];
    if (file) loadPdf(file);
  });

  const textarea = h('textarea', { rows: 6, placeholder: t.pastePlaceholder });
  const msg = state.message;
  fill(sections.upload, 
    h('h2', {}, t.step1),
    drop,
    h('p', {}, t.orPaste),
    textarea,
    h('div', { class: 'row' }, h('button', { type: 'button', onclick: () => loadText(textarea.value) }, t.useText)),
    msg ? h('p', { class: `msg ${msg.kind}` }, msg.text) : null,
  );
}

async function loadPdf(file: File) {
  state.message = { kind: 'info', text: t.reading };
  renderUpload();
  try {
    const { items, pages } = await extractPdfText(file);
    if (!items.some((i) => i.str.trim())) {
      setTable(null, { kind: 'error', text: t.noTextLayer });
      return;
    }
    const table = parseTextItems(items, pages);
    if (!table.title) table.title = file.name.replace(/\.pdf$/i, '');
    setTable(table);
  } catch (err) {
    setTable(null, { kind: 'error', text: t.pdfError + (err instanceof Error ? err.message : String(err)) });
  }
}

function loadText(text: string) {
  if (!text.trim()) return;
  setTable(parsePastedText(text));
}

function setTable(table: ParsedTable | null, message: State['message'] = null) {
  state.table = table;
  state.message = message;
  if (table) {
    state.mapping = defaultMapping(table);
    state.cues = rowsToCues(table, state.mapping);
    state.settings.sequenceName = table.title ?? '';
    if (!state.cues.length) state.message = { kind: 'warn', text: t.noRows };
    else if (table.mode === 'lines') state.message = { kind: 'warn', text: t.linesMode };
  } else {
    state.cues = [];
  }
  renderAll();
}

// ---------- Step 2: columns ----------

function renderColumns() {
  const table = state.table;
  if (!table) return fill(sections.columns, );
  const roles: [keyof Mapping, string][] = [
    ['number', t.colNumber],
    ['start', t.colStart],
    ['duration', t.colDuration],
    ['title', t.colTitle],
  ];
  const draft: Mapping = { ...state.mapping };
  const selects = roles.map(([key, label]) =>
    h(
      'label',
      { class: 'field' },
      h('span', {}, label),
      h(
        'select',
        {
          onchange: (e: Event) => {
            const v = (e.target as HTMLSelectElement).value;
            draft[key] = v === '' ? null : Number(v);
          },
        },
        h('option', { value: '' }, t.notUsed),
        table.columns.map((c, i) => h('option', { value: i, selected: state.mapping[key] === i }, c.name || `#${i + 1}`)),
      ),
    ),
  );
  fill(sections.columns, 
    h('h2', {}, t.step2),
    h('p', { class: 'muted' }, t.columnsIntro),
    h('div', { class: 'chips' }, table.columns.map((c) => h('span', { class: 'chip' }, c.name || '–'))),
    h('div', { class: 'grid' }, selects),
    h(
      'div',
      { class: 'row' },
      h(
        'button',
        {
          type: 'button',
          onclick: () => {
            state.mapping = draft;
            state.cues = rowsToCues(table, draft);
            renderAll();
          },
        },
        t.applyColumns,
      ),
      h('span', { class: 'muted small' }, t.applyColumnsWarning),
    ),
  );
}

// ---------- Step 3: review ----------

function renderReview() {
  if (!state.table) return fill(sections.review, );
  const prepared = prepareCues(state.cues, state.settings);
  const byId = new Map(prepared.cues.map((c) => [c.id, c]));

  const update = (cue: Cue, key: 'srcNumber' | 'name' | 'time' | 'note') => (e: Event) => {
    cue[key] = (e.target as HTMLInputElement).value;
    renderReview();
    renderOutput();
  };
  const move = (i: number, dir: -1 | 1) => () => {
    const j = i + dir;
    if (j < 0 || j >= state.cues.length) return;
    [state.cues[i], state.cues[j]] = [state.cues[j], state.cues[i]];
    rerender();
  };
  const remove = (id: string) => () => {
    // Removing a cue also removes its sub-cues.
    state.cues = state.cues.filter((c) => c.id !== id && c.parentId !== id);
    rerender();
  };
  const rerender = () => {
    renderReview();
    renderOutput();
  };

  const rows = state.cues.map((cue, i) => {
    const p = byId.get(cue.id)!;
    const warnings = [!cue.name.trim() && t.emptyName, p.truncated && t.truncatedWarning(MAX_NAME_LENGTH)].filter(
      Boolean,
    ) as string[];
    return h(
      'tr',
      { class: cue.parentId ? 'sub' : undefined },
      h('td', { class: 'num' }, p.number),
      h(
        'td',
        {},
        cue.parentId ? '' : h('input', { class: 'src', value: cue.srcNumber, onchange: update(cue, 'srcNumber') }),
      ),
      h(
        'td',
        {},
        h('input', { class: 'name', value: cue.name, onchange: update(cue, 'name') }),
        warnings.length ? h('div', { class: 'warn small' }, warnings.join(' ')) : null,
      ),
      h('td', {}, h('input', { class: 'time', value: cue.time, onchange: update(cue, 'time') })),
      h(
        'td',
        {},
        h('textarea', { class: 'note', rows: Math.min(6, Math.max(1, cue.note.split('\n').length)), onchange: update(cue, 'note') }, cue.note),
        cue.note.trim() && !cue.parentId
          ? h(
              'button',
              {
                type: 'button',
                class: 'small',
                onclick: () => {
                  state.cues = splitIntoSubCues(state.cues, cue.id);
                  rerender();
                },
              },
              t.split,
            )
          : null,
      ),
      h(
        'td',
        { class: 'actions' },
        h('button', { type: 'button', title: t.moveUp, 'aria-label': t.moveUp, onclick: move(i, -1) }, '↑'),
        h('button', { type: 'button', title: t.moveDown, 'aria-label': t.moveDown, onclick: move(i, 1) }, '↓'),
        h('button', { type: 'button', title: t.remove, 'aria-label': t.remove, onclick: remove(cue.id) }, '✕'),
      ),
    );
  });

  fill(sections.review, 
    h('h2', {}, t.step3, ' ', h('span', { class: 'muted small' }, t.cueCount(state.cues.length))),
    h('p', { class: 'muted' }, t.reviewIntro),
    prepared.numberingFellBack ? h('p', { class: 'msg warn' }, t.numberingFellBack) : null,
    h(
      'div',
      { class: 'tablewrap' },
      h(
        'table',
        {},
        h(
          'thead',
          {},
          h('tr', {}, [t.thCue, t.thSrc, t.thName, t.thTime, t.thNote, t.thActions].map((x) => h('th', {}, x))),
        ),
        h('tbody', {}, rows),
      ),
    ),
    h(
      'div',
      { class: 'row' },
      h(
        'button',
        {
          type: 'button',
          onclick: () => {
            state.cues.push({ id: newId(), srcNumber: '', name: '', time: '', duration: '', note: '' });
            rerender();
          },
        },
        t.addRow,
      ),
    ),
  );
}

// ---------- Step 4: settings ----------

function renderSettings() {
  if (!state.table) return fill(sections.settings, );
  const s = state.settings;
  const changed = () => {
    saveSettings(s);
    renderReview();
    renderOutput();
  };
  const seqInput = h('input', {
    type: 'number',
    min: 1,
    step: 1,
    value: s.sequence,
    oninput: (e: Event) => {
      s.sequence = Number((e.target as HTMLInputElement).value);
      changed();
    },
  });
  fill(sections.settings, 
    h('h2', {}, t.step4),
    h('p', { class: 'muted' }, t.settingsIntro),
    h(
      'div',
      { class: 'grid' },
      h('label', { class: 'field' }, h('span', {}, t.sequence), seqInput, h('small', { class: 'muted' }, t.sequenceHelp)),
      h(
        'label',
        { class: 'field' },
        h('span', {}, t.numbering),
        h(
          'select',
          {
            onchange: (e: Event) => {
              s.numbering = (e.target as HTMLSelectElement).value as Settings['numbering'];
              changed();
            },
          },
          h('option', { value: 'follow', selected: s.numbering === 'follow' }, t.numberingFollow),
          h('option', { value: 'running', selected: s.numbering === 'running' }, t.numberingRunning),
        ),
      ),
      h(
        'label',
        { class: 'field' },
        h('span', {}, t.sequenceName),
        h('input', {
          value: s.sequenceName,
          oninput: (e: Event) => {
            s.sequenceName = (e.target as HTMLInputElement).value;
            changed();
          },
        }),
      ),
      h(
        'label',
        { class: 'field' },
        h('span', {}, t.maVersion),
        h(
          'select',
          {
            onchange: (e: Event) => {
              s.maVersion = (e.target as HTMLSelectElement).value;
              changed();
            },
          },
          MA_VERSIONS.map((v) => h('option', { value: v.id, selected: v.id === s.maVersion }, v.label)),
        ),
      ),
      h(
        'label',
        { class: 'field' },
        h('span', {}, t.nameFormat),
        h(
          'select',
          {
            onchange: (e: Event) => {
              s.nameFormat = (e.target as HTMLSelectElement).value as Settings['nameFormat'];
              changed();
            },
          },
          h('option', { value: 'title', selected: s.nameFormat === 'title' }, t.nameTitle),
          h('option', { value: 'time-title', selected: s.nameFormat === 'time-title' }, t.nameTimeTitle),
        ),
      ),
    ),
    h(
      'label',
      { class: 'check' },
      h('input', {
        type: 'checkbox',
        checked: s.includeNotes,
        onchange: (e: Event) => {
          s.includeNotes = (e.target as HTMLInputElement).checked;
          changed();
        },
      }),
      t.includeNotes,
    ),
    h(
      'label',
      { class: 'check' },
      h('input', {
        type: 'checkbox',
        checked: s.clearFirst,
        onchange: (e: Event) => {
          s.clearFirst = (e.target as HTMLInputElement).checked;
          changed();
        },
      }),
      t.clearFirst,
    ),
  );
}

// ---------- Step 5: output ----------

function renderOutput() {
  if (!state.table || !state.cues.length) return fill(sections.output, );
  const s = state.settings;
  const seqValid = Number.isInteger(s.sequence) && s.sequence >= 1;
  const version = findVersion(s.maVersion);
  const macroName = s.sequenceName.trim() || 'Kjøreplan';
  const fileSlug = slugify(macroName);
  const prepared = prepareCues(state.cues, s);
  const commands = buildCommands(prepared.cues, s);
  const cmdLine = buildCommandLine(commands);

  const download = async () => {
    const xml = buildMacroXml(macroName, commands, version.dataVersion);
    const blob = await buildZip(fileSlug, xml);
    const a = h('a', { href: URL.createObjectURL(blob), download: `${fileSlug}.zip` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copyBtn = h(
    'button',
    {
      type: 'button',
      onclick: async () => {
        await navigator.clipboard.writeText(cmdLine);
        copyBtn.textContent = t.copied;
        setTimeout(() => (copyBtn.textContent = t.copy), 1500);
      },
    },
    t.copy,
  );

  fill(sections.output, 
    h('h2', {}, t.step5),
    seqValid ? null : h('p', { class: 'msg error' }, t.sequenceInvalid),
    h('p', { class: 'msg warn' }, t.unverified),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', disabled: !seqValid, onclick: download }, t.download)),
    h('p', { class: 'muted small mono' }, `${MACRO_DIR}/${fileSlug}.xml`),
    h('h3', {}, t.importTitle),
    h('ol', {}, t.importSteps(version.importMenu, fileSlug, s.sequence).map((x) => h('li', {}, x))),
    h('h3', {}, t.cmdTitle),
    h('p', { class: 'muted' }, t.cmdHelp),
    h('textarea', { class: 'mono', rows: 4, readonly: true }, cmdLine),
    h('div', { class: 'row' }, copyBtn),
  );
}

function renderAll() {
  renderUpload();
  renderColumns();
  renderReview();
  renderSettings();
  renderOutput();
}

renderAll();
