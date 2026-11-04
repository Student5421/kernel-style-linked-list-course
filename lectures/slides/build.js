#!/usr/bin/env node
/*
 * Builds the lecture slide decks from content/weekNN.js.
 *
 *   npm install                 once, inside lectures/slides/
 *   node build.js               build every week
 *   node build.js week01 week02 build only those weeks
 *
 * Each deck is written next to its lecture notes, e.g.
 * lectures/week01-struct/week01-slides.pptx
 *
 * Code on the slides is read from the week's examples/ (and assignments/)
 * files, so the slides always show code that actually builds.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs')] }));

const LECTURES = path.resolve(__dirname, '..');
const REPO = path.resolve(LECTURES, '..');

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

const THEME = {
    name: 'Linked Lists',
    headFontFace: 'Arial',
    bodyFontFace: 'Calibri',
    colors: {
        dk1: '1C2128',      // text, dark slides
        lt1: 'FFFFFF',      // background
        dk2: '424A53',      // secondary text
        lt2: 'F2F4F7',      // panels and cards
        accent1: 'E8A33D',  // amber: numbers, labels on dark
        accent2: '2A9D7F',  // teal: correct, lab
        accent3: 'D64545',  // red: bug, wrong
        accent4: '3D6FD9',  // blue: info
        accent5: 'A85A08',  // dark amber: inline code on white
        accent6: '8A939D',  // muted gray
        hlink: '3D6FD9',
        folHlink: '7C4DCC',
    },
};
const HEX = THEME.colors;
const CODE_FONT = 'Consolas';
const DARK_BG = '1C2128';
const PANEL = '22272E';
const PANEL_TAB = '343B44';
const SYN = {
    text: 'E6EDF3', kw: 'FF7B72', type: 'FFA657', str: 'A5D6FF', com: '8B949E',
    num: '79C0FF', pre: 'D2A8FF', prompt: '7EE787', out: 'B9C2CC', target: 'FFA657', var: '79C0FF',
};

const W = 13.333;
const H = 7.5;
const X0 = 0.6;
const XR = W - 0.6;
const CW = XR - X0;
const Y0 = 1.35;
const YB = 6.8;
const CH = YB - Y0;
const GAP = 0.3;

let warnings = [];
let currentSlideLabel = '';
function warn(msg) {
    warnings.push(`  [${currentSlideLabel}] ${msg}`);
}

/* ------------------------------------------------------------------ */
/* Inline markup: `code` and **bold**                                  */
/* ------------------------------------------------------------------ */

function md(str, base, dark) {
    // `code`, **bold**, *italic*; bold and italic may contain code
    const out = [];
    const re = /(`[^`]+`|\*\*(?:[^*]|\*(?!\*))+?\*\*|(?<![\w*])\*(?![\s*])[^*\n]*?[^\s*]\*(?![\w*]))/g;
    let last = 0;
    let m;
    str = String(str);
    while ((m = re.exec(str))) {
        if (m.index > last)
            out.push({ text: str.slice(last, m.index), options: { ...base } });
        const tok = m[0];
        if (tok[0] === '`')
            out.push({ text: tok.slice(1, -1), options: { ...base, fontFace: CODE_FONT, color: dark ? 'accent1' : 'accent5' } });
        else if (tok.startsWith('**'))
            out.push(...md(tok.slice(2, -2), { ...base, bold: true }, dark));
        else
            out.push(...md(tok.slice(1, -1), { ...base, italic: true }, dark));
        last = m.index + tok.length;
    }
    if (last < str.length)
        out.push({ text: str.slice(last), options: { ...base } });
    if (out.length === 0)
        out.push({ text: ' ', options: { ...base } });
    return out;
}

function plain(str) {
    return String(str).replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(?<![\w*])\*([^\s*][^*\n]*?[^\s*]|[^\s*])\*(?![\w*])/g, '$1');
}

/* Rough text height for overflow warnings (Calibri ~0.5 em per char). */
function estimateLines(str, fontSize, width) {
    const charsPerLine = Math.max(1, Math.floor((width * 72) / (fontSize * 0.5)));
    return String(str).split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(plain(l).length / charsPerLine)), 0);
}
function estimateHeight(items, fontSize, width, spaceAfter) {
    let h = 0;
    for (const it of items) {
        const t = typeof it === 'string' ? it : it.t;
        h += estimateLines(t, fontSize, width - 0.45) * fontSize * 1.2 / 72 + spaceAfter / 72;
        for (const s of (typeof it === 'string' ? [] : it.sub || []))
            h += estimateLines(s, fontSize - 3, width - 0.9) * (fontSize - 3) * 1.2 / 72 + spaceAfter / 72;
    }
    return h;
}

/* ------------------------------------------------------------------ */
/* Code: extraction and highlighting                                   */
/* ------------------------------------------------------------------ */

function dedent(lines) {
    const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return isFinite(ind) ? lines.map(l => l.slice(ind)) : lines;
}

function trimBlank(lines) {
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    return lines;
}

/*
 * spec: string (inline code), or { file, fn | struct | macro | lines | from/to, comment }
 * or an array of those, joined with a blank line. `file` is relative to the deck's
 * lecture directory; paths starting with "/" are relative to the repository root.
 */
function getCode(deck, spec) {
    if (spec == null) return '';
    if (typeof spec === 'string') return spec.replace(/\s+$/, '');
    if (Array.isArray(spec)) return spec.map(s => getCode(deck, s)).join('\n\n');
    if (spec.src) return spec.src.replace(/\s+$/, '');
    const file = spec.file.startsWith('/') ? path.join(REPO, spec.file) : path.join(deck.dir, spec.file);
    // Tabs are kept: Makefile recipes must keep their TAB when copied off a slide.
    const src = fs.readFileSync(file, 'utf8').split('\n');
    let a = 0;
    let b = src.length - 1;
    const find = (re, from = 0) => {
        for (let i = from; i < src.length; i++)
            if (re.test(src[i])) return i;
        throw new Error(`${spec.file}: no line matches ${re}`);
    };
    if (spec.fn) {
        a = find(new RegExp(`^[A-Za-z].*\\b${spec.fn}\\s*\\([^;]*$`));
        b = find(/^}/, a);
    } else if (spec.struct) {
        a = find(new RegExp(`^struct ${spec.struct}\\s*\\{`));
        b = find(/^};/, a);
    } else if (spec.macro) {
        a = find(new RegExp(`^#define ${spec.macro}\\b`));
        b = a;
        while (/\\\s*$/.test(src[b])) b++;
    } else if (spec.lines) {
        a = spec.lines[0] - 1;
        b = spec.lines[1] - 1;
    } else if (spec.from) {
        a = find(spec.from);
        b = spec.to ? find(spec.to, a + (spec.inclusiveSame ? 0 : 1)) : src.length - 1;
    }
    if (spec.comment && a > 0) {
        let c = a - 1;
        if (/\*\/\s*$/.test(src[c])) {
            while (c > 0 && !/\/\*/.test(src[c])) c--;
            a = c;
        }
    }
    let lines = src.slice(a, b + 1);
    if (spec.drop) lines = lines.filter(l => !spec.drop.some(re => re.test(l)));
    return dedent(trimBlank(lines)).join('\n');
}

const C_KW = new Set(['if', 'else', 'for', 'while', 'do', 'return', 'switch', 'case', 'break', 'continue',
    'default', 'goto', 'sizeof', '_Alignof', 'typedef']);
const C_TYPE = new Set(['int', 'char', 'void', 'struct', 'unsigned', 'signed', 'long', 'short', 'double',
    'float', 'size_t', 'const', 'static', 'FILE', 'extern', 'union', 'enum', 'inline']);
const C_CONST = new Set(['NULL', 'EOF', 'EXIT_SUCCESS', 'EXIT_FAILURE', 'stdin', 'stdout', 'stderr']);

function tokC(line, state) {
    const toks = [];
    let i = 0;
    if (state.inComment) {
        const end = line.indexOf('*/');
        if (end < 0) return [[line, SYN.com]];
        toks.push([line.slice(0, end + 2), SYN.com]);
        i = end + 2;
        state.inComment = false;
    }
    if (/^\s*#/.test(line.slice(i)) && i === 0) {
        const c = line.search(/\/\*|\/\//);
        const pre = c < 0 ? line : line.slice(0, c);
        toks.push([pre, SYN.pre]);
        if (c >= 0) toks.push(...tokC(line.slice(c), state));
        return toks;
    }
    const re = /(\/\*.*?\*\/|\/\*.*$|\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b0x[0-9A-Fa-f]+u?\b|\b\d+(?:\.\d+)?u?\b|\b[A-Za-z_]\w*\b|\s+|.)/g;
    re.lastIndex = i;
    let m;
    while ((m = re.exec(line))) {
        const t = m[0];
        let col = SYN.text;
        if (t.startsWith('/*')) {
            col = SYN.com;
            if (!t.endsWith('*/') || t.length < 4) state.inComment = true;
        } else if (t.startsWith('//')) col = SYN.com;
        else if (t[0] === '"' || t[0] === "'") col = SYN.str;
        else if (/^\d|^0x/.test(t)) col = SYN.num;
        else if (C_KW.has(t)) col = SYN.kw;
        else if (C_TYPE.has(t)) col = SYN.type;
        else if (C_CONST.has(t)) col = SYN.num;
        toks.push([t, col]);
        if (m[0].length === 0) re.lastIndex++;
    }
    return toks;
}

function tokMake(line) {
    if (/^\s*#/.test(line)) return [[line, SYN.com]];
    const toks = [];
    const target = line.match(/^([^\s:=#][^:=#]*?):(?!=)/);
    let rest = line;
    if (target) {
        toks.push([target[0], target[1].startsWith('.') ? SYN.kw : SYN.target]);
        rest = line.slice(target[0].length);
    } else {
        const v = line.match(/^([A-Z_]+)(\s*=)/);
        if (v) {
            toks.push([v[1], SYN.var], [v[2], SYN.text]);
            rest = line.slice(v[0].length);
        }
    }
    const re = /(\$\([^)]*\)|\$[@^<]|#.*$|[^$#]+|.)/g;
    let m;
    while ((m = re.exec(rest))) {
        const t = m[0];
        toks.push([t, t[0] === '$' ? SYN.var : t[0] === '#' ? SYN.com : SYN.text]);
    }
    return toks;
}

function tokSh(line) {
    if (line.startsWith('$ ')) {
        const c = line.indexOf('  #');
        const cmd = c < 0 ? line.slice(2) : line.slice(2, c);
        const toks = [['$ ', SYN.prompt], [cmd, SYN.text]];
        if (c >= 0) toks.push([line.slice(c), SYN.com]);
        return toks;
    }
    if (/^\s*#/.test(line)) return [[line, SYN.com]];
    const c = line.indexOf('  #');
    if (c >= 0) return [[line.slice(0, c), SYN.text], [line.slice(c), SYN.com]];
    return [[line, SYN.text]];
}

function highlight(code, lang, fontSize) {
    const lines = code.split('\n');
    const state = {};
    const runs = [];
    lines.forEach((line, li) => {
        let toks;
        if (lang === 'c') toks = tokC(line, state);
        else if (lang === 'make') toks = tokMake(line);
        else if (lang === 'sh') toks = tokSh(line);
        else if (lang === 'out') toks = [[line, SYN.out]];
        else toks = [[line, SYN.text]];
        // merge neighbours of the same colour
        const merged = [];
        for (const [t, c] of toks) {
            if (merged.length && merged[merged.length - 1][1] === c) merged[merged.length - 1][0] += t;
            else merged.push([t, c]);
        }
        if (merged.length === 0 || merged.every(([t]) => t === '')) merged.splice(0, merged.length, [' ', SYN.text]);
        merged.forEach(([t, c], ti) => {
            const o = { color: c, fontFace: CODE_FONT, fontSize };
            if (c === SYN.com) o.italic = true;
            if (ti === merged.length - 1 && li < lines.length - 1) o.breakLine = true;
            runs.push({ text: t, options: o });
        });
    });
    return runs;
}

/* ------------------------------------------------------------------ */
/* Drawing primitives                                                  */
/* ------------------------------------------------------------------ */

let PRES;   // current presentation
let SCH;    // PRES.SchemeColor
const S = name => PRES.SchemeColor[{
    text1: 'text1', text2: 'text2', bg1: 'background1', bg2: 'background2',
    accent1: 'accent1', accent2: 'accent2', accent3: 'accent3', accent4: 'accent4', accent5: 'accent5', accent6: 'accent6',
}[name] || name];

function fixColors(runs) {
    // md() marks inline-code colours by scheme name; resolve them here
    for (const r of runs)
        if (r.options && /^accent\d$/.test(r.options.color)) r.options.color = S(r.options.color);
    return runs;
}

function text(slide, content, opts) {
    const o = { isTextBox: true, margin: 0, valign: 'top', ...opts };
    if (typeof content === 'string') content = md(content, { fontSize: o.fontSize, color: o.color, bold: o.bold }, o.dark);
    delete o.dark;
    slide.addText(fixColors(content), o);
}

function circleNumber(slide, n, x, y, d, fill, color) {
    slide.addText(String(n), {
        shape: PRES.ShapeType.ellipse, x, y, w: d, h: d, fill: { color: fill }, color,
        fontSize: Math.round(d * 30), bold: true, align: 'center', valign: 'middle', margin: 0,
        fontFace: THEME.headFontFace, objectName: `badge ${n}`,
    });
}

function pill(slide, label, x, y, kind, w) {
    const fill = { bad: S('accent3'), good: S('accent2'), info: S('accent4'), demo: S('text1'), ex: S('accent1'), neutral: S('text2') }[kind || 'neutral'];
    const color = kind === 'ex' ? S('text1') : S('bg1');
    const width = w || Math.max(1.0, 0.11 * label.length + 0.45);
    slide.addText(label, {
        shape: PRES.ShapeType.roundRect, rectRadius: 0.17, x, y, w: width, h: 0.34, fill: { color: fill }, color,
        fontSize: 12, bold: true, align: 'center', valign: 'middle', margin: 0, charSpacing: 1, objectName: `label ${label}`,
    });
    return width;
}

function arrow(slide, x1, y1, x2, y2, opts = {}) {
    const line = { color: opts.color || HEX.dk2, width: opts.width || 1.75 };
    if (!opts.noHead) line.endArrowType = 'triangle';
    if (opts.dash) line.dashType = 'dash';
    slide.addShape(PRES.ShapeType.line, {
        x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
        flipH: x2 < x1, flipV: y2 < y1, line,
    });
}

/* Polyline through points; arrowhead on the last segment. */
function path_(slide, pts, opts = {}) {
    for (let i = 0; i < pts.length - 1; i++)
        arrow(slide, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { ...opts, noHead: i < pts.length - 2 || opts.noHead });
}

function monoWidth(line) {
    const l = line.replace(/\t/g, '        ');
    return l.length + (l.match(/[\u1100-\u11ff\u2e80-\ua4cf\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]/g) || []).length;
}

function fitCodeFont(code, w, h, maxFont, minFont) {
    const lines = code.split('\n');
    const longest = Math.max(1, ...lines.map(monoWidth));
    const fitW = ((w - 0.5) * 72) / (0.57 * longest);
    const fitH = ((h - 0.36) * 72) / (1.2 * lines.length);
    const size = Math.floor(Math.min(maxFont, fitW, fitH) * 2) / 2;
    if (size < minFont) warn(`code too big: ${lines.length} lines, longest ${longest} chars -> ${size.toFixed(1)}pt (min ${minFont})`);
    else if (size < 14 && minFont < 14) warn(`code at ${size.toFixed(1)}pt: ${lines.length} lines, longest ${longest} chars; give it more width (layout: 'tb', a larger ratio) or split it`);
    return Math.max(size, minFont);
}

/* A dark code panel with an optional file-name tab: the deck's visual motif. */
function codePanel(slide, code, { x, y, w, h, lang = 'c', label, maxFont = 20, minFont = 12, fitHeight = true }) {
    const size = fitCodeFont(code, w, h, maxFont, minFont);
    if (fitHeight) {
        const need = code.split('\n').length * size * 1.2 / 72 + 0.45;
        h = Math.min(h, Math.max(need, 0.8));
    }
    if (label) {
        const tw = Math.max(1.2, 0.105 * label.length + 0.5);
        slide.addText(label, {
            shape: PRES.ShapeType.roundRect, rectRadius: 0.06, x: x + 0.2, y: y - 0.3, w: tw, h: 0.42,
            fill: { color: PANEL_TAB }, color: 'E8A33D', fontFace: CODE_FONT, fontSize: 12, valign: 'top',
            margin: [10, 10, 0, 5], objectName: `tab ${label}`,
        });
    }
    slide.addText(highlight(code, lang, size), {
        shape: PRES.ShapeType.roundRect, rectRadius: 0.08, x, y, w, h, fill: { color: PANEL },
        fontFace: CODE_FONT, fontSize: size, valign: 'top', margin: [18, 14, 10, 12], wrap: false,
        objectName: label ? `code ${label}` : 'code',
    });
    return h + (label ? 0.3 : 0);
}

/* Light diagram panel for ASCII art taken from the notes. */
function artPanel(slide, art, { x, y, w, h, maxFont = 20, minFont = 11 }) {
    const size = fitCodeFont(art, w, h, maxFont, minFont);
    h = Math.min(h, art.split('\n').length * size * 1.2 / 72 + 0.5);
    slide.addText(art.split('\n').map((l, i, a) => ({
        text: l || ' ', options: { breakLine: i < a.length - 1, fontFace: CODE_FONT, fontSize: size, color: S('text1') },
    })), {
        shape: PRES.ShapeType.roundRect, rectRadius: 0.08, x, y, w, h, fill: { color: S('bg2') },
        valign: 'middle', margin: [18, 14, 10, 12], wrap: false, objectName: 'diagram',
    });
    return h;
}

function bulletList(slide, items, { x, y, w, h, fontSize = 20, dark = false, spaceAfter = 10 }) {
    const runs = [];
    items.forEach((it, i) => {
        const t = typeof it === 'string' ? it : it.t;
        const subs = (typeof it === 'string' ? [] : it.sub) || [];
        const color = dark ? S('bg1') : S('text1');
        const para = [{ t, lvl: 0, size: fontSize }].concat(subs.map(s => ({ t: s, lvl: 1, size: fontSize - 3 })));
        para.forEach((p, pi) => {
            const rs = md(p.t, { fontSize: p.size, color: p.lvl ? (dark ? S('bg2') : S('text2')) : color }, dark);
            // pptxgenjs starts a new paragraph at every run with `bullet`, and writes a
            // <a:pPr> for every run with paragraph options: put them on the first run only.
            Object.assign(rs[0].options, { bullet: { indent: 22 }, indentLevel: p.lvl, paraSpaceAfter: spaceAfter });
            if (!(i === items.length - 1 && pi === para.length - 1)) rs[rs.length - 1].options.breakLine = true;
            runs.push(...rs);
        });
    });
    const est = estimateHeight(items, fontSize, w, spaceAfter);
    if (est > h + 0.05) warn(`bullets may overflow: ~${est.toFixed(2)}in in ${h.toFixed(2)}in`);
    text(slide, runs, { x, y, w, h, fontSize, valign: 'top' });
}

/* ------------------------------------------------------------------ */
/* Diagrams                                                            */
/* ------------------------------------------------------------------ */

function nodeBox(slide, x, y, w, h, label, kind) {
    const fill = kind === 'head' ? S('accent1') : kind === 'ptr' ? S('text1') : S('bg1');
    const color = kind === 'ptr' ? S('bg1') : S('text1');
    slide.addText(label, {
        shape: PRES.ShapeType.roundRect, rectRadius: 0.08, x, y, w, h, fill: { color: fill },
        line: { color: kind === 'head' ? HEX.accent1 : HEX.dk2, width: 1.5 }, color,
        fontFace: CODE_FONT, fontSize: 16, bold: true, align: 'center', valign: 'middle', margin: 2,
        objectName: `node ${label}`,
    });
}

function nullText(slide, x, y, align) {
    text(slide, 'NULL', { x, y: y - 0.2, w: 0.8, h: 0.4, fontSize: 14, color: S('accent6'), fontFace: CODE_FONT, align, valign: 'middle' });
}

/*
 * Linked-list chain.  d = { kind: 'singly'|'doubly'|'circular', nodes: [...], head: 'head',
 * tail: 'tail', sentinel: 'HEAD', x, y, w, h }
 */
function drawChain(slide, d) {
    const nodes = d.nodes || [];
    const n = nodes.length + (d.kind === 'circular' ? 1 : 0);
    const bw = d.nodeW || 1.25;
    const bh = d.nodeH || 0.75;
    const gap = d.gap || 0.8;
    const extraL = d.kind === 'singly' ? 1.4 : d.kind === 'doubly' ? 1.1 : 0;
    const extraR = d.kind === 'circular' ? 0.6 : 1.1;
    const total = extraL + n * bw + (n - 1) * gap + extraR;
    let x = d.x + (d.w - total) / 2 + extraL;
    const y = d.y + (d.h - bh) / 2 + (d.kind === 'circular' ? 0 : 0.15);
    const mid = y + bh / 2;
    const xs = [];
    for (let i = 0; i < n; i++) xs.push(x + i * (bw + gap));

    if (d.kind === 'circular') {
        nodeBox(slide, xs[0], y, bw, bh, d.sentinel || 'HEAD', 'head');
        nodes.forEach((t, i) => nodeBox(slide, xs[i + 1], y, bw, bh, t));
        for (let i = 0; i < n - 1; i++) {
            arrow(slide, xs[i] + bw, mid - 0.13, xs[i + 1], mid - 0.13, { color: HEX.dk1 });
            arrow(slide, xs[i + 1], mid + 0.13, xs[i] + bw, mid + 0.13, { color: HEX.accent6 });
        }
        const last = xs[n - 1];
        if (n === 1) {
            // empty list: HEAD points to itself both ways
            path_(slide, [[last + bw * 0.7, y], [last + bw * 0.7, y - 0.45], [last + bw + 0.45, y - 0.45], [last + bw + 0.45, mid - 0.13], [last + bw, mid - 0.13]], { color: HEX.dk1 });
            path_(slide, [[last + bw, mid + 0.13], [last + bw + 0.45, mid + 0.13], [last + bw + 0.45, y + bh + 0.45], [last + bw * 0.7, y + bh + 0.45], [last + bw * 0.7, y + bh]], { color: HEX.accent6 });
            text(slide, 'next', { x: last + bw + 0.55, y: y - 0.55, w: 0.8, h: 0.3, fontSize: 13, color: S('text1'), fontFace: CODE_FONT });
            text(slide, 'prev', { x: last + bw + 0.55, y: y + bh + 0.3, w: 0.8, h: 0.3, fontSize: 13, color: S('accent6'), fontFace: CODE_FONT });
        } else {
            const top = y - 0.5;
            const bot = y + bh + 0.5;
            path_(slide, [[last + bw / 2, y], [last + bw / 2, top], [xs[0] + bw / 2, top], [xs[0] + bw / 2, y]], { color: HEX.dk1 });
            path_(slide, [[xs[0] + bw / 2, y + bh], [xs[0] + bw / 2, bot], [last + bw / 2, bot], [last + bw / 2, y + bh]], { color: HEX.accent6 });
            // labels centred over the wrap-around arrows, never narrower than the text
            const lw = Math.max(3.2, last - xs[0] - bw);
            const lx = (xs[0] + bw / 2 + last + bw / 2) / 2 - lw / 2;
            text(slide, 'last->next == &head', { x: lx, y: top - 0.38, w: lw, h: 0.32, fontSize: 13, color: S('text1'), fontFace: CODE_FONT, align: 'center' });
            text(slide, 'head.prev == last', { x: lx, y: bot + 0.06, w: lw, h: 0.32, fontSize: 13, color: S('accent6'), fontFace: CODE_FONT, align: 'center' });
        }
        return;
    }

    nodes.forEach((t, i) => nodeBox(slide, xs[i], y, bw, bh, t));
    if (d.kind === 'singly') {
        nodeBox(slide, xs[0] - 1.4, y + 0.12, 0.85, bh - 0.24, d.head || 'head', 'ptr');
        arrow(slide, xs[0] - 0.55, mid, xs[0], mid, { color: HEX.dk1 });
        for (let i = 0; i < n - 1; i++) arrow(slide, xs[i] + bw, mid, xs[i + 1], mid, { color: HEX.dk1 });
        arrow(slide, xs[n - 1] + bw, mid, xs[n - 1] + bw + 0.5, mid, { color: HEX.dk1 });
        nullText(slide, xs[n - 1] + bw + 0.55, mid, 'left');
    } else {
        for (let i = 0; i < n - 1; i++) {
            arrow(slide, xs[i] + bw, mid - 0.13, xs[i + 1], mid - 0.13, { color: HEX.dk1 });
            arrow(slide, xs[i + 1], mid + 0.13, xs[i] + bw, mid + 0.13, { color: HEX.accent6 });
        }
        arrow(slide, xs[0], mid + 0.13, xs[0] - 0.45, mid + 0.13, { color: HEX.accent6 });
        nullText(slide, xs[0] - 1.25, mid + 0.13, 'right');
        arrow(slide, xs[n - 1] + bw, mid - 0.13, xs[n - 1] + bw + 0.45, mid - 0.13, { color: HEX.dk1 });
        nullText(slide, xs[n - 1] + bw + 0.5, mid - 0.13, 'left');
        if (d.head) {
            text(slide, d.head, { x: xs[0], y: y - 0.85, w: bw, h: 0.3, fontSize: 14, bold: true, color: S('text1'), fontFace: CODE_FONT, align: 'center' });
            arrow(slide, xs[0] + bw / 2, y - 0.55, xs[0] + bw / 2, y, { color: HEX.dk1 });
        }
        if (d.tail) {
            text(slide, d.tail, { x: xs[n - 1], y: y - 0.85, w: bw, h: 0.3, fontSize: 14, bold: true, color: S('text1'), fontFace: CODE_FONT, align: 'center' });
            arrow(slide, xs[n - 1] + bw / 2, y - 0.55, xs[n - 1] + bw / 2, y, { color: HEX.dk1 });
        }
    }
}

/*
 * Struct memory layout.  d = { fields: [{ name, size, pad, hl }], x, y, w, title,
 * marks: [{ at, label }] (arrows from below), span: { from, to, label } }
 */
function drawLayout(slide, d) {
    const total = d.fields.reduce((s, f) => s + f.size, 0);
    const scale = d.w / total;
    const bh = d.h || 0.85;
    let off = 0;
    const offsets = [0];
    if (d.title)
        text(slide, d.title, { x: d.x, y: d.y - (d.span ? 1.1 : 0.45), w: d.w, h: 0.36, fontSize: 16, bold: true, color: S('text1'), fontFace: CODE_FONT });
    for (const f of d.fields) {
        const fx = d.x + off * scale;
        const fw = f.size * scale;
        const fill = f.pad ? S('bg2') : f.hl ? S('accent1') : S('bg1');
        const label = f.pad ? 'pad' : f.name;
        const small = fw < 0.75;
        slide.addText([
            { text: label, options: { fontFace: CODE_FONT, fontSize: small ? 11 : 15, bold: !f.pad, color: f.pad ? S('accent6') : S('text1'), breakLine: true } },
            { text: `${f.size} B`, options: { fontSize: 11, color: S('text2') } },
        ], {
            shape: PRES.ShapeType.rect, x: fx, y: d.y, w: fw, h: bh, fill: { color: fill },
            line: { color: HEX.dk2, width: 1.25, dashType: f.pad ? 'dash' : 'solid' },
            align: 'center', valign: 'middle', margin: 1, objectName: `field ${label}`,
        });
        off += f.size;
        offsets.push(off);
    }
    for (const o of offsets)
        text(slide, String(o), { x: d.x + o * scale - 0.3, y: d.y + bh + 0.04, w: 0.6, h: 0.28, fontSize: 12, color: S('text2'), align: 'center', fontFace: CODE_FONT });
    for (const mk of (d.marks || [])) {
        const mx = d.x + mk.at * scale;
        arrow(slide, mx, d.y + bh + 0.95, mx, d.y + bh + 0.35, { color: HEX.accent3, width: 2 });
        text(slide, mk.label, { x: mx - 1.5, y: d.y + bh + 0.98, w: 3, h: 0.32, fontSize: 14, bold: true, color: S('accent3'), fontFace: CODE_FONT, align: 'center' });
    }
    if (d.span) {
        const sx = d.x + d.span.from * scale;
        const ex = d.x + d.span.to * scale;
        const sy = d.y - 0.22;
        arrow(slide, sx, sy, ex, sy, { color: HEX.accent2, width: 1.5 });
        arrow(slide, ex, sy, sx, sy, { color: HEX.accent2, width: 1.5 });
        text(slide, d.span.label, { x: sx, y: sy - 0.4, w: Math.max(ex - sx, 3), h: 0.32, fontSize: 14, bold: true, color: S('accent2'), fontFace: CODE_FONT, align: 'center' });
    }
}

/* Left-to-right process: d = { steps: [{ t, sub, kind: 'file'|'step' }], x, y, w, h } */
function drawFlow(slide, d) {
    const n = d.steps.length;
    const gap = d.gap || 0.45;
    const bw = (d.w - (n - 1) * gap) / n;
    const bh = d.boxH || 1.0;
    const y = d.y + (d.h - bh) / 2;
    d.steps.forEach((s, i) => {
        const x = d.x + i * (bw + gap);
        const step = s.kind !== 'file';
        slide.addText([
            { text: s.t, options: { fontSize: s.size || 16, bold: true, color: step ? S('bg1') : S('text1'), fontFace: s.code ? CODE_FONT : undefined, breakLine: !!s.sub } },
            ...(s.sub ? [{ text: s.sub, options: { fontSize: 12, color: step ? S('bg2') : S('text2') } }] : []),
        ], {
            shape: PRES.ShapeType.roundRect, rectRadius: 0.1, x, y, w: bw, h: bh,
            fill: { color: step ? S('text1') : S('bg2') }, align: 'center', valign: 'middle', margin: 4,
            objectName: `step ${plain(s.t)}`,
        });
        if (i < n - 1) arrow(slide, x + bw + 0.05, y + bh / 2, x + bw + gap - 0.05, y + bh / 2, { color: HEX.accent1, width: 2.5 });
    });
}

/* Vertical stack of memory regions: d = { regions: [{ name, desc, kind }], x, y, w, h } */
function drawRegions(slide, d) {
    const n = d.regions.length;
    const rh = d.h / n;
    const bw = d.boxW || 3.2;
    d.regions.forEach((r, i) => {
        const y = d.y + i * rh;
        const fill = r.kind === 'heap' ? S('accent2') : r.kind === 'stack' ? S('accent1') : r.kind === 'gap' ? S('bg1') : S('bg2');
        const color = r.kind === 'heap' ? S('bg1') : S('text1');
        slide.addText(r.name, {
            shape: PRES.ShapeType.rect, x: d.x, y, w: bw, h: rh, fill: { color: fill },
            line: { color: HEX.dk2, width: 1, dashType: r.kind === 'gap' ? 'dash' : 'solid' }, color,
            fontSize: 16, bold: true, align: 'center', valign: 'middle', margin: 2, objectName: `region ${r.name}`,
        });
        if (r.desc)
            text(slide, r.desc, { x: d.x + bw + 0.3, y, w: d.w - bw - 0.3, h: rh, fontSize: 15, color: S('text1'), valign: 'middle' });
    });
    if (d.high) text(slide, d.high, { x: d.x, y: d.y - 0.32, w: bw, h: 0.28, fontSize: 12, color: S('text2'), align: 'center' });
    if (d.low) text(slide, d.low, { x: d.x, y: d.y + d.h + 0.04, w: bw, h: 0.28, fontSize: 12, color: S('text2'), align: 'center' });
}

function drawDiagram(slide, d) {
    if (d.type === 'chain') drawChain(slide, d);
    else if (d.type === 'layout') drawLayout(slide, { ...d, y: d.y + (d.span ? 1.5 : 0.55), h: d.barH || 0.95 });
    else if (d.type === 'layouts') {
        // several struct layouts stacked vertically, each with its own title
        const step = d.h / d.items.length;
        d.items.forEach((it, i) => drawLayout(slide, { ...it, x: d.x, w: it.w || d.w, y: d.y + 0.5 + i * step, h: it.h || Math.min(0.85, step - 1.0) }));
    }
    else if (d.type === 'flow') drawFlow(slide, d);
    else if (d.type === 'regions') drawRegions(slide, d);
    else throw new Error(`unknown diagram ${d.type}`);
}

/* ------------------------------------------------------------------ */
/* Regions of a content slide                                          */
/* ------------------------------------------------------------------ */

/* Render one "block" (code, art, bullets, diagram, table, cards...) into a box. */
function block(slide, deck, b, box) {
    if (b == null) return;
    if (typeof b === 'string' || Array.isArray(b)) b = { bullets: Array.isArray(b) ? b : [b] };
    const { x, y, w, h } = box;
    if (b.code !== undefined || b.sh !== undefined || b.make !== undefined || b.out !== undefined || b.term !== undefined) {
        let code;
        let lang;
        if (b.term) {
            code = b.term.map(step => [`$ ${step.cmd}`].concat(step.out ? step.out.replace(/\s+$/, '').split('\n') : []).join('\n')).join('\n');
            lang = 'sh';
        } else if (b.sh !== undefined) { code = getCode(deck, b.sh); lang = 'sh'; }
        else if (b.make !== undefined) { code = getCode(deck, b.make); lang = 'make'; }
        else if (b.out !== undefined) { code = getCode(deck, b.out); lang = 'out'; }
        else { code = getCode(deck, b.code); lang = b.lang || 'c'; }
        const label = b.label === undefined ? (b.code && b.code.file ? path.basename(b.code.file) : b.term ? 'terminal' : null) : b.label;
        const top = label ? 0.32 : 0;
        const used = codePanel(slide, code, { x, y: y + top, w, h: h - top, lang, label, maxFont: b.maxFont || 20, minFont: b.minFont || 12, fitHeight: b.fitHeight !== false });
        return y + top + used - (label ? 0.3 : 0);
    } else if (b.art !== undefined) {
        return y + artPanel(slide, b.art.replace(/^\n+|\s+$/g, ''), { x, y, w, h, maxFont: b.maxFont || 20 });
    } else if (b.bullets) {
        bulletList(slide, b.bullets, { x, y, w, h, fontSize: b.size || 20, spaceAfter: b.space || 10 });
    } else if (b.diagram) {
        drawDiagram(slide, { ...b.diagram, x, y, w, h });
    } else if (b.table) {
        drawTable(slide, b.table, { x, y, w, h });
    } else if (b.cards) {
        drawCards(slide, b.cards, { x, y, w, h }, b.cols);
    } else if (b.steps) {
        drawSteps(slide, b.steps, { x, y, w, h }, b);
    } else if (b.stat) {
        drawStats(slide, b.stat, { x, y, w, h });
    } else if (b.callout) {
        return y + drawCallout(slide, b.callout, { x, y, w, h }, b.kind);
    } else {
        throw new Error(`unknown block: ${Object.keys(b).join(',')}`);
    }
    return y + h;
}

function drawTable(slide, t, box) {
    const ncol = t.head.length;
    const fs_ = t.size || 16;
    const colW = t.colW ? t.colW.map(c => c * box.w / t.colW.reduce((a, b) => a + b, 0)) : Array(ncol).fill(box.w / ncol);
    const cell = (str, opts) => ({ text: fixColors(md(str, { fontSize: fs_, color: opts.color, bold: opts.bold })), options: { ...opts } });
    const rows = [t.head.map(hd => cell(hd, { bold: true, color: S('bg1'), fill: { color: S('text1') }, valign: 'middle' }))];
    t.rows.forEach((r, ri) => rows.push(r.map((c, ci) => cell(c, {
        color: S('text1'), fill: { color: ri % 2 ? S('bg2') : S('bg1') }, valign: 'middle', bold: !!(t.boldFirst && ci === 0),
    }))));
    const lineH = fs_ * 1.2 / 72;
    const rowNeed = [t.head, ...t.rows].map(r => Math.max(...r.map((c, ci) => estimateLines(c, fs_, colW[ci] - 0.25))) * lineH + 0.16);
    const est = rowNeed.reduce((a, b) => a + b, 0);
    if (est > box.h + 0.05) warn(`table may overflow: ~${est.toFixed(2)}in in ${box.h.toFixed(2)}in`);
    const stretch = Math.min(t.stretch || 1.6, Math.max(1, box.h / est));
    slide.addTable(rows, {
        x: box.x, y: box.y, w: box.w, colW, fontSize: fs_, margin: [4, 8, 4, 8], rowH: rowNeed.map(r => r * stretch),
        border: { type: 'solid', pt: 0.75, color: 'D5DAE0' }, autoPage: false,
    });
}

function drawCards(slide, cards, box, cols) {
    const n = cards.length;
    const c = cols || (n <= 3 ? n : n === 4 ? 2 : 3);
    const r = Math.ceil(n / c);
    const cw = (box.w - (c - 1) * GAP) / c;
    let chh = (box.h - (r - 1) * GAP) / r;
    // shrink cards that hold only short text, and centre the group
    if (cards.every(cd => cd.code === undefined)) {
        const need = Math.max(...cards.map(cd => {
            const items = cd.body === undefined ? [] : Array.isArray(cd.body) ? cd.body : [cd.body];
            const fsz = cd.size || 18;
            return 0.25 + (cd.headH || 0.55) + 0.12 + estimateHeight(items, fsz, cw - 0.6 - (Array.isArray(cd.body) ? 0.4 : 0), 6) + 0.35;
        }));
        if (need < chh) chh = need;
    }
    const y0 = box.y + (box.h - (r * chh + (r - 1) * GAP)) / 2;
    cards.forEach((cd, i) => {
        const cx = box.x + (i % c) * (cw + GAP);
        const cy = y0 + Math.floor(i / c) * (chh + GAP);
        slide.addShape(PRES.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: chh, rectRadius: 0.1, fill: { color: S('bg2') }, line: { color: 'E1E5EA', width: 0.75 }, objectName: `card ${i + 1}` });
        let ty = cy + 0.25;
        let tx = cx + 0.3;
        if (cd.n !== undefined) {
            circleNumber(slide, cd.n, cx + 0.3, cy + 0.27, 0.5, S('accent1'), S('text1'));
            tx = cx + 0.95;
        }
        if (cd.tag) {
            pill(slide, cd.tag, cx + cw - 0.3 - Math.max(1.0, 0.11 * cd.tag.length + 0.45), cy + 0.3, cd.kind);
        }
        const headColor = cd.kind === 'bad' ? S('accent3') : cd.kind === 'good' ? S('accent2') : S('text1');
        const headH = cd.headH || 0.55;
        text(slide, cd.h, { x: tx, y: ty, w: cx + cw - 0.3 - tx - (cd.tag ? 1.2 : 0), h: headH, fontSize: cd.headSize || 20, bold: true, color: headColor, valign: 'middle' });
        ty += headH + 0.12;
        const bh = cy + chh - 0.2 - ty;
        if (cd.code !== undefined) {
            codePanel(slide, typeof cd.code === 'string' ? cd.code : cd.code.src, { x: cx + 0.25, y: ty, w: cw - 0.5, h: bh, lang: cd.lang || 'c', maxFont: 16, minFont: 12 });
        } else if (cd.body) {
            const items = Array.isArray(cd.body) ? cd.body : [cd.body];
            if (Array.isArray(cd.body)) bulletList(slide, items, { x: cx + 0.3, y: ty, w: cw - 0.6, h: bh, fontSize: cd.size || 18, spaceAfter: 6 });
            else {
                const est = estimateLines(cd.body, cd.size || 18, cw - 0.6) * (cd.size || 18) * 1.2 / 72;
                if (est > bh + 0.05) warn(`card ${i + 1} body may overflow`);
                text(slide, cd.body, { x: cx + 0.3, y: ty, w: cw - 0.6, h: bh, fontSize: cd.size || 18, color: S('text1') });
            }
        }
    });
}

function drawSteps(slide, steps, box, b) {
    const n = steps.length;
    const cols = b.cols || (n > 6 ? 2 : 1);
    const per = Math.ceil(n / cols);
    const colW = (box.w - (cols - 1) * GAP) / cols;
    const rowH = Math.min(b.rowH || 1.0, box.h / per);
    const fs_ = b.size || 19;
    steps.forEach((st, i) => {
        const cx = box.x + Math.floor(i / per) * (colW + GAP);
        const cy = box.y + (i % per) * rowH;
        const d = Math.min(0.5, rowH - 0.12);
        circleNumber(slide, b.start ? b.start + i : i + 1, cx, cy - 0.03, d, b.kind === 'good' ? S('accent2') : S('accent1'), b.kind === 'good' ? S('bg1') : S('text1'));
        const t = typeof st === 'string' ? st : st.t;
        const est = estimateLines(t, fs_, colW - d - 0.25) * fs_ * 1.2 / 72;
        if (est > rowH + 0.02) warn(`step ${i + 1} may overflow its row`);
        text(slide, t, { x: cx + d + 0.25, y: cy + 0.06, w: colW - d - 0.25, h: rowH - 0.1, fontSize: fs_, color: S('text1'), valign: 'top' });
    });
}

function drawStats(slide, stats, box) {
    const n = stats.length;
    const sw = (box.w - (n - 1) * GAP) / n;
    stats.forEach((st, i) => {
        const sx = box.x + i * (sw + GAP);
        slide.addShape(PRES.ShapeType.roundRect, { x: sx, y: box.y, w: sw, h: box.h, rectRadius: 0.1, fill: { color: S('bg2') }, line: { color: 'E1E5EA', width: 0.75 } });
        text(slide, st.value, { x: sx + 0.3, y: box.y + 0.25, w: sw - 0.6, h: box.h * 0.5, fontSize: st.size || 54, bold: true, color: S(st.color || 'accent5'), fontFace: st.code === false ? THEME.headFontFace : CODE_FONT, valign: 'middle' });
        text(slide, st.label, { x: sx + 0.3, y: box.y + box.h * 0.5 + 0.3, w: sw - 0.6, h: box.h * 0.5 - 0.5, fontSize: 16, color: S('text1') });
    });
}

function drawCallout(slide, str, box, kind) {
    const fill = kind === 'bad' ? 'FBE9E9' : kind === 'good' ? 'E3F4EF' : 'FDF3E3';
    const items = Array.isArray(str) ? str : [str];
    const fsz = 18;
    const need = items.length > 1 ? estimateHeight(items, fsz, box.w - 0.6, 8) + 0.5
        : estimateLines(items[0], fsz, box.w - 0.6) * fsz * 1.2 / 72 + 0.45;
    const h = Math.min(box.h, Math.max(need, 0.8));
    slide.addShape(PRES.ShapeType.roundRect, { x: box.x, y: box.y, w: box.w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: fill, width: 0.5 } });
    if (items.length > 1) bulletList(slide, items, { x: box.x + 0.3, y: box.y + 0.25, w: box.w - 0.6, h: h - 0.4, fontSize: fsz, spaceAfter: 8 });
    else text(slide, items[0], { x: box.x + 0.3, y: box.y + 0.15, w: box.w - 0.6, h: h - 0.3, fontSize: fsz, color: S('text1'), valign: 'middle' });
    return h;
}

/* ------------------------------------------------------------------ */
/* Concept cards: WHAT IT IS / WHY WE NEED IT                          */
/* ------------------------------------------------------------------ */

const CARD = {
    what: { label: 'WHAT IT IS', pill: 'info', fill: 'EEF3FC' },
    why: { label: 'WHY WE NEED IT', pill: 'bad', fill: 'FBEDED' },
};

function cardNeed(content, w) {
    const items = [].concat(content || []);
    const textH = items.length > 1 ? estimateHeight(items, 16, w - 0.5, 6)
        : estimateLines(items[0] || '', 17, w - 0.5) * 17 * 1.2 / 72;
    return 0.2 + 0.34 + 0.2 + textH + 0.25;
}

/* Draws one card; returns the height used. `h` fixes the height, otherwise it hugs the text. */
function conceptCard(slide, kind, content, box, fixedH) {
    const c = CARD[kind];
    const need = cardNeed(content, box.w);
    const h = fixedH || Math.min(box.h, need);
    if (need > h + 0.05) warn(`concept "${kind}" text may overflow: ~${need.toFixed(2)}in in ${h.toFixed(2)}in`);
    slide.addShape(PRES.ShapeType.roundRect, { x: box.x, y: box.y, w: box.w, h, rectRadius: 0.1, fill: { color: c.fill }, line: { color: c.fill, width: 0.5 }, objectName: `card ${kind}` });
    pill(slide, c.label, box.x + 0.25, box.y + 0.2, c.pill);
    const items = [].concat(content || []);
    const tb = { x: box.x + 0.25, y: box.y + 0.72, w: box.w - 0.5, h: h - 0.85 };
    if (items.length > 1) bulletList(slide, items, { ...tb, fontSize: 16, spaceAfter: 6 });
    else text(slide, items[0] || '', { ...tb, fontSize: 17, color: S('text1') });
    return h;
}

/* ------------------------------------------------------------------ */
/* Slide kinds                                                         */
/* ------------------------------------------------------------------ */

function contentSlide(deck, spec) {
    const slide = PRES.addSlide({ masterName: 'CONTENT', sectionTitle: deck.section });
    if (spec.title.length > 48) warn(`title is long (${spec.title.length} chars)`);
    slide.addText(fixColors(md(spec.title, { fontSize: 32, bold: true, color: S('text1') })), { placeholder: 'title' });
    if (spec.tag) pill(slide, spec.tag, XR - Math.max(1.0, 0.11 * spec.tag.length + 0.45), 0.6, spec.tagKind || 'ex');
    if (spec.notes) slide.addNotes(spec.notes);
    return slide;
}

/* Split the content area by a layout keyword into boxes. */
function split(layout, opts = {}) {
    const r = opts.ratio || 0.55;
    const top = opts.top || 0;          // height reserved for an intro line
    const y = Y0 + top;
    const h = CH - top - (opts.bottom || 0);
    const lw = (CW - GAP * 1.5) * r;
    switch (layout) {
        case 'full': return [{ x: X0, y, w: CW, h }];
        case 'lr': return [{ x: X0, y, w: lw, h }, { x: X0 + lw + GAP * 1.5, y, w: CW - lw - GAP * 1.5, h }];
        case 'tb': {
            const th = (h - GAP) * r;
            return [{ x: X0, y, w: CW, h: th }, { x: X0, y: y + th + GAP, w: CW, h: h - th - GAP }];
        }
        default: throw new Error(`layout ${layout}`);
    }
}

const KINDS = {
    title(deck, s) {
        const slide = PRES.addSlide({ masterName: 'TITLE', sectionTitle: deck.section });
        slide.addText(`WEEK ${String(deck.week).padStart(2, '0')}`, { placeholder: 'week' });
        slide.addText(fixColors(md(deck.title, { fontSize: 44, bold: true, color: S('bg1') }, true)), { placeholder: 'title' });
        slide.addText(fixColors(md(deck.subtitle || ' ', { fontSize: 20, color: 'C9D1D9' }, true)), { placeholder: 'body' });
        if (s.code) {
            const code = getCode(deck, s.code);
            codePanel(slide, code, { x: 7.75, y: 1.75, w: 4.95, h: 4.1, lang: s.lang || 'c', label: s.label, maxFont: 16, minFont: 11 });
        }
        if (s.notes) slide.addNotes(s.notes);
    },
    section(deck, s) {
        const slide = PRES.addSlide({ masterName: 'SECTION', sectionTitle: deck.section });
        slide.addText(s.num !== undefined ? String(s.num) : '', { placeholder: 'num' });
        slide.addText(s.label || '', { placeholder: 'label' });
        slide.addText(fixColors(md(s.title, { fontSize: 40, bold: true, color: S('bg1') }, true)), { placeholder: 'title' });
        slide.addText(fixColors(md(s.sub || ' ', { fontSize: 20, color: 'C9D1D9' }, true)), { placeholder: 'body' });
        if (s.notes) slide.addNotes(s.notes);
    },
    objectives(deck, s) {
        const slide = contentSlide(deck, { title: s.title || 'By the end of this session you can', notes: s.notes });
        block(slide, deck, { steps: s.items, cols: s.items.length > 5 ? 2 : 1, size: s.size || (s.items.length > 5 ? 17 : 20), rowH: s.rowH || (s.items.length > 5 ? 1.25 : 0.95) }, { x: X0, y: Y0 + 0.1, w: CW, h: CH - 0.1 });
    },
    /* generic content: { title, intro?, layout: 'full'|'lr'|'tb', ratio, a, b } */
    content(deck, s) {
        const slide = contentSlide(deck, s);
        let top = 0;
        if (s.intro) {
            const ih = estimateLines(s.intro, 19, CW) * 19 * 1.25 / 72 + 0.1;
            text(slide, s.intro, { x: X0, y: Y0, w: CW, h: ih, fontSize: 19, color: S('text2') });
            top = ih + 0.2;
        }
        const boxes = split(s.layout || (s.b ? 'lr' : 'full'), { ratio: s.ratio, top, bottom: s.foot ? 0.6 : 0 });
        let bottom = block(slide, deck, s.a, boxes[0]);
        if (s.b) bottom = Math.max(bottom, block(slide, deck, s.b, boxes[1]));
        if (s.foot) {
            // one line under the content
            const fy = Math.min(bottom + 0.3, YB - 0.4);
            text(slide, s.foot, { x: X0, y: fy, w: CW, h: 0.4, fontSize: 17, color: S('text2'), italic: true });
        }
    },
    compare(deck, s) {
        const slide = contentSlide(deck, s);
        let top = 0;
        if (s.intro) {
            const ih = estimateLines(s.intro, 19, CW) * 19 * 1.25 / 72 + 0.1;
            text(slide, s.intro, { x: X0, y: Y0, w: CW, h: ih, fontSize: 19, color: S('text2') });
            top = ih + 0.2;
        }
        const [l, r] = split('lr', { ratio: s.ratio || 0.5, top });
        const noteH = Math.max(...[s.left, s.right].map(sd => sd.note ? estimateLines(sd.note, 17, l.w) * 17 * 1.2 / 72 + 0.15 : 0));
        for (const [side, box] of [[s.left, l], [s.right, r]]) {
            pill(slide, side.label, box.x, box.y, side.kind);
            if (side.note)
                text(slide, side.note, { x: box.x, y: box.y + 0.5, w: box.w, h: noteH, fontSize: 17, color: S('text2') });
            const top = 0.55 + (noteH ? noteH + 0.1 : 0);
            block(slide, deck, side.body, { x: box.x, y: box.y + top, w: box.w, h: box.h - top });
        }
    },
    /*
     * A new concept: { title, what, why, how, layout: 'lr' | 'tb', ratio }.
     * what: what it is, in full sentences. why: what goes wrong without it.
     * how: a block (code from examples/, a diagram, a terminal session...).
     */
    concept(deck, s) {
        const slide = contentSlide(deck, { title: s.title, notes: s.notes, tag: 'NEW CONCEPT', tagKind: 'info' });
        for (const k of ['what', 'why', 'how'])
            if (s[k] == null) warn(`concept slide needs "${k}"`);
        for (const k of ['what', 'why']) {
            const t = [].concat(s[k] || []).map(plain).join(' ');
            if (s[k] != null && t.length < 60) warn(`concept "${k}" is only ${t.length} chars: explain it in full sentences`);
        }
        if (s.layout === 'tb') {
            const cw = (CW - GAP) / 2;
            const ch = Math.min(Math.max(cardNeed(s.what, cw), cardNeed(s.why, cw)), CH * (s.ratio || 0.5));
            conceptCard(slide, 'what', s.what, { x: X0, y: Y0, w: cw, h: ch }, ch);
            conceptCard(slide, 'why', s.why, { x: X0 + cw + GAP, y: Y0, w: cw, h: ch }, ch);
            const hy = Y0 + ch + 0.25;
            pill(slide, 'HOW IT WORKS', X0, hy, 'good');
            block(slide, deck, s.how, { x: X0, y: hy + 0.5, w: CW, h: YB - hy - 0.5 });
        } else {
            const lw = (CW - GAP * 1.5) * (s.ratio || 0.5);
            const rx = X0 + lw + GAP * 1.5;
            const h1 = conceptCard(slide, 'what', s.what, { x: X0, y: Y0, w: lw, h: CH });
            conceptCard(slide, 'why', s.why, { x: X0, y: Y0 + h1 + 0.25, w: lw, h: CH - h1 - 0.25 });
            pill(slide, 'HOW IT WORKS', rx, Y0, 'good');
            block(slide, deck, s.how, { x: rx, y: Y0 + 0.5, w: CW - lw - GAP * 1.5, h: CH - 0.5 });
        }
    },
    demo(deck, s) {
        s = { ...s, tag: s.tag || 'LIVE DEMO', tagKind: 'demo' };
        KINDS.content(deck, s);
    },
    exercise(deck, s) {
        s = { ...s, tag: s.tag || `EXERCISE · ${s.minutes || 5} MIN`, tagKind: 'ex' };
        KINDS.content(deck, s);
    },
    answer(deck, s) {
        s = { ...s, tag: 'ANSWER', tagKind: 'good' };
        KINDS.content(deck, s);
    },
    review(deck, s) {
        const slide = contentSlide(deck, { title: s.title || 'Review', tag: 'WARM-UP', tagKind: 'ex', notes: s.notes });
        const n = s.questions.length;
        const rowH = s.rowH || Math.min(0.9, (CH - (s.today ? 1.2 : 0)) / n);
        block(slide, deck, { steps: s.questions, size: s.size || 19, rowH }, { x: X0, y: Y0 + 0.05, w: CW, h: rowH * n });
        if (s.today) drawCallout(slide, s.today, { x: X0, y: Y0 + 0.25 + rowH * n, w: CW, h: 1.1 });
    },
    quiz(deck, s) {
        const slide = contentSlide(deck, { title: s.title || 'Exit quiz', tag: 'QUIZ', tagKind: 'ex', notes: s.notes });
        block(slide, deck, { steps: s.questions, size: s.size || 19, rowH: s.rowH || Math.min(1.0, CH / s.questions.length) }, { x: X0, y: Y0 + 0.05, w: CW, h: CH - 0.05 });
    },
    answers(deck, s) {
        const slide = contentSlide(deck, { title: s.title || 'Exit quiz — answers', tag: 'ANSWERS', tagKind: 'good', notes: s.notes });
        block(slide, deck, { steps: s.answers, size: s.size || 17, rowH: s.rowH || Math.min(1.0, CH / s.answers.length), kind: 'good' }, { x: X0, y: Y0 + 0.05, w: CW, h: CH - 0.05 });
    },
    takeaways(deck, s) {
        const slide = contentSlide(deck, { title: s.title || 'Key takeaways', notes: s.notes });
        block(slide, deck, { steps: s.items, size: s.size || 19, rowH: s.rowH || Math.min(0.95, CH / s.items.length), kind: 'good' }, { x: X0, y: Y0 + 0.05, w: CW, h: CH - 0.05 });
    },
    next(deck, s) {
        const slide = PRES.addSlide({ masterName: 'SECTION', sectionTitle: deck.section });
        slide.addText('→', { placeholder: 'num' });
        slide.addText('NEXT WEEK', { placeholder: 'label' });
        slide.addText(fixColors(md(s.title, { fontSize: 40, bold: true, color: S('bg1') }, true)), { placeholder: 'title' });
        slide.addText(fixColors(md(s.sub || ' ', { fontSize: 20, color: 'C9D1D9' }, true)), { placeholder: 'body' });
        if (s.notes) slide.addNotes(s.notes);
    },
};

/* ------------------------------------------------------------------ */
/* Layouts (slide masters in pptxgenjs terms)                          */
/* ------------------------------------------------------------------ */

function defineLayouts(deck) {
    const footer = `C Programming — Linked Lists   ·   Week ${String(deck.week).padStart(2, '0')}: ${plain(deck.short || deck.title)}`;
    PRES.defineSlideMaster({
        title: 'TITLE',
        background: { color: DARK_BG },
        objects: [
            { placeholder: { options: { name: 'week', type: 'body', x: X0 + 0.2, y: 1.6, w: 6.5, h: 0.5, fontSize: 20, bold: true, color: S('accent1'), charSpacing: 4, margin: 0, valign: 'middle' }, text: 'WEEK' } },
            { placeholder: { options: { name: 'title', type: 'title', x: X0 + 0.2, y: 2.2, w: 6.6, h: 2.3, fontSize: 44, bold: true, color: S('bg1'), margin: 0, valign: 'top', align: 'left' }, text: 'Title' } },
            { placeholder: { options: { name: 'body', type: 'body', x: X0 + 0.2, y: 4.6, w: 6.6, h: 1.3, fontSize: 20, color: 'C9D1D9', margin: 0, valign: 'top' }, text: 'Subtitle' } },
            { text: { text: 'C Programming — Linked Lists', options: { x: X0 + 0.2, y: 6.6, w: 8, h: 0.35, fontSize: 14, color: '8B949E', margin: 0 } } },
        ],
    });
    PRES.defineSlideMaster({
        title: 'SECTION',
        background: { color: DARK_BG },
        objects: [
            { placeholder: { options: { name: 'num', type: 'body', x: X0 + 0.2, y: 2.0, w: 2.4, h: 2.6, fontSize: 150, bold: true, color: S('accent1'), margin: 0, valign: 'middle', align: 'left' }, text: '1' } },
            { placeholder: { options: { name: 'label', type: 'body', x: 3.4, y: 2.35, w: 9.2, h: 0.45, fontSize: 18, bold: true, color: S('accent1'), charSpacing: 3, margin: 0, valign: 'middle' }, text: 'PART' } },
            { placeholder: { options: { name: 'title', type: 'title', x: 3.4, y: 2.85, w: 9.2, h: 1.5, fontSize: 40, bold: true, color: S('bg1'), margin: 0, valign: 'top', align: 'left' }, text: 'Section' } },
            { placeholder: { options: { name: 'body', type: 'body', x: 3.4, y: 4.4, w: 9.2, h: 1.2, fontSize: 20, color: 'C9D1D9', margin: 0, valign: 'top' }, text: '' } },
            { text: { text: footer, options: { x: X0, y: 6.95, w: 10, h: 0.3, fontSize: 10, color: '8B949E', margin: 0 } } },
        ],
        slideNumber: { x: XR - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: '8B949E', align: 'right' },
    });
    PRES.defineSlideMaster({
        title: 'CONTENT',
        background: { color: 'FFFFFF' },
        objects: [
            { placeholder: { options: { name: 'title', type: 'title', x: X0, y: 0.38, w: CW - 2.6, h: 0.78, fontSize: 32, bold: true, color: S('text1'), margin: 0, valign: 'middle', align: 'left' }, text: 'Title' } },
            { text: { text: footer, options: { x: X0, y: 6.95, w: 10, h: 0.3, fontSize: 10, color: '8B949E', margin: 0 } } },
        ],
        slideNumber: { x: XR - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: '8B949E', align: 'right' },
    });
}

/* ------------------------------------------------------------------ */
/* Theme colours (pptxgenjs writes Office's palette; replace it)       */
/* ------------------------------------------------------------------ */

async function writeTheme(file) {
    const zip = await JSZip.loadAsync(fs.readFileSync(file));
    const part = 'ppt/theme/theme1.xml';
    const slots = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
    const scheme = `<a:clrScheme name="${THEME.name}">` + slots.map(k => `<a:${k}><a:srgbClr val="${HEX[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
    let xml = await zip.file(part).async('string');
    xml = xml.replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
        .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${THEME.name}"`);
    zip.file(part, xml);
    for (const name of Object.keys(zip.files)) {
        if (!name.endsWith('.xml')) continue;
        const bad = (await zip.file(name).async('string')).match(/<a:srgbClr val="((?![0-9A-Fa-f]{6}")[^"]*)"/);
        if (bad) throw new Error(`${name}: colour "${bad[1]}" is not hex (a scheme colour in a hex-only option)`);
    }
    fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

async function buildDeck(id) {
    const deck = require(path.join(__dirname, 'content', `${id}.js`));
    deck.dir = path.join(LECTURES, deck.dirName);
    PRES = new PptxGenJS();
    SCH = PRES.SchemeColor;
    PRES.layout = 'LAYOUT_WIDE';
    PRES.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
    PRES.title = `Week ${String(deck.week).padStart(2, '0')} — ${plain(deck.title)}`;
    PRES.subject = 'C Programming — Linked Lists';
    PRES.author = 'C Programming — Linked Lists';
    defineLayouts(deck);
    warnings = [];
    let n = 0;
    for (const s of deck.slides) {
        n++;
        currentSlideLabel = `${id} #${n} ${s.kind}${s.title ? ': ' + plain(s.title).slice(0, 40) : ''}`;
        if (s.newSection) {
            deck.section = s.newSection;
            PRES.addSection({ title: s.newSection });
        }
        const fn = KINDS[s.kind];
        if (!fn) throw new Error(`${currentSlideLabel}: unknown slide kind`);
        fn(deck, s);
    }
    const out = path.join(deck.dir, `${id}-slides.pptx`);
    await PRES.writeFile({ fileName: out });
    await writeTheme(out);
    console.log(`${path.relative(REPO, out)}: ${n} slides`);
    if (warnings.length) console.log(warnings.join('\n'));
    return warnings.length;
}

function blockKind(b) {
    if (!b) return '';
    if (typeof b === 'string' || Array.isArray(b) || b.bullets) return 'bullets';
    if (b.code && b.code.file) return `code (${path.basename(b.code.file)})`;
    for (const k of ['code', 'make', 'sh', 'out', 'term', 'art', 'diagram', 'table', 'cards', 'steps', 'stat', 'callout'])
        if (b[k] !== undefined) return k === 'diagram' ? `diagram (${b.diagram.type})` : k === 'term' ? 'terminal' : k;
    return '';
}

/* lectures/slides/CONCEPTS.md: every concept slide of every deck, by slide number. */
function writeConceptIndex() {
    const files = fs.readdirSync(path.join(__dirname, 'content')).filter(f => /^week\d\d\.js$/.test(f)).sort();
    const out = ['# Concept Index', '',
        'Every new concept in the lecture decks has a **concept slide** with three parts: what it is, why it is needed (what goes wrong without it), and how it works (code or an example). This index is generated by `build.js`; slide numbers refer to `weekNN-slides.pptx`.', ''];
    let total = 0;
    for (const f of files) {
        const p = path.join(__dirname, 'content', f);
        delete require.cache[require.resolve(p)];
        const deck = require(p);
        const rows = [];
        deck.slides.forEach((s, i) => {
            if (s.kind !== 'concept') return;
            const why = plain([].concat(s.why || []).join(' ')).replace(/\s+/g, ' ').trim();
            const first = (why.match(/^.*?\S[.!?](\s|$)/) || [why])[0].trim();
            rows.push(`| ${i + 1} | ${plain(s.concept || s.title).replace(/\|/g, '\\|')} | ${first.replace(/\|/g, '\\|')} | ${blockKind(s.how)} |`);
        });
        total += rows.length;
        out.push(`## Week ${String(deck.week).padStart(2, '0')} — ${plain(deck.title)}`, '',
            `[\`${f.slice(0, -3)}-slides.pptx\`](../${deck.dirName}/${f.slice(0, -3)}-slides.pptx): ${deck.slides.length} slides, ${rows.length} concepts.`, '',
            '| Slide | Concept | Why it is needed | How it is shown |', '|---:|---|---|---|', ...rows, '');
    }
    fs.writeFileSync(path.join(__dirname, 'CONCEPTS.md'), out.join('\n'));
    console.log(`lectures/slides/CONCEPTS.md: ${total} concepts`);
}

async function main() {
    const args = process.argv.slice(2);
    const ids = args.length ? args : fs.readdirSync(path.join(__dirname, 'content')).filter(f => /^week\d\d\.js$/.test(f)).map(f => f.slice(0, -3)).sort();
    let total = 0;
    for (const id of ids) total += await buildDeck(id);
    writeConceptIndex();
    if (total) console.log(`${total} warning(s)`);
}

main().catch(e => {
    console.error(e.stack || e.message);
    process.exit(1);
});
