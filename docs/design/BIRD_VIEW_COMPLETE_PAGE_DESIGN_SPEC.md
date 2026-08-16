# Complete Bird View Page UX/UI Design Specification

## Primary instruction for Antigravity

Design the **entire Bird View page** as the primary operational workspace of MyAcademy. The design must include the complete page canvas and both collapsed and expanded Task/Query ticket experiences.

Use the existing Bird View and the previously approved Royal Academic Ledger ticket direction as the reference. This is an evolution of the current page, not permission to replace the matrix with a generic dashboard, Kanban board, or unrelated card layout.

### Read before designing or implementing

1. `AGENTS.md`.
2. `.agents/AGENTS.md` in full, especially every focused Bird View and Safari rule.
3. `docs/design/MYACADEMY_WHOLE_APPLICATION_DESIGN_SPEC.md`.
4. `docs/design/BIRD_VIEW_TICKET_DESIGN_SPEC.md`.
5. `src/app/(dashboard)/bird-view/page.tsx`.
6. `src/components/TaskComments.tsx`.
7. The relevant installed Next.js 16 documentation before changing Next.js code.

### Authority and conflict-resolution order

When references disagree, use this order without guessing:

1. The latest focused Bird View rules in `.agents/AGENTS.md` for mandatory engineering and interaction invariants.
2. Current source code, API routes, and returned data for factual capability and payload truth. Current source wins over dated deep-audit prose when the code has since changed.
3. This complete-page specification for the target page, toolbar, board, modes, states, and overlay integration.
4. `docs/design/BIRD_VIEW_TICKET_DESIGN_SPEC.md` for ticket detail where it does not conflict with items 1-3.
5. `docs/design/MYACADEMY_WHOLE_APPLICATION_DESIGN_SPEC.md` for the shared shell and Royal Academic Ledger language.

The latest focused rules supersede older recommendations for a 720-760px ticket, 96px narrow Grid columns, or blocked Absent/Leave cells. The current requirements are a **640px maximum expanded ticket**, an explicit **80px + visible Students x 120px** table, and clickable Absent/Leave cells for view or permitted override.

### Expected action

- Produce a high-fidelity whole-page Bird View design or implement it without changing unrelated business logic.
- Demonstrate the page at its real operational density with many students and subjects.
- Show Task and Query modes.
- Show Grid and Stacked layouts.
- Show the compact ticket and expanded ticket in context, not only as isolated cards.
- Show loading, error, empty, filtered, selected, focused, batch, edit, drag/drop, absent/leave, multiple-record, saving, and failure states.
- Preserve all user-owned changes and the engineering constraints documented in `.agents/AGENTS.md`.
- Do not invent unsupported Query actions, role permissions, analytics, or backend data.

---

## 1. Design scope

### Included

- Bird View page header and workspace frame.
- Task/Query mode switch.
- Grid/Stacked layout switch.
- Status and work-type filters.
- Batch selection.
- Date navigation and calendar.
- Student category/visibility picker.
- Student search.
- Student column and Subject row headers.
- Assigned, unassigned, empty, occupied, filtered, absent, and leave cells.
- Compact Task tickets.
- Compact Query tickets.
- Multiple records in one cell.
- Expanded Task ticket.
- Expanded Query ticket.
- Contextual Task/Query entry modal.
- Attachments, cropper, image preview, comments, replies, marks, status/type, reschedule, delete, and Undo presentation.
- Grid edit mode, keyboard crosshair, batch mode, row/column reorder, Task move/clone, and drop states.
- Loading, request failure, stale/refresh, saving, mutation failure, and success feedback.
- Desktop, narrow-screen, keyboard, touch, accessibility, Safari, and performance requirements.

### Excluded

- Replacing the application shell.
- Replacing the matrix with charts or summary cards.
- Changing route URLs.
- Changing APIs, database schema, role permissions, or task/query workflow unless separately requested.
- Creating a new analytics dashboard.
- Inventing Query capabilities currently unsupported by the application.
- Rewriting Bird View as part of a broad refactor without staged review.

---

## 2. Previous design as the reference

The existing page establishes the core product identity and must remain recognisable.

### Preserve from the current page

- Full-canvas subject-by-student matrix.
- Compact dark control ribbon above the grid.
- Task/Query toggle.
- Grid/Stacked toggle.
- Date-centred daily workflow.
- Student visibility and search controls.
- Sticky Student header row.
- Sticky Subject column.
- Fixed 120px Student columns and 120px board rows at every supported viewport.
- Horizontal board navigation on narrow screens instead of compressed cells.
- Circular Student initials and names.
- Active-task count near the Student identity.
- Subject abbreviations in the left column.
- Fine grid borders.
- Striped unassigned cells.
- Clearly stamped absent/leave columns.
- Selected Student/Subject crosshair highlighting.
- Compact Task information in each occupied cell.
- Centred expanded ticket over the grid.
- Reporter, attachment, comment, work-type, status, and marks information.
- Grid and Stacked workflows.
- Existing keyboard, drag, reorder, copy, delete/Undo, and batch concepts.

### Refine without losing the reference

- Use the approved ink/emerald/brass/ivory palette consistently.
- Replace excessively rounded controls with sharp 2-6px corners.
- Make toolbar grouping clearer.
- Make compact cards self-explanatory without increasing cell size.
- Indicate additional hidden records.
- Make Query cards useful, not status-only.
- Give the expanded ticket a complete header, Close action, hierarchy, and save state.
- Replace unlabelled plus controls with named actions.
- Unify all dialogs, menus, calendars, toasts, and confirmations.
- Make failure and retry states visible.
- Keep accessibility and touch alternatives equal to mouse interactions.

### Do not transform the reference into

- A conventional analytics dashboard.
- A wide Kanban board.
- A collection of large rounded cards.
- A pastel classroom app.
- A glassmorphic interface.
- A decorative royal theme with crests and gold ornament on every element.

---

## 3. Bird View design concept

### Name

**Royal Academic Operations Grid**

It extends the application's Royal Academic Ledger design system into the most important and highest-density workspace.

### Design personality

- Precise.
- Fast.
- Formal.
- Academic.
- Calm under density.
- Keyboard-friendly.
- Self-explanatory.

### Page colour tokens

| Token | Value | Use |
|---|---:|---|
| `bird.ink` | `#172238` | Strong text, toolbar foundation |
| `bird.emerald` | `#124D45` | Academic identity and primary selection |
| `bird.brass` | `#B48632` | Active mode, selected ticket, important accent |
| `bird.ivory` | `#FFFEFA` | Grid and ticket surface |
| `bird.parchment` | `#F4F1E9` | Footer rows, soft secondary surfaces |
| `bird.canvas` | `#ECE8DE` | Outer workspace background |
| `bird.border` | `#D8D2C5` | Grid lines and controls |
| `bird.muted` | `#687286` | Supporting text/icons |
| `bird.focus` | `#2463EB` | Keyboard focus only |
| `bird.success` | `#26705A` | Done/present/success |
| `bird.warning` | `#9A6818` | Pending/late/reschedule |
| `bird.danger` | `#A33B3B` | Absent/error/delete |
| `bird.leave` | `#71558A` | Leave state |
| `bird.info` | `#365D7A` | In progress and neutral information |

### Typography

Use Inter throughout Bird View.

| Element | Size |
|---|---|
| Workspace title | `18-20px / 24px`, semibold |
| Toolbar control | `10-11px / 14px`, semibold |
| Student name | `10-11px / 14px`, semibold |
| Subject code | `11-12px / 16px`, semibold |
| Compact ticket | Follow ticket specification; meaningful text minimum 10px |
| Expanded ticket | `10px` labels, `12-13px` values, `17px` title |
| Metadata | `9.5-10px / 13px` |

Use tabular numerals for dates, task counts, comment/attachment counts, marks, and record indexes.

### Shape and elevation

- Grid container: 4px radius.
- Toolbar: 3-4px radius only at the outer boundary.
- Toolbar controls: 2-3px radius.
- Compact ticket: 2px radius.
- Expanded modal: 6px radius.
- Tags: 2px radius.
- Grid and cards use borders before shadows.
- Only overlays, active drag previews, and menus receive material shadows.

---

## 4. Whole-page anatomy and geometry

### Application shell context

- Show Bird View inside the shared application shell, not as a detached full-browser mockup.
- Preserve the existing compact top navigation height of approximately 48px and the shared Sidebar behaviour defined in the whole-application specification.
- Desktop canvas begins after the shared collapsed/expanded Sidebar offset; do not add a second card-like page margin around the board.
- On mobile, the Sidebar remains an overlay/drawer while the Bird View board retains its own two-axis scroll.
- Centre primary dialogs against the visible viewport/content area, not against the full calculated table width.
- Opening or closing the Sidebar must not redistribute the fixed 80px/120px board columns.

### Desktop page anatomy

```text
┌ Application top bar ────────────────────────────────────────────────────┐
│ Menu                         Bird View                          Profile │
├ Bird View control ribbon ───────────────────────────────────────────────┤
│ Task Query | Grid Stacked | Status Type | Batch | Date | Students | 🔍 │
├ Sticky Student headers ─────────────────────────────────────────────────┤
│ Subjects │ Student 1 │ Student 2 │ Student 3 │ ...                     │
├──────────┼───────────┼───────────┼───────────┼─────────────────────────┤
│ MATH     │ Ticket    │ Ticket    │ Empty     │ ...                     │
│ ENG      │ Ticket    │ Empty     │ Ticket    │ ...                     │
│ HIS      │ Empty     │ Ticket    │ Empty     │ ...                     │
│ ...      │ ...       │ ...       │ ...       │                         │
└──────────┴───────────┴───────────┴───────────┴─────────────────────────┘
```

### Vertical sizing

- Application top bar follows the whole-application specification.
- Control ribbon target height: `38-42px` desktop.
- Student header target height: approximately `88-96px` desktop and `72-80px` narrow.
- Subject/Student cell size remains `120 x 120px` desktop.
- Narrow screens retain 120px Student columns and 120px board rows; do not compress the approved ticket geometry.
- Grid fills the remaining viewport height.
- Horizontal and vertical scroll occur inside the grid canvas.

### Horizontal sizing

- Subject column: exactly `80px` at every supported viewport.
- Student column: exactly `120px` at every supported viewport.
- Table width is explicitly `80px + (visible Student count x 120px)`.
- Do not use flexible table width classes that allow Safari to redistribute columns.

### Workspace surface

- Grid surface: ivory.
- Outer canvas: parchment/canvas.
- One fine border around the grid.
- Avoid a large rounded white card with excessive page padding.
- Bird View is a controlled full-bleed exception inside the application shell.

### Layering

Define and preserve a clear layer order:

1. Board and Grid cells: base layer.
2. Crosshair/selection overlays inside cell wrappers: local cell layer.
3. Sticky Student row: `z-index: 20`; sticky Subject rail/corner: `z-index: 30`.
4. Toolbar and its menus/pickers: approximately `z-index: 300`.
5. Batch action bar and page feedback: approximately `z-index: 500`.
6. Contextual entry modal: approximately `z-index: 8000`, or close/suspend the owning ticket before opening it.
7. Expanded ticket: `z-index: 9000`.
8. Ticket-owned reschedule/delete confirmations: `z-index: 9500` or higher than their owning surface.
9. Attachment choice: explicit `z-index: 9500`; cropper/full preview: explicit `z-index: 10000`, matching the focused Bird View rule.

Never allow the Add Task/Query form to open behind the expanded ticket.

---

## 5. Page title and control ribbon

### Workspace title

- Keep `Bird View` as the visible page identity, centred or compositionally balanced as in the current reference.
- Use ink/emerald text rather than a large decorative title.
- Profile remains visually quiet on the right.
- Avoid duplicating a second large page title inside the canvas.

### Control-ribbon surface

- Background: `bird.ink` or the existing deep custom teal refined toward ink.
- Fine emerald or brass lower rule.
- Compact height and no unnecessary shadows.
- Controls align to an 8px spacing system.
- Use 1px group separators at low opacity.

### Recommended desktop order

```text
[TASK | QUERY]  |  [GRID | STACKED]  |  [STATUS ▾] [TYPE ▾]
| [BATCH] | [‹] [23 JUL 2026] [›] | [STUDENTS ▾] [Search student...] [?]
```

### Group A: Task/Query mode

- Sharp two-option segmented control.
- Active mode uses brass fill or brass-tinted surface and high-contrast ink/ivory text.
- Mode name is always visible.
- Mode change clearly refreshes the grid.
- Query mode hides or disables Task Type with a short explanation; do not leave an irrelevant active type filter silently filtering Query results.

### Group B: Grid/Stacked layout

- Grid icon + `Grid`.
- Stacked icon + `Stacked`.
- Active option uses a light ivory surface and ink text.
- Switching layouts preserves date, visible Students, and compatible filters.
- Edit coordinates and grid-only states must not remain active invisibly in Stacked mode.

### Group C: Status and Type filters

- Triggers display current value: `Status: All`, `Type: All`.
- Complete names appear in the menu.
- Selected option includes check icon and text.
- Menu supports Arrow keys, Enter/Space, Escape, and returns focus to trigger.
- Opening one menu closes conflicting menus.
- `Clear filters` appears when one or more filters are active.

### Group D: Batch mode

- Label: `Batch select`.
- Checked state is visible through more than colour.
- When active with zero selection, show subtle instruction: `Select task cards`.
- Query mode exposes Batch only if supported by the current Query workflow.

### Group E: Date navigation

- Previous-day button.
- Current selected date button.
- Next-day button.
- Today shortcut or clearly supported keyboard shortcut.
- Date button shows readable date, not only `Yesterday` when a concrete date is needed.
- Optional relative word may supplement the date: `Yesterday · 22 Jul`.
- Calendar uses real calendar keyboard movement and maintains visible month synchronization.

### Group F: Student visibility

- Trigger displays `Students` plus visible/total count.
- Picker contains category tabs: All, O Levels, Matric, Junior.
- Include Select all/Deselect all.
- Each Student row shows initials, full name, class, and checkbox.
- Use a scrollable list with search when large.
- Picker has a visible empty state and preserves the order used in the grid.

### Group G: Student search

- Width: `160-200px` desktop, flexible on narrower layouts.
- Placeholder: `Search students`.
- Clear button appears when text exists.
- Search result count may be announced without adding a large badge.
- Keyboard shortcut remains discoverable through tooltip/help.

### Keyboard help

- Add a compact labelled Help/shortcut trigger to the toolbar or overflow.
- It opens a reference panel listing the existing Bird View shortcuts.
- This is help for existing behaviour, not a new command system.

### Narrow-toolbar behaviour

- Keep Task/Query, date, and search immediately visible.
- Move less frequent filters, Student visibility, and Batch into an overflow/filter sheet where necessary.
- Do not allow the ribbon to clip controls outside the viewport.
- Do not reduce labels below legible size to force everything onto one line.

---

## 6. Student header design

### Anatomy

```text
     ABSENT / LEAVE when applicable
            [ HJ ]  3
        HASSAN JAWAD
```

- Initials avatar: `28-32px` desktop, `24-28px` narrow.
- Full Student name: one line, ellipsized, complete name in tooltip/accessibility label.
- Active record count: compact count attached to identity, with complete accessible meaning.
- Header is centred and quiet enough not to compete with ticket content.

### Attendance state

- Absent: oxblood label/icon and subtle avatar ring.
- Leave: muted-plum label/icon and subtle avatar ring.
- Do not use infinite pulsing.
- Attendance label is readable text, not only a coloured ring.
- The corresponding column receives the page's absent/leave treatment.
- Cells remain clickable where existing override/view behaviour requires it.

### Highlight and focus

- Selected Student column: very faint emerald/ink tint through an overlay from the inner wrappers.
- Keyboard focus on header: visible focus-blue outline.
- Active crosshair and selected ticket use different visual channels.

### Column reorder

- Reorder handle/affordance appears on hover/focus or in edit/reorder mode.
- Drag preview shows avatar and full name.
- Insertion point uses a 2px brass/emerald line between columns.
- Absent/leave restrictions follow current behaviour.
- Persisted order remains local to the current browser as currently supported.

---

## 7. Subject header design

### Anatomy

- Fixed `80px` at every supported viewport.
- Show Subject code when available.
- Full Subject name appears in tooltip/accessibility label.
- Centre aligned, semibold, `11-12px`.
- Avoid wrapping codes into unreadable fragments.

### Interaction

- Clicking highlights the Subject row according to existing behaviour.
- Keyboard focus uses focus blue.
- Reorder handle appears in reorder/edit context.
- Drag preview identifies the Subject and shows which Student assignments exist.
- Insertion point is a 2px line between rows.

### Sticky corner

- Top-left corner is an ivory/soft-canvas cell with the same sticky elevation as headers.
- It compactly labels both axes: `STUDENTS` toward the columns and `SUBJECTS` toward the rows, with accessible arrow/icon treatment.
- Do not place a primary action in this tiny corner.

---

## 8. Grid cell state system

Interactive styling must be applied to the full-size inner cell wrapper, never directly to `td` or `th`.

### Assigned empty cell

Default:

- Ivory or nearly white surface.
- Fine grid border.
- No permanent oversized plus.

Hover/focus/edit-active:

- Subtle brass dashed inset boundary.
- Label `+ Add task` or `+ Add query` according to active mode.
- Accessible name includes Student and Subject.

### Unassigned cell

- Subtle diagonal neutral hatching.
- Lower contrast than absent/leave.
- Non-creating interaction.
- Accessible description: `{Student} is not assigned to {Subject}`.
- Do not make it look like a loading/error state.

### Occupied cell

- Contains the compact record card.
- Cell background remains neutral; card carries semantic state.
- Multiple records show an explicit additional count.
- Clicking opens the active/representative record group.

### Absent cell

- Pale oxblood diagonal pattern and readable `ABSENT` stamp.
- Pattern remains behind content where existing tasks are still viewable.
- Do not disable required view/override clicks.
- Creation should show the existing attendance warning rather than silently proceeding without context.

### Leave cell

- Pale muted-plum diagonal pattern and readable `LEAVE` stamp.
- Same interaction policy as Absent according to current rules.

### Filtered cell

- A filter may hide records without turning the cell into a genuine empty-create state.
- Do not imply `Add task` merely because all existing records are filtered out.
- Where necessary, show a quiet filtered indicator or keep the empty cell non-creating until the user explicitly enters create mode.

### Crosshair-highlight cell

- Row/column crosshair uses a very faint overlay.
- Active keyboard cell adds an internal 2px focus indicator.
- Do not use the same brass border as an opened ticket.

### Batch-selected cell/ticket

- Square check marker.
- Selection tint independent from status.
- Selected count updates in the batch action bar.

### Drag source

- Card opacity approximately 70-75%.
- Original position keeps a restrained placeholder.

### Valid drop target

- Inset emerald outline and a small `Move here` or `Copy here` cue.
- Modifier-copy target uses plus/copy icon.

### Invalid drop target

- Prohibited cursor/icon and muted oxblood outline.
- Reason available through tooltip/accessibility description.

---

## 9. Compact Task ticket

The detailed visual reference is `docs/design/BIRD_VIEW_TICKET_DESIGN_SPEC.md`, subject to the authority order at the top of this document. The whole-page design must show it at the real 120px Grid scale.

### Reference anatomy

```text
┌─────────────────────────────┐
│ ○ OPEN               8 / 10 │
│ Trigonometry Ratios     +2  │
│ Unknown angles in right...  │
│ Review exercise to complete │
│ RR   Attach 1  Talk 2  HOME │
└─────────────────────────────┘
```

### Required hierarchy

1. Semantic status rail.
2. Status icon/label.
3. Marks as `earned/total` when relevant.
4. Derived meaningful title.
5. Secondary academic context.
6. Description preview when not duplicated.
7. Reporter.
8. Attachment count.
9. Comment count.
10. Complete short work-type label.
11. Additional-task count when present.

### Content fallback

Use Topic, then Chapter, then Description, then `Untitled task` as the primary title. Never prioritise empty `Ch: -` or `Tp: -` placeholders.

### Status treatment

- Every Task card has an exact `3px` left status rail.
- `OPEN`: `#124D45` emerald rail and outlined-circle icon.
- `WORKING` / stored `IN_PROGRESS`: `#B48632` brass rail and progress icon.
- `DONE`: `#26705A` success rail and check icon.
- `PENDING`: `#9A6818` amber rail and clock icon.
- Rescheduled record: calendar-arrow plus readable destination date/context.
- Work-type labels are written as `TUITION`, `HOME`, `CLASS`, `TEST`, or `PROJECT`; do not reduce them to unexplained initials.

Status is never whole-card colour only.

### Selected/focused/opened distinctions

- Opened ticket: brass corner/brass border.
- Batch selected: square check marker and batch tint.
- Keyboard focus: focus-blue outer ring.
- Dragging: opacity and drag shadow.
- These states may coexist without becoming visually ambiguous.

---

## 10. Compact Query ticket

Query mode needs a purpose-built compact card rather than a Task card with most content removed. The current-contract card must remain honest about the limited Bird View Query payload.

### Anatomy

```text
┌─────────────────────────────┐
│ ? QUERY          OPEN    +1 │
│ Mathematics                 │  <- Stacked mode only
│                             │
│                    Attach 2 │
└─────────────────────────────┘
```

### Priority

1. `QUERY` record identity.
2. Full supported status.
3. Subject context only where the row does not already supply it.
4. Attachment count.
5. Additional-query count.

After a detail contract is added and a complete Query record can actually be fetched, a separate enhanced variant may add statement, academic location, and Teacher according to real data. Do not reserve fake blank labels for data the current payload does not contain.

### Query status

- Use the actual Query status vocabulary and casing supported by current code.
- Done: success check and subdued card.
- Open/pending states retain attention without using the Task work-type system.
- Do not show Task Type in Query mode.

### Capability rule

Do not expose Task-only drag, batch, quick-plus, comments, reschedule, or generic Task-shaped update behaviour in Query mode unless the Bird View Query workflow genuinely supports it end to end. The generic Query route now provides field-level PATCH and DELETE, but that endpoint existence alone does not prove Bird View UX, permissions, wording, optimistic rollback, or Batch semantics. Visual parity must not falsely advertise functional parity.

The current Bird View Query payload does not provide the full Query statement, Teacher, Page, or discussion data. In the current-contract design, show only information actually available: `QUERY`, full status, attachment count, Student/Subject context supplied by the board, and `+N` when applicable. Any richer Query card or editor must carry a visible implementation annotation: **Requires a new Query GET-detail contract or an expanded Bird View Query DTO**.

---

## 11. Multiple records in one Grid cell

The page must never silently hide extra Tasks or Queries.

### Representative record

- If a record is already open/selected, keep it as the representative.
- Otherwise use deterministic attention ordering.
- Recommended Task order: In progress, Open, Pending, Rescheduled, Done; then stable due-date/creation order.
- Query ordering follows its actual supported status priority and stable date order.

### Compact indication

- Show `+N` for additional records.
- Accessible label states additional and total counts.
- Optional 1-2px stacked-paper outline reinforces multiple records.
- Do not fit several miniature cards into the 120px cell.

### Expanded navigation

- Header shows `1 of 3` with previous/next controls.
- Optional task/query index opens a compact list of available title/context, status, marks where applicable, and current selection.
- One complete record editor is visible at a time.
- Attachments, comments, footer actions, and deletion always apply to the active record.
- Deleting the active record advances to the next; deleting the final record returns the cell to empty.

---

## 12. Expanded Task ticket

Use the previously approved ticket modal as the direct reference. Preserve the centred overlay interaction visible in the original design while improving hierarchy, save clarity, and labelling.

### Modal geometry

- Width: `min(calc(100vw - 24px), 640px)`.
- Maximum width: exactly `640px`; do not restore the older 720-760px recommendation.
- Maximum height: `88vh` desktop.
- Narrow screens: near/full-screen within a 12px outer gutter and safe areas; the 640px maximum still applies.
- Ivory surface, 1px border, 6px radius.
- Restrained shadow.
- Overlay contract: `fixed inset-0`, `background: rgba(15,24,27,.48)`, `backdrop-filter: blur(1px)`, `z-index: 9000`.

### Required visual reference: expanded Grid ticket

The expanded Task ticket shown from a Grid cell is a required high-fidelity screen, not a generic form dialog. Use the Haram Nizami Mathematics example as the reference content state:

```text
MATHEMATICS · HARAM NIZAMI                                      ×
──────────────────────── restrained brass hairline ───────────────────────
│ emerald status rail │ Ch:  –                                      [⌄] │
│                     │ Tp:  Topic…                                 [⌄] │
│                     │ Ex:  Exercise…                                 │
│                     │ Ds:  Exercise 1.2                              │
│                     │ Att: [54px work thumbnail ×] [+ Attach files] │
│                     ├────────────────────────────────────────────────┤
│                     │ [T] Tayyaba Shehbaz             Marks: 9 / 10  │
│                     ├────────────────────────────────────────────────┤
│                     │ Delete       [TUITION] [DONE]                  │
│                     ├────────────────────────────────────────────────┤
│                     │ Discussion · 0                                 │
│                     │ [ Add a comment…                              ] │
│                     │                              [ Send comment ]   │
│                     │ [+ Add another task for Haram in Mathematics]  │
└───────────────────────────────────────────────────────────────────────┘
```

- This is the **expanded form of the compact 120px ticket**, so preserve its student, subject, Task Type, Status, reporter, marks, attachment, description, and discussion context. Do not substitute a generic “task details” card that loses those signals.
- The header must be `SUBJECT · STUDENT` in 17px semibold ink, with a single obvious close button. The header divider is brass at low contrast; it is not a heavy gold rule.
- A 5px semantic rail runs down the ticket body’s leading edge: emerald for Open/In progress, success green for Done, brass for Pending/Rescheduled, and danger red for an error. The rail is status information, not decoration.
- Use the existing short field labels only where they are already established in Bird View (`Ch:`, `Tp:`, `Ex:`, `Ds:`, `Att:`); retain an accessible full label for every control. Empty values display a deliberate muted placeholder (`—`, `Topic…`, `Exercise…`), never an ambiguous blank control.
- The Description field is the visual anchor. It is a bordered ivory input/reading area, at least 72px high in the reference state, with `Exercise 1.2` shown as actual content.
- Attachments are visible, actionable evidence: 54px square thumbnail, remove affordance only when permitted, and a labelled sharp-cornered `+ Attach files` tile. Clicking the thumbnail opens the shared image viewer.
- The Assignment strip is separated by a fine border. It pairs the reporter avatar/name control with marks, and must show `Marks: 9 / 10`, not an unexplained number or a bare spinner.
- The destructive action is text-led (`Delete` with trash icon). Work type and status are labelled badges (`TUITION`, `DONE`), never unexplained initials such as `TW` or `D` in the expanded form.
- The discussion block uses the label `Discussion · 0` unless a distinct activity/event feed is truly available. It includes a full-width composer and a right-aligned labelled send action.
- `+ Add another task for Haram in Mathematics` is a full-width, dashed secondary action below discussion. It must state its result rather than being an icon-only plus zone.
- Keep the visually dense reference composition at the mandated 640px maximum: no wide empty side column, card-in-card treatment, giant title band, or excessive rounded containers.

### Surface and background continuity

The expanded ticket must look like it belongs to the same application as Task Entry and all other shared dialogs.

- The shared application workspace is `app.canvas.100` / `bird.parchment` (`#F4F1E9`). Bird View may use its edge-to-edge grid, but must not introduce a separate cool-grey or pure-white page background.
- The dialog and Task Entry form surface are the same token: `app.ivory.50` / `bird.ivory` (`#FFFEFA`). Never use an un-tokenised `#FFFFFF` dialog shell while Task Entry uses ivory.
- Input interiors may use `#FFFFFF` only when needed for field contrast; their surrounding dialog, section surfaces, attachment tile, and discussion composer stay in the ivory/parchment family.
- The board remains visible beneath the standard ink overlay; do not recolour the board, introduce a grey modal page, or place a second white outer card behind the ivory ticket. The overlay alone supplies separation.
- Borders, dividers, disabled/empty fields, badges, and shadows must use the shared tokens in Section 3 and the whole-application specification. The expanded ticket must not create local colour aliases.

### Header

```text
MATHEMATICS · HASSAN JAWAD                    1 of 2   ‹ ›  ×
Task details                                  OPEN · TUITION
Applications of Trigonometric Ratios
──────────────────── restrained brass divider ────────────────────
```

Required:

- Sticky header inside the 640px modal.
- Subject.
- Student.
- `Task details` context label and selected date where it aids date-oriented Bird View context.
- Derived Task title.
- Noninteractive status and work-type summaries in full; the selectable badge controls remain later in the required focus sequence.
- Multiple-record position when relevant.
- Visible Close button.
- Restrained brass divider below the header.

### Main content

At the 640px maximum, use a dense labelled form rather than a wide two-rail inspector:

```text
ACADEMIC DETAILS
[Book]          [Chapter]       [Topic]
[Exercise]      [Description across full width]

ASSIGNMENT
[Reporter]      [Marks]
```

Required rules:

- Full labels: Book, Chapter, Topic, Exercise, Description.
- Book, Chapter, and Topic form the three-column Academic Details row at desktop modal width.
- Exercise follows below; Description spans the complete available row.
- Persistent labels and consistent controls.
- Description is the largest academic field, remains vertically resizable, and updates through the existing instant `onChange` path.
- View mode uses readable properties, not grey disabled inputs.
- Edit mode maintains the same geometry.
- Dependent selects explain prerequisites and clearing consequences.
- Assignment is a two-column row: Reporter avatar/select and Marks input with a visible `/ total` suffix.
- Marks distinguish `0/10` from `Not graded`.
- Rescheduled context is readable.

### Attachments

- Heading `Attachments · N`.
- Labelled `Attach files` action.
- Exact `54 x 54px` thumbnail strip plus a `+ Attach files` tile/action.
- Upload/crop/progress/success/failure/retry/limit states.
- Shared image viewer with previous/next, position, Close, and allowed remove action.

### Discussion and activity

- Default tab: `Discussion · N`.
- Comments and replies show identity, role, time, and readable text.
- Composer supports posting, posting failure with retained text, and replies.
- `Activity` tab appears only when real event data exists; do not label comments alone as Activity.

### Footer

- Use one sticky footer; the visible Close action remains in the header and is not duplicated here.
- Show `Saved ✓`, `Saving...`, or a persistent save error at the start.
- Use one Delete overflow trigger, selectable Task Type tag, selectable Status tag, labelled `+ Add another task for Hassan in Mathematics`, and `Mark done` primary action.
- The visual order and source DOM order must be identical: all ticket inputs first, then Delete trigger, Type badge, Status badge, Add another, and finally any later primary action such as Mark done. Do not use CSS ordering to move these controls into a contradictory visual sequence and do not render a second Delete control.
- Dropdown options remain outside the Tab sequence (`tabIndex=-1`) and use Arrow-key focus.
- If the footer needs two visual rows at 640px, wrap naturally while retaining the same left-to-right, top-to-bottom DOM order.

### Focus and close

- Opening focuses Description or the first valid control exactly once according to existing focused rules.
- Tab order follows visual/DOM order required by `.agents/AGENTS.md`.
- Escape closes the entire ticket and ticket dropdowns.
- Focus returns to the originating Grid/Stacked card.
- Backdrop close must not discard a visible unsaved or failed state silently.

---

## 13. Expanded Query ticket

The expanded Query view uses the same 640px shell but a Query-specific hierarchy. Under the current contract it is a summary only: the Bird View Query payload has no complete statement, Teacher, Page, creator, or GET-by-ID detail contract. Do not show a fake loading state for a request that does not exist and do not fill missing fields with invented copy.

### Header

```text
MATHEMATICS / HASSAN JAWAD / 23 JULY                 ×
Query details                                      OPEN
2 attachments                                Summary
```

### Content sections

1. **Current summary** — Student, Subject, readable status, selected-date context, attachment count/previews, and multiple-record navigation from the existing Bird payload.
2. **Enhanced Query statement** — visually primary only after a complete detail contract is added.
3. **Enhanced academic context** — Book, Chapter, Topic, Exercise, Page only when fetched.
4. **Enhanced people/context** — Teacher, Class, School, creator only when fetched.
5. **Enhanced evidence editing** — current images can be viewed; add/remove/update actions require an explicitly wired, permission-checked Query PATCH flow with rollback.

The enhanced hierarchy is blocked until Bird View gains either an expanded Query DTO or a real Query GET-detail contract. Annotate the enhanced frame as a dependency, not as current functionality.

### View/edit distinction

- The current-contract summary is view-only because the Bird payload lacks the complete editable Query record.
- In the enhanced dependency frame, Student, Teacher, and Class remain readable property rows where read-only, and actual editable Query fields use the shared control language.
- Enhanced saving and failure states appear in context only after the detail/update flow is wired end to end.
- A Done transition uses the consistent success treatment when the real Query action supports it.
- Do not show Task work type, marks, Task comments, or Task rescheduling unless Query data genuinely supports them.

---

## 14. Contextual Task/Query entry modal

Opening an eligible empty cell launches the existing full Task or Query entry flow with context inherited from the cell.

### Inherited context

- Selected Student.
- Selected Subject.
- Selected Bird View date for Task due date.
- Active Task/Query mode.

### Entry-modal shell

- Use the shared large-dialog pattern.
- Header explicitly says `Create task` or `Record query`.
- Context appears immediately beneath the title.
- Visible Close/Cancel.
- Sticky action footer for long forms.
- One scroll container; no modal behind modal.

### Attendance warning

- Absent/Leave warning appears prominently inside the form.
- Include Student, date, and attendance state.
- Explain that the user may continue/override according to existing behaviour.
- Do not hide this warning only in a later confirmation.

### Task creation

- Academic context.
- Reporter/assignee.
- Type/status.
- Due date.
- Conditional marks.
- Description.
- Up to five attachments.

### Query creation

- Student/teacher/class/school context.
- Academic location.
- Query statement.
- Status.
- Attachments.

### Create states

- Loading options.
- Disabled dependency.
- No options.
- Validation.
- Upload/crop.
- Creating.
- Creation failure with retained input and Retry.
- Success closes/returns to Bird View and briefly highlights the new record.

### Add another from expanded ticket

- Close or suspend the current expanded editor before opening Create mode.
- Never place the Create modal behind the expanded ticket.
- Cancel returns to the previous active record.
- Success activates the newly created record or closes to the highlighted compact card according to the approved flow.

---

## 15. Stacked layout

Stacked mode preserves Student columns but replaces Subject rows with ordered record positions.

### Purpose

- Compare each Student's active workload vertically.
- See status-prioritised Tasks without navigating Subject rows.
- Add another record at the end of a Student stack.

### Ordering

- Use deterministic order: In progress, Open, Pending, Done, with Rescheduled shown according to the defined product rule.
- Within one status, use stable due-date/creation ordering.
- Query mode uses its own supported ordering.

### Stacked cell

- Same compact Task/Query card as Grid mode.
- Subject context becomes visible because the row no longer identifies Subject.
- Add a compact Subject tag or academic line without overcrowding the card.
- Drag/drop target shows the destination Student clearly.

### Empty/add row

- One labelled `+ Add task` or `+ Add query` cell appears immediately after the last record for each Student.
- `+ Add query` always opens the complete Query entry form with real required context; it never sends the invalid Task-shaped quick-plus payload.
- Do not render a large anonymous plus.
- Rows below the add row remain visually empty and noninteractive.

### Stacked first column

- It must not pretend to contain Subject codes.
- Use a small sequence/position indication or leave it intentionally quiet.
- Grid-only Subject reorder/highlight behaviour is inactive.

### Layout switch safety

- Leaving Grid clears or safely preserves grid-only active coordinates without allowing hidden mutations.
- Stacked selection and open record remain tied to stable record identity.

---

## 16. Batch selection and action bar

### Entry into Batch mode

- Batch control clearly enters a distinct mode.
- The grid receives a small persistent mode indicator.
- Compact cards gain a selectable check control or card-level selection affordance.
- Opening/editing a card does not occur on the same click used to select it.

### Selection state

- Selected card shows square check and subtle batch tint.
- Status rail remains visible.
- Selected count updates live.
- Selection scope is clearly tied to current date, mode, layout, and filters.

### Floating action bar

Refine the existing floating bar into a sharp compact command surface:

```text
3 tasks selected       [Mark done] [In progress] [Pending] [Open] [Cancel]
```

- Bottom-centred on desktop.
- Radius no more than 6px.
- Ink surface or ivory with strong border; avoid large rounded-xl styling.
- Buttons use text and semantic icons.
- Mobile becomes a bottom action sheet.
- Show progress, partial failure, Retry, and reconciliation rather than closing silently.
- Query mode does not show unsupported Task actions.

---

## 17. Grid edit mode and keyboard crosshair

### Edit mode

- Entering Edit mode shows a compact persistent indicator: `Edit mode` and Exit hint.
- Active cell receives a 2px internal focus boundary.
- Crosshair row/column tint is subtle and does not resemble selection or status.
- Empty eligible cell shows labelled Create action.
- Occupied cell shows Open/Edit cue.

### Normal crosshair mode

- Outside Edit mode, Arrow-key highlight remains a non-editing navigation aid according to current rules.
- Highlighted Student/Subject headers visually correspond to the active crosshair.
- Scrolling keeps the active intersection visible.

### Shortcut reference

Document the existing shortcuts in the Help panel:

| Shortcut | Existing purpose |
|---|---|
| `Cmd/Ctrl + Shift + F` | Focus/clear Student search |
| `Cmd/Ctrl + Left/Right` | Previous/next date |
| `Cmd/Ctrl + B` | Today |
| `Cmd/Ctrl + Shift + M` | Open contextual Task/Query creation |
| Digits | Highlight Student by visible position |
| `Shift + Digits` | Highlight Subject by visible position |
| Arrow keys | Navigate crosshair/edit cell according to mode |
| `E` | Toggle Edit mode |
| Enter in Edit mode | Open record or create in eligible empty cell |
| Delete/Backspace in Edit mode | Begin safe deletion of the documented target |
| `Cmd/Ctrl + C` or `+` in Edit mode | Copy the documented Task target |
| `Cmd/Ctrl + V` in Edit mode | Clone according to the current Subject rule |
| `Cmd/Ctrl + Z` | Undo pending delayed deletion |
| Escape | Close/clear the topmost defined Bird View layer |

### Global-shortcut safety

- Do not trigger Grid commands while a button, input, textarea, select, contenteditable, menu, dialog, or attachment control has focus.
- Shortcut layers have one documented precedence order.
- Cmd/Ctrl+Z must not override native text undo while the user is editing text.

---

## 18. Drag, drop, copy, and reorder presentation

### Student reorder

- Drag preview shows initials and full name.
- Valid insertion line appears between Student columns.
- Source column is subdued.
- Reorder state does not alter column dimensions.

### Subject reorder

- Drag preview shows code and full Subject name.
- Valid insertion line appears between Subject rows.
- Source row is subdued.

### Task move

- Drag preview uses a compact readable Task summary.
- Valid Student target receives emerald inset boundary and `Move` cue.
- Persisted action follows the existing Student-target semantic.
- Do not visually imply a Subject change when only assignee changes.

### Task copy/clone

- Modifier state changes cursor/preview to Copy.
- Valid target displays plus/copy cue.
- A copy is committed according to the existing defined drop behaviour; crossing a cell must not appear as a committed copy before a drop.

### Invalid target

- Unassigned or attendance-restricted target uses prohibited cue and reason.
- No silent no-op.

### Keyboard/touch alternatives

- Record overflow includes supported `Move task` and `Duplicate task` actions where existing behaviour permits.
- Reorder controls expose Move earlier/later actions for keyboard/touch.
- Drag cannot be the only path for a core operation.

---

## 19. Calendars, menus, and pickers

### Shared popover language

- Ivory surface.
- 1px border.
- 4px radius.
- Ink text.
- Brass/emerald selected state.
- 28-32px desktop option height; 44px mobile.
- Visible Close/Escape behaviour.

### Main date calendar

- Month and year header.
- Previous/next month.
- Correct 7-column calendar semantics.
- Selected date, today, and keyboard focus remain distinct.
- Selecting a day updates Bird View and follows the defined close behaviour.
- Date shortcuts synchronise the visible calendar month.

### Reschedule dialog

- Title: `Reschedule task`.
- Current date.
- New date calendar.
- Explanation of linked original/new record behaviour.
- Cancel and Reschedule.
- Loading, invalid, failure/Retry, and success states.
- Arrow keys move by day/week; Enter confirms only when the intended action is clear.

### Status/type menus

- Complete labels and icons.
- Arrow-key option movement.
- Enter/Space selects and returns focus to trigger.
- Options follow the ticket DOM/focus constraints in `.agents/AGENTS.md`.

### Student picker

- Category tabs, list, visibility count, Select all/Deselect all, empty state.
- Search inside the picker may be added only as a presentation of the existing Student list.

---

## 20. Delete, Undo, and feedback

### Delete confirmation

```text
Delete task

Delete Mathematics task for Hassan Jawad?
You can undo this action for 7 seconds.

[Cancel]                         [Delete task]
```

- 400-440px dialog.
- Visible Close only if it behaves the same as Cancel.
- Safe focus placement and Tab cycle.
- Initial focus goes to Cancel or another safe action.
- Enter confirms only when the focused Delete button is deliberately activated; it must never act as a global delete shortcut from elsewhere in the dialog.
- Space activates the focused Cancel or Delete button according to normal button semantics.
- Escape cancels.

### Pending deletion

- Remove/subdue the record optimistically according to current behaviour.
- Toast uses the active object name: `Task deleted` or `Query deleted`, plus labelled `Undo` and visible countdown/progress if helpful.
- Cmd/Ctrl+Z and Undo target the documented pending deletion.

### Delete failure

- Restore the record.
- Show persistent error with Retry.
- Do not show success for a non-2xx response.

### Reschedule feedback

- Toast names Task and new date.
- Failure remains actionable.

### Create/update feedback

- Create success briefly highlights the new record.
- Inline updates expose Saving/Saved/Error in expanded ticket.
- Grid-wide refresh failures use a page-level banner and Retry.
- Do not rely on console logging or browser alerts.

---

## 21. Page, mode, filter, and scroll lifecycle

### Scroll ownership

- The application shell and top navigation remain fixed according to the shared application design.
- Bird View is an edge-to-edge operational canvas below the top navigation; do not wrap it in dashboard metric cards.
- The control ribbon remains visible above the board.
- The board owns both horizontal and vertical scrolling.
- The Student header remains sticky while scrolling vertically.
- The Subject rail and top-left axis corner remain sticky while scrolling horizontally.
- Opening a ticket, menu, picker, or dialog must preserve the board's scroll position.
- Closing an overlay returns the user to the same cell and scroll position.

### Task to Query switch

On switch:

- Preserve selected date, visible Student scope, Student search, and compatible status filter where possible.
- Hide and clear Task Type because it has no Query meaning.
- Close open tickets, nested menus, and date/student pickers.
- Exit Batch and Edit modes.
- Clear copied Task, active drag, and cell-edit coordinates.
- Refresh the board with a quiet updating state while retaining geometry.
- Update labels from Task/tasks to Query/queries everywhere, including Add, empty, batch, and error messages.

### Query to Task switch

- Restore Task controls without silently restoring a stale Type filter; default to `Type: All` unless the product explicitly preserves it.
- Clear Query-only status values that have no Task mapping.
- Apply the same overlay, Batch, Edit, drag, and copied-record reset policy.

### Grid to Stacked switch

- Preserve date, Student visibility/search, Task/Query mode, and compatible filters.
- Close the expanded ticket and transient menus.
- Exit Edit mode because hidden Grid coordinates must never remain active.
- Clear row/Subject highlight and current Grid drag target.
- Retain a stable open-record identity only if the implementation deliberately reopens it in Stacked mode; otherwise return focus to the corresponding compact card after the layout settles.

### Stacked to Grid switch

- Preserve the same page scope.
- Clear Stacked ordinal navigation before enabling Grid coordinates.
- Do not infer a Subject from the Stacked row number; use the record's real Subject.

### Date change

- Show the exact destination date immediately in the toolbar.
- Preserve the old board geometry under a quiet `Updating 24 July...` state until the new response is accepted.
- Prevent old-date records from being presented as if they belong to the new date.
- On failure, explain that the requested date could not be loaded and provide Retry; either restore the prior date label or explicitly label retained content as the prior date.
- Date change closes open records and clears Batch/Edit/copy/drag state.

### Filter and search change

- Preserve board geometry and crosshair only when the active Student/Subject remains visible.
- An occupied cell whose records are hidden by filters is not an empty create cell.
- Show a quiet indicator such as `2 hidden by filters` with an eye-off icon when that distinction prevents accidental duplicates.
- Active filters appear in an optional 24-28px context strip directly below the main ribbon, using removable sharp chips plus `Clear all`.
- The context strip appears only when filters, Edit mode, or Batch mode require persistent explanation.

---

## 22. Task and Query capability boundary

The visual design must distinguish shared presentation from currently supported behaviour. Do not make Query look functionally identical to Task when its Bird View payload and actions are limited.

| Capability | Task mode | Query mode | Design rule |
|---|---|---|---|
| Board date meaning | Task due date | Query creation date | Label and help text must not imply a historical Query can inherit an arbitrary creation date |
| Grid and Stacked display | Supported | Supported | Use mode-correct compact cards |
| Contextual full creation form | Supported | Supported | Open the existing complete form; use mode-correct context |
| Academic title/details in Bird payload | Rich Task fields available | Limited record fields | Never fabricate Query statement/Teacher/Page |
| Type filter and badge | Supported | Not a Query concept | Hide and clear in Query mode |
| Reporter, marks, comments | Task-specific | Not supplied as Task equivalents | Hide Task properties in Query mode |
| Rich inline expanded editing | Supported | Not currently equivalent | Current Query expanded view is a summary; complete editing needs expanded DTO or a new GET-detail contract plus wired PATCH actions |
| Reschedule | Supported Task flow | Not supported | Hide in Query mode |
| Batch status actions | Task workflow only unless verified | Do not advertise | Hide Batch in Query mode unless end-to-end support exists |
| Drag move/copy | Current Task behaviour | Do not advertise | Hide drag/copy cues on Query cards |
| Bird View inline delete | Current Task flow | Generic Query DELETE exists; Bird View flow is not parity-verified | Show only after permission, confirmation, optimistic rollback, wording, and focus restoration are approved end to end |
| Attachments | Supported Task flow | Count/images available in limited form | Show only supported view/edit actions |
| Status vocabulary | `OPEN`, `IN_PROGRESS`, `PENDING`, `DONE` | Query values such as open/pending/done | Normalise display labels, never request the wrong stored value |

### Current-contract Query compact card

At minimum, the shippable design is:

```text
┌ status rail ──────────────────┐
│ QUERY                   OPEN  │
│ Mathematics                   │  <- only needed in Stacked mode
│                               │
│                    Attach 2   │
└───────────────────────────────┘
```

- Do not show a fake title simply to fill space.
- Use the Subject supplied by the board as context; avoid repeating it in Grid mode.
- Show the Student through the column header rather than inside every Grid card.
- Show `+N` when several Queries occupy the same cell.
- A richer proposed card may be presented on a separate `API/data dependency` frame, never as the current implementation frame.

### Enhanced Query dependency annotation

If Antigravity proposes statement, Teacher, Page, or rich Query editing, add this annotation beside the design:

> Requires Bird View Query DTO/detail endpoint support for statement, Teacher, academic page/context, creator, and editable action contracts. Do not implement from placeholder or inferred data.

---

## 23. Complete board state catalogue

Antigravity must design each state below instead of leaving engineering to infer it.

### Page/data states

| State | Presentation | Required action |
|---|---|---|
| First load | Geometry-preserving Student/Subject/ticket skeleton | No false empty/add cells |
| Quiet refresh | Existing board retained with compact `Updating...` status | Keep navigation usable when safe |
| Load failure | Inline board-top error with requested scope/date | Retry |
| Stale/offline | Persistent status banner; retained records visibly labelled stale | Retry/reconnect; no false saved state |
| No Subjects configured | Empty board explanation | Link/action only if already authorised and supported |
| No Students returned | Separate explanation from no Subjects | Retry or adjust scope |
| No visible Students selected | Explain that the Student picker has hidden all columns | Open Students picker |
| No records for date | Keep headers/assigned cells; quiet date-specific message | Eligible cells remain creatable |
| Filters hide every record | Keep geometry; state active filters | Clear filters |
| Search hides every Student | Keep Subject rail and explain search result | Clear Student search |
| Permission/read-only | Records remain readable; mutation controls absent/disabled with reason | No fake failure after click |

### Cell states

| State | Base surface | Foreground cue | Interaction |
|---|---|---|---|
| Assigned empty | Ivory | Labelled Add on hover/focus/touch entry | Open full contextual create |
| Assigned occupied | Ivory | Compact card | Open/select according to mode |
| Multiple records | Ivory | Representative card + `+N` | Open active-record navigator |
| Unassigned | Neutral hatch | `Not assigned` tooltip/accessible text | Highlight only; no create |
| Records hidden by filter | Ivory-muted | Eye-off + hidden count | Clear/inspect filters; no false Add |
| Absent | Pale oxblood hatch/stamp | Attendance warning | View and permitted override remain clickable |
| Leave | Pale plum hatch/stamp | Attendance warning | View and permitted override remain clickable |
| Keyboard crosshair | Existing base | Faint row/column washes | Navigate only |
| Edit cursor | Existing base | 2px focus/ink inset | Enter opens/creates eligible target |
| Batch selected | Existing base/card | Square checked marker | Included in batch scope |
| Drag source | Existing base | Subdued placeholder | Retains geometry |
| Valid Task target | Existing base | Emerald insertion/target cue | Move/copy only on commit/drop |
| Invalid target | Existing base | Prohibited cue + reason | No mutation |
| Saving | Existing card | Small progress/save state | Prevent conflicting duplicate submit |
| Save failed | Existing card | Persistent error keyline/icon | Retry/revert |

### Mutation states

Every create, inline update, status change, move, copy, reorder, attachment upload, comment, reschedule, batch update, delete, and Undo flow needs:

1. Ready state.
2. Triggered/pending state.
3. Success state that names the affected record/scope.
4. Failure state with retained user input when applicable.
5. Retry or safe reconciliation.
6. Protection against duplicate submission.
7. Focus restoration to the triggering record/cell.

### Visual precedence for combined states

Apply visual layers in this order so one state does not erase another:

1. Base assigned/unassigned surface.
2. Attendance hatch and stamp.
3. Hidden-by-filter veil/indicator.
4. Reading crosshair row and column washes.
5. Compact ticket and its semantic status rail.
6. Batch check/tint.
7. Keyboard focus ring.
8. Edit cursor inset.
9. Opened-ticket brass keyline.
10. Drag insertion marker or valid/invalid target cue.

The top layer wins only its visual channel. For example, a drag marker must not remove the attendance warning or the Task status rail.

---

## 24. Responsive and touch design

Bird View remains a matrix at every viewport. Do not convert it into a generic list of Student cards.

### Wide desktop: 1440px and above

- Single 38-42px control-ribbon row.
- Full grouped control set visible.
- Fixed 80px Subject rail and 120px Student columns.
- 120px board rows.
- Expanded ticket centred at maximum 640px.
- Batch bar bottom-centred without covering the active row; board gains sufficient bottom inset while Batch is active.

### Laptop: 1024-1439px

- Use two intentionally aligned compact toolbar bands if one row does not fit.
- First band: Task/Query, Grid/Stacked, Status, Task Type, Batch.
- Second band: date navigation, Students, search, Edit/help.
- Do not allow browser-dependent random wrapping.
- Board remains fixed at 80px + 120px columns.

### Narrow/tablet/phone: below 1024px

- Keep the 80px Subject rail and 120px Student columns.
- Use horizontal board scrolling with visible edge-shadow/continuation cues.
- Keep the sticky Subject rail and Student header.
- Control groups use a horizontally scrollable ribbon or a compact filter sheet; do not shrink text into illegibility.
- Task/Query, selected date, and search remain directly reachable.
- Student/filter/Batch controls may move into a labelled `Filters and students` sheet.
- Expanded ticket becomes near/full-screen below 640px with safe-area padding, sticky header, one scroll body, and sticky action footer.
- Menus that would overflow become anchored sheets while retaining the same labels and keyboard semantics where a keyboard is present.

### Touch requirements

- No required action exists only on hover.
- Toolbar and modal actions target at least 44 x 44px on touch layouts.
- The dense Grid may keep its approved 120px geometry, but card actions opened from it use touch-safe targets.
- A visible Add affordance is available on tap/focus for eligible empty cells.
- Reorder and Task move/copy have menu-based alternatives; long press is optional, never the only method.
- Prevent horizontal swipe/scroll from accidentally initiating a drag.
- Respect `env(safe-area-inset-bottom)` for bottom sheets and Batch actions.

### Zoom and content resilience

- At 200% browser zoom, the matrix remains scrollable rather than reflowing into malformed cards.
- Long Student/Subject names truncate visually but remain available by tooltip and accessible name.
- The expanded ticket stacks its three-column Academic Details fields at narrow widths without horizontal form scrolling.

---

## 25. Safari and table implementation contract

These rules are design constraints, not optional engineering notes.

### Table geometry

- Use an explicit table width: `80 + (visibleStudents.length * 120)` pixels.
- Subject rail width is exactly 80px.
- Every Student column is exactly 120px.
- Every Grid/Stacked row is 120px unless a separately approved mode requires a documented exception.
- Use fixed table layout and left anchoring such as `table-fixed`, `mx-0`, and `mr-auto`.
- Do not use `w-full`, `w-max`, `min-w-max`, flexible percentages, or flex-based table sizing for the board.

### `td` and `th` restrictions

Never place any of the following directly on a board `td` or `th`:

- `position: relative`.
- transforms or scale.
- transition utilities.
- hover/active background effects.
- interactive z-index changes.

Instead, each cell/header owns one full-size inner wrapper:

```text
td/th: geometry, width/height, border, sticky placement only
  div: w-full h-full, relative, background, hover, transition, overlays, controls
```

### Sticky and visual effects

- Sticky offsets must account for the real toolbar and Student-header heights.
- All crosshair, attendance, focus, drag, and hover effects are rendered inside the inner wrapper.
- Do not animate the table element or sticky cells with transform.
- Do not use infinite pulse/scale on attendance tags or Student headers.
- Use inline styles for critical custom hexadecimal values where generated utility discovery may be unreliable.
- Test sticky intersections, horizontal scrolling, backdrop overlays, and keyboard focus in current Safari as a release requirement.

### Next.js implementation note

If the design is implemented, the assigned developer must read the relevant local Next.js 16.2.9 documentation in `node_modules/next/dist/docs/` before changing page, image, routing, or server/client behaviour. This design document does not override the repository's Next.js agent rule.

---

## 26. Accessibility and keyboard specification

### Board semantics

- Expose the board as a named academic matrix with concise instructions.
- Identify column headers as Students and row headers as Subjects or Stacked positions.
- Every interactive cell wrapper has an accessible name that includes mode, Student, Subject/position, attendance, assignment state, record count, and primary action.
- Decorative hatch, rail, stacked-paper, and crosshair layers are hidden from assistive technology.
- Status, attendance, selected, and error states use text/icon plus colour.

Example accessible labels:

- `Mathematics, Hassan Jawad, one open task, 8 of 10 marks. Open task.`
- `English, Hassan Jawad, empty assigned cell. Add task.`
- `History, Hassan Jawad, not assigned. Creation unavailable.`
- `Mathematics, Hassan Jawad, absent, two tasks. Open tasks; attendance warning applies.`
- `Stack position 2, Hassan Jawad, Mathematics task, in progress.`

### Focus visibility

- Use a visible 2px focus-blue outline with sufficient offset/contrast.
- Focus is never communicated only by a pale background.
- Sticky headers do not obscure the focused cell after programmatic scrolling.
- Focus returns to the invoker when menus, pickers, sheets, and dialogs close.

### Dialog behaviour

- Expanded ticket, entry form, reschedule, delete confirmation, cropper, and image preview have a dialog name and modal semantics.
- The expanded ticket alone follows the focused Bird View rule: Description, or the first valid ticket control when Description is unavailable.
- Other dialogs use purpose-specific safe focus: Cancel for destructive confirmation, the selected date/calendar for reschedule, the primary field for Create, and Close/viewer controls for preview/crop flows.
- Trap focus only inside the topmost modal layer.
- Escape closes the topmost appropriate layer; within the ticket, it closes the entire ticket together with its dropdown state according to the focused rule.
- Closing returns focus to the compact card/cell that opened the dialog.

### Ticket menu behaviour

- Source Tab order remains `Inputs -> Delete trigger -> type badge -> status badge -> Add another`.
- Badge menu options use `tabIndex=-1`.
- Arrow keys move active option; Enter/Space selects; Escape follows the ticket close contract.
- Reschedule calendar handles Arrow keys and Enter with propagation/default suppression so board shortcuts do not run underneath it.

### Global shortcuts

- Global shortcuts never run from focused inputs, textareas, selects, buttons, contenteditable fields, menus, dialogs, or attachment controls.
- The Help panel communicates platform-correct `Cmd` or `Ctrl` labels.
- Do not override browser/native text editing commands inside form fields.

### Announcements

- A polite live region announces load completion, filter results, selection count, save success, retryable failure, move/copy completion, deletion, Undo, and restored records.
- Batch partial failure identifies the number completed and failed.
- Toasts remain visually available long enough to act and are not the only error location for retained form data.

### Language and content

- Verify English and Urdu/RTL content, mixed numerals, and long academic titles.
- Do not reverse status rails, marks ratios, or board axis meaning merely because field content is RTL; define component-level direction deliberately.
- Tooltips supplement labels; they never replace a required visible or accessible name.

---

## 27. Performance and density guardrails

Bird View is a high-density operations surface. Visual richness must not multiply into thousands of expensive cell effects.

### Design guardrails

- Empty cells use flat surfaces, borders, and CSS hatch layers; no per-cell shadow.
- Do not render hidden menus, complex tooltips, animated SVGs, or large decorative DOM trees in every cell.
- Only the representative compact record is fully rendered; additional records use `+N` until the cell is opened.
- Avoid blur, glass, and animated gradients across the board.
- Crosshair and attendance effects use simple inner-wrapper overlays.
- Loading skeletons preserve exact board geometry to prevent layout shift.
- Date/mode refresh preserves the existing board rather than rebuilding the entire visual shell with a blank spinner.

### Interaction targets

- Toolbar/menu opening should feel immediate, targeting under 100ms to visible response.
- Compact ticket opening should show the overlay shell within roughly 150ms, with local detail loading if required.
- Horizontal and vertical board scrolling should remain smooth on a representative large dataset.
- Optimistic actions must still expose failure/reconciliation rather than hiding network delay.

### Validation fixture

Antigravity and implementation QA must inspect at least:

- 100 Students.
- 20 Subjects.
- 5,000 Task/Query records on the selected day/scope so density and derivation costs are exercised together.
- Long names and descriptions.
- Multiple records in several cells.
- Mixed Present/Absent/Leave attendance.
- Active status/type filters.
- A large image/comment count.

Do not prescribe virtualization as a visual shortcut unless sticky headers, Safari geometry, keyboard navigation, focus restoration, drag/reorder, and accessibility parity are proven.

---

## 28. Permissions and read-only presentation

- Derive available controls from the application's real permissions; do not invent new roles in the design.
- A user who can read but cannot edit sees the same academic hierarchy without misleading editable-looking disabled fields.
- Hide actions that are never available; use a reason only where an unavailable action is important to understand.
- Do not expose a destructive action and then fail only after click because the design ignored permission state.
- OWNER, COORDINATOR, TEACHER, ASSISTANT, STUDENT, or PARENT-specific behaviour may only be designed when the existing product contract supplies it; do not invent an `ADMIN` role.
- Attendance warnings and assignment restrictions remain understandable in read-only mode.

---

## 29. Component and pattern inventory

Antigravity should provide reusable variants rather than drawing every screen independently.

### Page components

- `BirdViewShell`.
- `BirdViewToolbar` with desktop, laptop, and narrow variants.
- `ModeSegment` for Task/Query and Grid/Stacked.
- `FilterTrigger`, `FilterMenu`, and active-filter context strip.
- `DateNavigator` and `CalendarPopover`.
- `StudentVisibilityPicker`.
- `StudentSearch`.
- `KeyboardHelpPanel`.
- `BirdBoardScroller`.
- `AxisCorner`.
- `StudentHeader`.
- `SubjectHeader`.
- `StackOrdinalHeader`.

### Cell and ticket components

- `BoardCellSurface` variants: assigned, unassigned, absent, leave, filtered-hidden.
- `EmptyCellAction`.
- `TaskCompactTicket` state variants.
- `QueryCompactTicket` current-contract variant.
- `MultipleRecordIndicator`.
- `StatusRail`.
- `MarksRatio`.
- `ReporterIdentity`.
- `MetadataCount`.
- `WorkTypeTag`.
- `CrosshairOverlay`, `EditCursor`, `BatchMarker`, and `DropMarker`.

### Overlay and feedback components

- `ExpandedTaskDialog` at maximum 640px.
- `ExpandedQueryDialog` current-contract summary plus separately annotated enhanced-data dependency state.
- `RecordSwitcher` for multiple records.
- `ContextualEntryDialog`.
- `RescheduleDialog`.
- `DeleteConfirmDialog`.
- `AttachmentSourceDialog`.
- `CropDialog` and `ImagePreviewDialog`.
- `BatchActionBar`.
- `UndoToast`, `MutationToast`, `InlineSaveState`, and `BoardErrorBanner`.

For every component, document default, hover, focus, active/open, selected, disabled/unavailable, loading, success, error, long-content, and narrow-screen states where applicable.

---

## 30. Required Antigravity output set

The handoff is incomplete unless it contains all items below at real scale.

### Foundations and anatomy

1. Token sheet: colours, typography, spacing, corners, borders, status semantics, attendance semantics, focus, elevation, motion.
2. Whole-page annotated anatomy showing fixed shell, toolbar, board scroller, sticky Student row, sticky Subject rail, and overlays.
3. Geometry sheet proving 80px Subject rail, 120px Student columns/rows, and explicit table-width formula.
4. Layer/z-index sheet including nested ticket actions and attachments.

### Primary screens

5. Populated desktop Task + Grid at approximately 1440px or wider.
6. Populated desktop Task + Stacked.
7. Query + Grid using the current payload contract.
8. Query + Stacked using the current payload contract.
9. Laptop two-band toolbar layout.
10. Narrow-screen horizontally navigable matrix.

### Toolbar and navigation states

11. Status menu, Task Type menu, date calendar, Student picker, Student search/clear, active-filter context strip, and keyboard-help panel.
12. Edit mode indicator and numbered Student/Subject navigation cues.
13. Reading crosshair compared directly with Edit cursor and opened-ticket selection.

### Cell/ticket state boards

14. Assigned empty, occupied, multiple, unassigned, hidden-by-filter, Absent, and Leave cells.
15. Compact Task cards for Open, In progress, Pending/rescheduled, Done, graded, ungraded, attachment/comment counts, long content, selected, focused, dragging, saving, and failure.
16. Current-contract compact Query cards for Open, Pending, Done, attachment count, multiple records, and Stacked Subject context.
17. Multiple-record `+N` and active-record switcher.

### Expanded and creation flows

18. Expanded Task at the exact 640px maximum: sticky header, three-column Academic Details, full-width Description, two-column Assignment, 54px attachments, Discussion, labelled Add another, sticky save/footer actions.
19. Expanded Task with several records and `1 of N` navigation.
20. Current-contract expanded Query summary plus a separately annotated enhanced-data proposal if desired.
21. Contextual Create Task and Record Query forms.
22. Absent/Leave override warning inside creation.

### Operational modes and feedback

23. Batch mode with zero selection, several selected, pending, success, and partial failure.
24. Student/Subject reorder plus the current attendance-order restriction: when any Absent/Leave ordering disables Student-column reorder, show a lock and `Attendance order active; Student reorder unavailable` instead of a drag cursor.
25. Task move, modifier-copy, valid target, invalid target, and menu-based keyboard/touch alternative.
26. Reschedule, Delete confirmation, seven-second Undo, delete failure/restoration.
27. Attachment source, upload progress/failure, cropper, and full image preview at the correct nested layers.

### Data and resilience states

28. First-load skeleton and quiet date/mode refresh.
29. Load error/Retry, stale/offline, no Subjects, no Students, no visible Students, no records for date, no filter matches, and no Student-search results.
30. Accessibility annotation sheet covering accessible names, Tab/Arrow/Escape behaviour, focus return, live announcements, 200% zoom, touch targets, and Urdu/RTL content.

### Prototype paths

Prototype at least these complete paths:

1. Change date -> inspect Task -> edit Description -> observe Saving/Saved -> close to original cell.
2. Filter status -> discover hidden-record cell -> clear filter -> open recovered record.
3. Enter Edit mode -> keyboard navigate -> create in eligible empty cell -> return to highlighted new record.
4. Open multi-record cell -> switch record -> attach/crop/view image -> return to same record.
5. Batch select Tasks -> apply a supported status -> handle partial failure.
6. Delete Task -> Undo within seven seconds -> focus restored.
7. Switch Task to Query -> verify Task-only controls disappear and limited Query content remains honest.
8. Navigate the full matrix on a narrow touch screen without losing sticky context.

---

## 31. Acceptance checklist

### Whole-page composition

- [ ] Bird View remains the edge-to-edge primary academic matrix.
- [ ] The current page is visibly recognisable as the reference.
- [ ] The Royal Academic Ledger palette and sharp geometry replace inconsistent legacy styling.
- [ ] No dashboard cards, Kanban conversion, glass, gradients, excessive pills, or decorative royal ornament are introduced.
- [ ] Board scroll ownership and sticky regions are unambiguous.

### Toolbar and modes

- [ ] Task/Query, Grid/Stacked, filters, Batch, date, Students, search, Edit/help are fully designed.
- [ ] Laptop and narrow toolbar layouts are intentional, not accidental wrapping.
- [ ] Switching mode/layout/date clears incompatible transient state.
- [ ] Task Type and Task-only actions disappear in Query mode.
- [ ] Active filters cannot make an occupied cell look safely creatable.

### Geometry and Safari

- [ ] Subject rail is exactly 80px.
- [ ] Every Student column and board row is 120px.
- [ ] Explicit width is `80 + visible Students x 120`.
- [ ] No direct `relative`, transform, transition, or interactive background is applied to `td`/`th`.
- [ ] Full-size inner wrappers own all interaction effects.
- [ ] Sticky intersections and overlays are verified in Safari.

### Compact tickets

- [ ] Task card uses 3px semantic rail, ivory surface, 2px radius, full status/marks, derived title, context, footer metadata, and brass opened state.
- [ ] Empty academic labels/dashes are not the primary content.
- [ ] `+N` appears accurately for additional records.
- [ ] Query card displays only data available from the current payload.
- [ ] Grid and Stacked cards retain Student/Subject context without redundant noise.

### Expanded tickets

- [ ] Expanded ticket maximum width is 640px, not 720-760px.
- [ ] Overlay is `#0F181B` at 48% with 1px blur and z-index 9000.
- [ ] Header/body/footer remain usable under long content.
- [ ] Task form uses the mandated Academic Details, Assignment, attachment, Discussion, Add another, and sticky footer hierarchy.
- [ ] DOM/Tab order remains Inputs -> Delete -> badges -> Plus.
- [ ] Badge options are Arrow-key controlled and outside Tab order.
- [ ] Escape closes the complete ticket/dropdown state and focus returns to the originating card.
- [ ] Query details are not fabricated; enhanced design is marked as an API/data dependency.

### Cells and attendance

- [ ] Assigned, unassigned, filtered-hidden, Absent, Leave, multiple-record, saving, and failed states are distinct.
- [ ] Absent/Leave cells remain clickable for view or permitted override.
- [ ] Attendance warnings appear before creation is committed.
- [ ] Crosshair, Edit, Batch, focus, opened, and drag states use distinct visual channels.

### Operations and overlays

- [ ] Batch, reorder, move/copy, reschedule, delete/Undo, attachments, cropper, and preview are designed end to end.
- [ ] Moving a Task visually promises only the Student-target semantics the current implementation supports.
- [ ] Query does not advertise unsupported Task operations.
- [ ] Nested dialogs always appear above their owning ticket.
- [ ] Delete Enter/Space/Escape behaviour and seven-second Undo are represented.

### States, accessibility, and performance

- [ ] Loading, quiet refresh, error, stale/offline, and every empty-state reason are distinct.
- [ ] Every mutation has pending, success, failure, Retry/reconcile, and focus-return states.
- [ ] Status/attendance/error do not rely on colour alone.
- [ ] Keyboard, touch, 200% zoom, long text, Urdu/RTL, and reduced-motion variants are supplied.
- [ ] Large-fixture density is demonstrated without thousands of shadows or animations.

---

## 32. Final direction to Antigravity

Do not return another abstract mood board or a ticket-only redesign. Return the **complete Bird View product surface**: its toolbar, matrix, sticky axes, Grid/Stacked modes, Task/Query modes, every cell condition, compact ticket, 640px expanded ticket, creation and nested overlays, operational modes, responsive behaviour, and complete loading/error/accessibility state board.

Use the current page as the spatial and behavioural reference. Use the Royal Academic Ledger system to make it more exact, self-explanatory, royal, and professional through disciplined typography, sharp geometry, restrained brass, and dense academic hierarchy. Preserve every documented workflow and Safari constraint. Mark any proposed capability that needs new API data instead of visually pretending it already exists.

The finished design should let an engineer build Bird View without inventing a missing state, guessing an interaction, widening the ticket beyond 640px, shrinking the board below its approved geometry, or discovering too late that the design is incompatible with Safari or the current Query contract.
