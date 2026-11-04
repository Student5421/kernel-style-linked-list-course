# Slide Generator

The lecture decks (`lectures/weekNN-*/weekNN-slides.pptx`) are generated from the files in [`content/`](content/). Code on the slides is read directly from each week's `examples/` and `assignments/` files, so the slides always show code that builds.

You can edit a generated `.pptx` directly in PowerPoint. Rebuilding overwrites it, so either keep your edits in PowerPoint or make them in `content/weekNN.js` and rebuild.

## Rebuild

```bash
cd lectures/slides
npm install              # once; needs Node.js
node build.js            # every week
node build.js week03     # one week
```

The build prints a warning for any slide whose code or text is likely to overflow.

## Writing a slide

Each `content/weekNN.js` exports the deck's metadata and a list of slides. A slide is one of these kinds:

| Kind | Use |
|---|---|
| `title`, `section`, `next` | dark title slide, part divider, next-week slide |
| `objectives`, `review` | learning objectives, warm-up questions |
| `content`, `demo`, `exercise`, `answer` | one or two blocks side by side (`layout: 'lr'`) or stacked (`layout: 'tb'`) |
| `compare` | two labeled columns, e.g. WRONG vs RIGHT |
| `takeaways`, `quiz`, `answers` | wrap-up |

A block is code (`code`, `make`, `sh`, `out`, `term`), `bullets`, `table`, `cards`, `steps`, `stat`, `callout`, `art` (ASCII diagram), or a drawn `diagram` (`chain`, `layout`, `layouts`, `flow`, `regions`). Code can be inline or taken from a file:

```js
{ code: { file: 'examples/sll_book.c', fn: 'push_front', comment: true } }
{ code: { file: 'examples/sll_book.c', struct: 'node' } }
{ make: { file: '/assignments/week08-final-project/starter/Makefile', lines: [1, 18] } }
```

See [`content/week01.js`](content/week01.js) for a complete deck.
