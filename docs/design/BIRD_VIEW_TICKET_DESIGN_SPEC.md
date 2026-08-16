# Complete Bird View Ticket Experience Design Specification

> Compatibility note: this remains the detailed visual reference for the ticket experience. For the complete Bird View page and current conflict resolution, follow `docs/design/BIRD_VIEW_COMPLETE_PAGE_DESIGN_SPEC.md` and the latest focused rules in `.agents/AGENTS.md`. Those newer rules supersede older width, attendance-cell, geometry, and focus recommendations in this file; the expanded ticket is now capped at 640px.

## Handoff instruction for Antigravity

Design the **complete Bird View ticket experience** while preserving the surrounding Bird View page. The complete experience includes:

1. The empty-cell invitation to add a task.
2. Creating a task from its student-and-subject context.
3. The compact/collapsed ticket shown inside a grid cell.
4. Opening and viewing the complete ticket.
5. Editing the ticket in the expanded modal.
6. Handling more than one ticket in the same cell.
7. Status, work type, marks, attachments, comments, activity, and rescheduling presentation.
8. Loading, saving, saved, validation, error, read-only, selected, dragging, and responsive states.

Keep the surrounding Bird View grid, navigation, filters, backend, database, permissions, and unrelated pages intact. Existing data and actions must remain available; this document redesigns how the complete ticket experience is presented and understood.

The finished design must feel **royal, precise, academic, compact, and professional**. It should use small but readable typography, sharp edges, restrained antique-gold detailing, and controls whose purpose is understandable without memorizing unexplained abbreviations.

### Expected action from Antigravity

- Treat the visual decisions in this document as the approved direction.
- Inspect the current Bird View before producing the final design so existing behaviour is preserved.
- Produce a complete high-fidelity design or implement the complete ticket presentation; do not respond with another generic design plan.
- Show the ticket at its real Bird View size, not only as a large isolated concept card.
- Include a state board and the complete expanded modal in the final output.
- If writing application code, obey the repository `AGENTS.md` instructions and read the relevant local Next.js guide before making changes.
- Do not alter backend behaviour merely to satisfy a visual concept; surface unsupported visual/data requirements for review.

---

## 1. Scope

### In scope

- Empty-cell and add-task presentation.
- Contextual task creation inside Bird View.
- Compact ticket visual hierarchy.
- Compact ticket hover, focus, selected, done, open, and multiple-task states.
- Expanded ticket modal layout.
- Expanded ticket view, create, edit, and read-only modes.
- Expanded ticket header, academic fields, assignment properties, dates, attachments, reporter, assignee, marks, type, status, comments, activity, rescheduling, and related actions.
- Multiple-ticket navigation within one student-and-subject cell.
- Saving, saved, validation, error, loading, empty, and disabled feedback.
- Typography, colours, borders, spacing, icons, and interaction feedback across the complete ticket experience.
- Responsive behaviour of the ticket and expanded modal.

### Out of scope

- Bird View grid dimensions or overall page layout.
- Sidebar, page header, filters, date picker, student columns, and subject rows.
- Database or API changes.
- Role or permission changes.
- Inventing data that the current task model cannot supply.
- Messaging or notification features.
- Redesigning unrelated application forms or pages.

### Existing implementation reference

- Compact ticket: `src/app/(dashboard)/bird-view/page.tsx`, approximately lines 2681-2810.
- Expanded ticket: `src/app/(dashboard)/bird-view/page.tsx`, approximately lines 1303-1856.
- Existing task-entry form: `src/app/(dashboard)/task/TaskEntryClient.tsx`.
- Comments: `src/components/TaskComments.tsx`.
- Task data model: `prisma/schema.prisma`, `TaskEntry` and `TaskComment`.

Preserve existing functionality while changing the presentation.

---

## 2. Design concept: Royal Academic Ledger

The ticket should look like a precise entry from a premium academic ledger.

The royal character must come from:

- Deep ink and academic emerald colours.
- A controlled antique-brass accent.
- Warm ivory surfaces.
- Fine borders and deliberate alignment.
- Sharp 2-6px corner radii.
- Compact typography with strong hierarchy.
- Subtle selected-state corner details.

Do not create the royal appearance using gradients, purple-and-gold decoration, glass effects, large shadows, excessive ornament, or oversized serif typography.

### Shared colour tokens

| Token | Value | Purpose |
|---|---:|---|
| `ticket.ink` | `#172238` | Primary text and modal heading |
| `ticket.emerald` | `#124D45` | Academic identity and open state |
| `ticket.brass` | `#B48632` | Selected state and premium accent |
| `ticket.ivory` | `#FFFEFA` | Ticket and modal surface |
| `ticket.canvas` | `#F4F1E9` | Secondary surface and subtle section background |
| `ticket.border` | `#D8D2C5` | Default border and separators |
| `ticket.muted` | `#687286` | Secondary text and icons |
| `ticket.focus` | `#2463EB` | Keyboard focus indicator |
| `ticket.danger` | `#A33B3B` | Delete and destructive feedback |
| `ticket.success` | `#26705A` | Done state |
| `ticket.warning` | `#9A6818` | Pending and reschedule attention |
| `ticket.white` | `#FFFFFF` | Input interiors when contrast is needed |

### Shared typography

- Font family: `Inter`, using the font already present in the application.
- Use regular, medium, and semibold weights.
- Do not use black/900 weight for normal ticket content.
- Use tabular numerals for marks and counts.
- Do not use meaningful text below 10px in the 120px desktop card.
- Uppercase is allowed only for short metadata, section headings, and statuses.

### Shared shape rules

- Compact ticket radius: `2px`.
- Input/control radius: `3px`.
- Tag/badge radius: `2px`.
- Expanded modal radius: `6px`.
- Avatar remains circular because it represents a person.
- Default card uses no shadow.
- Expanded modal uses one restrained shadow.
- Avoid pill-shaped status and type controls.

---

## 3. Complete ticket experience architecture

### Experience sequence

```text
EMPTY CELL
    │
    ├── Hover/focus: “+ Add task”
    │
    ▼
CREATE MODE
    │  Student, subject and date are inherited from the cell
    │
    ├── Cancel ───────────────► EMPTY CELL
    │
    └── Create task
            │
            ▼
COMPACT TICKET IN CELL
    │
    ├── Select / drag / batch interaction
    │
    └── Open
            │
            ▼
EXPANDED TICKET
    │
    ├── View or edit fields
    ├── Attach files
    ├── Comment or reply
    ├── Change status/type
    ├── Enter marks
    ├── Reschedule / duplicate / delete
    └── Close ────────────────► COMPACT TICKET
```

### Experience principles

1. **Context is inherited.** The student, subject, and selected Bird View date should not need to be selected again when creating from a cell.
2. **Compact means summary, not miniature form.** Only information needed for scanning belongs in the collapsed ticket.
3. **Expanded means complete.** Every existing task property and action should be understandable in the expanded modal.
4. **Meaning is visible.** Icons support labels; they do not replace essential labels.
5. **No silent state.** Saving, errors, multiple tasks, read-only mode, and missing required data are visibly communicated.
6. **One visual language.** Create, collapsed, expanded, comments, attachments, and actions use the same tokens and terminology.

### Complete existing ticket content model

The complete design must provide an appropriate place for the existing ticket information below. Fields may be hidden when empty in view mode, but must not be represented by meaningless dashes.

| Information group | Existing information |
|---|---|
| Context | Student/assignee, subject, selected date, class when available |
| Academic scope | Book, chapter, topic, exercise |
| Task brief | Description |
| Workflow | Status, work type, due date, reschedule relationship/count |
| People | Reporter, assignee, creator when available |
| Assessment | Marks earned and total marks |
| Evidence | Image attachments |
| Collaboration | Comments and replies |
| Record metadata | Created and updated timestamps when available |

### Empty-cell design

An empty eligible cell remains visually quiet until hovered, focused, or selected.

Default empty cell:

- No permanent large button.
- Preserve the Bird View grid's calm empty state.

Hover or keyboard focus:

```text
┌──────────────────────┐
│                      │
│      + Add task      │
│                      │
└──────────────────────┘
```

- Use a 1px antique-brass dashed inset border.
- Use a small plus icon and the complete label `Add task`.
- Background becomes a very subtle warm ivory.
- Do not permit Add in a genuinely unassigned/unavailable cell. Absent and Leave cells are a separate case: they remain clickable for view or permitted override, and Add opens the full form with a prominent attendance warning.

### Contextual create mode

Create mode opens in the same expanded modal shell used for viewing and editing.

Header example:

```text
MATHEMATICS · HASSAN JAWAD                       ×
Create task · 23 July
```

Creation rules:

- Student, subject, and Bird View date appear as locked context in the header.
- Reporter uses the existing default but remains visible.
- Use one canonical existing default for work type everywhere; do not show different defaults between Bird View create and the separate task form. If the product default is unresolved, surface that decision before implementation rather than guessing visually.
- Present academic scope, description, work type, status, attachments, and marks according to existing behaviour.
- Comments and activity remain hidden or disabled until the task exists.
- Footer actions are `Cancel` and `Create task`.
- `Create task` is the only primary action.
- Required fields show a small text indicator and inline validation, not only a red asterisk.
- On successful creation, transition into expanded edit mode without visually closing and reopening the modal.
- The newly created compact ticket should receive a brief, restrained highlight when the modal closes.
- If `Add another task` launched create mode, Cancel returns to the previously active ticket rather than closing the complete expanded experience.

Create-mode states that must be designed:

- Initial/default values.
- Dependent academic field disabled while its parent has no selection.
- No chapter/topic/exercise options available.
- Inline validation errors.
- Attachment preparing/uploading.
- Creating with the primary button in progress.
- Creation failed with entered values retained and Retry available.
- Creation succeeded and transitioned to the active ticket.
- Attempted close with an unsaved description, comment draft, or attachment operation.

### View, edit, and read-only modes

The expanded modal supports three presentations using the same layout:

#### View mode

- Values appear as compact property rows rather than disabled form controls.
- Empty optional values are hidden or shown as `Not specified` only when the omission matters.
- An `Edit task` action enters edit mode when existing permissions allow it.

#### Edit mode

- Property rows become consistent inputs, selects, and text areas.
- Autosave feedback is visible in the footer.
- Editing does not cause the modal layout to jump significantly.

#### Read-only mode

- Header shows a lock icon and `View only`.
- Do not render editable-looking disabled controls.
- Comments remain available only when existing behaviour permits them.
- Actions not available to the user are omitted rather than displayed as failing controls.

---

## 4. Compact/collapsed ticket

### Purpose

The compact ticket must let the user determine the following without opening it:

1. What the task is.
2. What state it is in.
3. Whether it has marks.
4. Whether it has attachments or comments.
5. Who reported it.
6. What type of work it is.

### Target size

- Bird View cell at every supported viewport: `120 x 120px`.
- Narrow screens scroll the fixed matrix horizontally; do not shrink the ticket to the legacy `96 x 96px` branch.
- The ticket fills the cell with a 1px visual gap from the grid boundary.
- Desktop internal padding: `7px` top/right/bottom and `9px` left to accommodate the status rail.
- If inner space is reduced by focus/batch chrome, remove the least important secondary line before reducing legibility.

### Desktop visual wireframe

```text
┌─────────────────────────────┐
│ ○ OPEN               8 / 10 │
│ Trigonometry Ratios     +2  │
│ Unknown angles in right...  │
│ Review exercise to complete │
│                             │
│ RR   📎1   💬2      TUITION │
└─────────────────────────────┘
```

The wireframe describes hierarchy, not literal emoji usage. Use the application's icon system.

### Compact card anatomy

#### A. Semantic status rail

- Place a `3px` vertical rail on the left edge.
- The rail represents task status only.
- Do not use the rail for task type, subject, selection, or reporter.
- Pair the rail colour with a status icon and visible status text.

#### B. Header row

Left side:

- Status icon.
- Short, complete status label such as `OPEN`, `WORKING`, or `DONE`.

Right side:

- Show marks as `8/10`, not an unexplained `8`.
- Hide the marks area when no marks exist.
- Use tabular numerals.

Header typography:

- `9.5-10px`.
- Semibold.
- `12-13px` line height.
- Maximum one line.

#### C. Primary task title

Generate the displayed title using the following fallback order:

1. Topic.
2. Chapter.
3. First meaningful line of Description.
4. `Untitled task`.

Rules:

- Never show `Ch: -`, `Tp: -`, `Ex: -`, or another empty label.
- Title is `12px / 15px`, semibold.
- Maximum two lines when enough space is available.
- If the title is derived from Description, do not repeat the same text in the description area.

#### D. Secondary academic line

- Show the next useful value that is not already used as the title.
- Prefer Chapter, Topic, or Exercise according to what remains available.
- Do not display field prefixes unless they improve clarity.
- Use `10px / 13px`, medium weight.
- Maximum one line with ellipsis.

#### E. Description preview

- Use `10px / 13px`, regular weight.
- Maximum two lines on the 120px card.
- Use natural sentence casing.
- Do not make the description bold.
- Hide it if the description is already being used as the title.

#### F. Multiple-task indicator

The current cell can contain more than one ticket. The compact design must not silently hide this.

- Show `+N` near the title when additional tickets exist.
- Optionally use a subtle two-sheet stacked outline behind the card.
- Keep the indicator neutral unless the hidden tickets require attention.
- Example: one visible ticket plus two additional tickets displays `+2`.

#### G. Footer row

Left cluster:

- Reporter avatar/initials.
- Attachment icon plus count, such as paperclip + `2`.
- Comment icon plus count, such as comment + `3`.

Right cluster:

- Short readable work-type label.

Preferred work-type labels:

| Existing type | Compact label |
|---|---|
| Tuition Work | `TUITION` |
| Home Work | `HOME` |
| Class Work | `CLASS` |
| Test | `TEST` |
| Project | `PROJECT` |

Use a meaningful icon with the label if space permits. Do not use only `TW`, `HW`, or `CW` in the primary design.

Footer typography:

- `9-10px`.
- `12px` line height.
- Muted ink for counts.
- Work type can use a light canvas background and a 1px border.

### Compact ticket states

#### Default/open

- Ivory background.
- Emerald status rail.
- `OPEN` with outlined-circle icon.
- Hairline neutral border.

#### In progress

- Brass status rail.
- `WORKING` with clock/progress icon.
- Keep the surface neutral.

#### Done

- Success-green status rail.
- `DONE` with check icon.
- Marks visible as `earned/total` when available.
- Slightly reduce description contrast, but do not fade the card excessively.

#### Pending

- Warning/amber status rail.
- Clock icon and visible `PENDING` label.
- Do not use the rescheduled calendar treatment for an ordinary pending task.

#### Rescheduled

- Muted plum or warning-brass rail plus calendar-arrow icon.
- Show a concise readable destination such as `To 26 Jul` when space permits.
- Do not use tiny diagonal ribbon text across the card.
- Treat rescheduled styling as record context, separate from ordinary Pending.

#### Hover

- Border changes from neutral to deep ink at approximately 45% opacity.
- Background moves from ivory to a very subtle warm-white variation.
- No large shadow or vertical movement.

#### Opened in modal

- `2px` antique-brass border.
- Two subtle brass corner brackets may be used at the top-left and bottom-right.
- Selection styling is independent from status colour.
- Do not use a thick glowing ring.

#### Batch selected

- Use the existing batch-selection colour family, but add a visible square check marker in one corner.
- Do not use the brass opened-ticket brackets.
- The card's semantic status rail remains visible.
- Opened, batch-selected, keyboard-focused, and dragged states must remain distinguishable when combined.

#### Keyboard focus

- `2px` focus-blue outer ring with `2px` separation from the card.
- Focus must remain visible even when the ticket is selected.

#### Dragging

- Reduce opacity to approximately 75%.
- Use a restrained shadow only while dragging.
- Leave a thin placeholder outline in the original cell.

### Constrained-content behaviour

The former 96px cell recommendation is superseded. When temporary inner controls reduce usable space inside the fixed 120px card:

- Keep status and marks.
- Keep one title line.
- Keep one description or secondary line, not both.
- Keep reporter, attachment count, and comment count.
- Work type may become icon-only, but must have an accessible name and tooltip.
- Keep text at or above 9.5-10px wherever possible.

---

## 5. Expanded ticket modal

### Purpose

The expanded ticket is the complete editing and discussion surface for the same compact ticket. It must feel like the compact ledger entry has been opened, not like an unrelated form.

### Mandatory complete reference design: Hassan Shahid completed worksheet

The supplied expanded Mathematics ticket for **Hassan Shahid** is a mandatory high-fidelity reference frame for this specification. It is not merely an example of content. Antigravity must design this exact populated state in context over the Bird View grid and must preserve every real capability visible in the current ticket.

The supplied screenshot is a **content, behaviour, and continuity reference**, not approval of its current oversized width, pure-white surfaces, cryptic labels, native spinner controls, or icon-only actions. The target design below applies the Royal Academic Ledger system and the current 640px modal limit.

#### Reference record represented in the design

| Property | Required reference value |
|---|---|
| Subject | Mathematics |
| Student | Hassan Shahid |
| Class | 6, when the current payload exposes it |
| Date | 22 July 2026, using the selected Bird View date |
| Book | Mathematics WorkBook B |
| Chapter | Algebra |
| Topic | Simplifying Expression |
| Exercise | Worksheet 14 |
| Description | Complete the worksheet |
| Reporter | Rafay Raza |
| Marks | 10 out of 10 |
| Attachments | 2 worksheet images |
| Work type | Home Work |
| Status | Done |
| Discussion | 0 comments |

Do not replace these values with the older Hassan Jawad/Trigonometry example in the primary expanded-ticket frame. The longer Hassan Jawad example remains useful as a content-stress case, but this completed Hassan Shahid worksheet is the required visual acceptance frame.

#### Target expanded-ticket wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ MATHEMATICS · HASSAN SHAHID                                      × │
│ Task details · 22 July 2026                 DONE · HOME WORK         │
│────────────────────── restrained brass hairline ────────────────────│
│▌                                                                     │
│▌ ACADEMIC DETAILS                                                    │
│▌ Book                    Chapter              Topic                  │
│▌ Mathematics WorkBook B  Algebra              Simplifying Expression│
│▌                                                                     │
│▌ Exercise                                                            │
│▌ Worksheet 14                                                        │
│▌                                                                     │
│▌ Description                                                         │
│▌ [ Complete the worksheet                                         ] │
│▌                                                                     │
│▌ ATTACHMENTS · 2                                  + Attach files     │
│▌ [worksheet 1] [worksheet 2]                                        │
│▌────────────────────────────────────────────────────────────────────│
│▌ ASSIGNMENT                                                          │
│▌ Reporter                                      Marks                 │
│▌ [R] Rafay Raza                                [ 10 ] / 10           │
│▌────────────────────────────────────────────────────────────────────│
│▌ DISCUSSION · 0                                                     │
│▌ No comments yet                                                     │
│▌ [ Write a comment…                                               ] │
│▌                                                   [ Send comment ]  │
│▌────────────────────────────────────────────────────────────────────│
│▌ Saved ✓   [More · Delete] [Home work] [Done]                       │
│▌            [+ Add another task for Hassan in Mathematics]          │
└──────────────────────────────────────────────────────────────────────┘
```

The leading rail is the semantic Done rail, not a decorative green stripe. It stays visually continuous through the ticket body while the header and sticky footer remain structurally separate.

#### Exact modal composition

1. **Backdrop and shell**
   - Keep the Bird View matrix visible in its exact scroll position behind the modal.
   - Use `position: fixed; inset: 0; z-index: 9000` and the shared overlay `rgba(15, 24, 27, 0.48)` with at most `1px` blur.
   - Centre a `640px` maximum shell against the visible application content area, not against the calculated full table width.
   - Use one dialog shell. Do not place a large white card inside another white modal card.
   - The shell consists of one sticky header, one independently scrolling body, and one sticky footer. Do not create nested page/modal scroll regions.
   - Reserve enough body padding that the last comment and validation message cannot hide beneath the sticky footer.

2. **Sticky identity header**
   - Primary identity: `MATHEMATICS · HASSAN SHAHID`.
   - Secondary context: `Task details · 22 July 2026`.
   - Right-aligned noninteractive summary: `DONE · HOME WORK`.
   - One visible Close button with a 32px desktop hit target and complete accessible name `Close task details`.
   - A fine, low-contrast brass divider closes the header.
   - If several records exist in the same cell, place `1 of N` and Previous/Next controls immediately before Close without displacing the identity.

3. **Academic Details**
   - Run a `5px` semantic rail along the leading edge of the body. In this Done reference frame it uses `ticket.success` (`#26705A`); a save failure may add an oxblood error keyline without replacing the Done meaning.
   - Desktop row 1 contains three equal columns: Book, Chapter, Topic.
   - Exercise follows on its own compact row.
   - Description spans the full available width and remains the dominant editable field.
   - Use full persistent labels in the target design. The current `Ch:`, `Tp:`, `Ex:`, and `Ds:` labels are source-reference abbreviations, not the finished expanded-ticket language.
   - View mode uses readable ledger values. Edit mode replaces each value in place with its correct 34px control; the modal must not jump between modes.
   - The Description minimum height is 82px, is vertically resizable, and retains the current instant-update behaviour.

4. **Attachments**
   - Use the heading `ATTACHMENTS · 2`.
   - Show two exact `54 x 54px` worksheet thumbnails followed by the labelled action `+ Attach files`.
   - Each thumbnail has a useful accessible name such as `Open worksheet attachment 1 of 2`.
   - Thumbnails and the `+ Attach files` tile are ordinary keyboard stops and activate with Enter or Space.
   - The red remove affordance is not permanently floated over the image. Reveal it on hover/focus for permitted editors, with a 24px minimum target; keep it available through a labelled touch action.
   - Thumbnail remove `×` controls use `tabIndex=-1` so they do not trap Tab traversal; the same action remains available through a labelled attachment action/menu.
   - Opening a thumbnail launches the shared image viewer above the ticket. Attachment chooser and cropper layers use at least `z-index: 9500`; the full-screen preview uses `z-index: 10000`. Removing an image must confirm the correct item or provide immediate Undo.

5. **Assignment**
   - Use a two-column row: Reporter and Marks.
   - Reporter shows the circular `R` avatar and complete name `Rafay Raza`.
   - Marks show `[10] / 10`; do not show a bare `10`.
   - Replace the browser-native spinner appearance with the shared compact number-input treatment.
   - `10 out of 10`, `0 out of 10`, and `Not graded` must be visually distinct states.

6. **Workflow controls**
   - The reference ticket is `Home work` and `Done`.
   - The header may repeat these as noninteractive summaries for scanning.
   - The actual selectable Type and Status controls remain later in the required focus/DOM order.
   - Expanded controls use complete labels `Home work` and `Done`; `HW` and `D` are permitted only in the compact 120px card where accessible names expose the complete meaning.
   - Because this ticket is already Done, do not show a contradictory `Mark done` primary action.

7. **Discussion**
   - Use `DISCUSSION · 0`, not `ACTIVITY & COMMENTS`, unless a separate real activity feed is available.
   - Show a quiet `No comments yet` state without a large illustration.
   - Keep the composer visible with the accessible label `Write a comment`.
   - Use a labelled `Send comment` action. Its disabled state must remain understandable when the composer is empty.
   - Existing comments and replies use the Jira-style identity pattern: avatar, complete name, role where available, relative/formatted timestamp, reply relationship, and readable body text.
   - A permitted comment/reply Delete control remains visibly present rather than hover-only, has `tabIndex=0`, and exposes a clear keyboard focus ring.
   - Posting, success, failure with retained text, reply, and deletion states follow Section 7.

8. **Final action sequence**
   - Preserve the required source-DOM and Tab order: all ticket inputs, the single Delete/overflow trigger, Type, Status, and the labelled Add-another action.
   - Present Delete once, inside a clear overflow/destructive action surface; do not retain a second permanent Delete row.
   - Use the full label `+ Add another task for Hassan in Mathematics` instead of the current empty dashed plus region.
   - The Add-another action opens Create mode with Hassan Shahid, Mathematics, and 22 July 2026 inherited from the current cell.

#### Surface and background continuity

This expanded ticket must use the same shared surfaces as Task Entry and the rest of MyAcademy.

| Surface | Required token/value | Rule |
|---|---:|---|
| Application workspace | `app.canvas.100` / `#F4F1E9` | Warm parchment; never replace it with cool grey |
| Bird View grid | `ticket.ivory` / `#FFFEFA` | Preserve under the modal; the overlay supplies dimming |
| Dialog shell and body | `app.ivory.50` / `#FFFEFA` | Must match the Task Entry/dialog surface |
| Secondary section wash | `ticket.canvas` / `#F4F1E9` | Use sparingly for grouping, not as a second card |
| Editable input interior | `ticket.white` / `#FFFFFF` | Allowed only where field contrast is necessary |
| Borders/dividers | `ticket.border` / `#D8D2C5` | Fine 1px structure |
| Backdrop | `#0F181B` at 48% | Do not bake grey into the board or modal colours |

- Never use an un-tokenised pure-white outer dialog while Task Entry uses warm ivory.
- Never change the actual Bird View cell colours when the modal opens.
- Do not add a second grey page, white wrapper, or cool-blue input background.
- The Done rail uses `ticket.success` (`#26705A`); antique brass remains a restrained divider/focus accent.
- Shadows create depth only at the dialog boundary. Inner sections use borders and spacing, not card shadows.

#### Current-to-target transformation map

| Current screenshot element | Required finished design |
|---|---|
| Very wide expanded panel | Centred dialog capped at exactly 640px |
| Pure white outer and inner panels | Shared `#FFFEFA` ivory shell on the normal parchment/canvas system |
| `Ch:`, `Tp:`, `Ex:`, `Ds:`, `Att:` | Full persistent labels in the expanded form |
| Native up/down selector indicators | One consistent custom chevron for selects |
| Bare marks value `10` with spinner | `Marks [10] / 10` using shared number control |
| Floating red attachment `×` controls | Hover/focus remove action plus labelled touch alternative |
| `HW` and `D` | `Home work` and `Done` in the expanded form |
| Permanent Delete row | One Delete action in the required post-input action sequence |
| `ACTIVITY & COMMENTS` | `DISCUSSION · 0`; show Activity only when real event data exists |
| `Comment` button | `Send comment`, with posting and failure feedback |
| Unlabelled dashed `+` region | `+ Add another task for Hassan in Mathematics` |
| No visible save state | Persistent `Saving…`, `Saved ✓`, or recoverable save error |

#### Interaction, focus, and close contract for this frame

- Opening the modal focuses Description once, or the first valid input if Description is unavailable.
- Tab and Shift+Tab remain contained in the topmost ticket and follow the visual/source order.
- Type and Status option items stay outside the normal Tab sequence and use Arrow keys plus Enter/Space.
- Programmatically focused Type/Status options use a normal focus ring/state, not `focus-visible` alone.
- Escape closes the entire ticket and any ticket dropdown state together, then restores focus to Hassan Shahid’s Mathematics compact card.
- Backdrop click must not discard a visible unsaved/failed state silently.
- Attachment choice, cropper, preview, reschedule, and delete confirmation surfaces open above the `z-index: 9000` ticket.
- The reschedule calendar handles Arrow navigation and Enter internally and calls both `preventDefault()` and `stopPropagation()` so those key events cannot reach Bird View.
- Bird View global keyboard shortcuts ignore `BUTTON` together with `INPUT`, `TEXTAREA`, and `SELECT`, so Enter activates the focused ticket action normally.
- Closing the ticket restores the exact Bird View horizontal/vertical scroll position and the opened card’s brass selection keyline.

#### Required responsive versions of this exact ticket

- **Desktop/laptop:** 640px maximum shell, three-column Academic Details, two-column Assignment, sticky header/footer, internally scrolling body.
- **Below approximately 520px:** Book, Chapter, Topic, Exercise, Description, Reporter, and Marks stack into one column; no horizontal form scrolling.
- **Touch/mobile:** near/full-screen shell with safe-area padding; 44px minimum interactive controls; horizontally scrollable attachment strip; complete labels remain visible.
- **200% zoom:** header identity, Close, all fields, two attachments, marks total, discussion composer, and final action sequence remain reachable without content hidden behind sticky regions.

### Modal container

- Centered modal, matching the existing interaction.
- Width: `min(calc(100vw - 24px), 640px)`.
- Maximum width: exactly `640px`; the older 760px/680-800px range is superseded.
- Maximum height: `88vh` on desktop; near/full-screen within safe-area gutters on narrow screens.
- Surface: exact shared ivory `#FFFEFA`.
- Border: `1px solid #D8D2C5`.
- Radius: `6px`.
- Shadow: `0 18px 55px rgba(23, 34, 56, 0.22)`.
- Overlay: `position: fixed; inset: 0; z-index: 9000; background: rgba(15, 24, 27, 0.48)`.
- Avoid heavy background blur; use no blur or at most `1px`.

### Modal spacing system

- Modal header padding: `16px 18px 14px`.
- Body horizontal padding: `18px`.
- Body section vertical padding: `14px`.
- Gap between label and control: `5px`.
- Gap between fields: `11-12px`.
- Gap between major sections: handled using a 1px divider plus `14px` padding.
- Footer height: approximately `50px`.
- Header and footer are sticky within the dialog; the body is the only modal scroll container.
- Academic Details: three equal columns for Book, Chapter, and Topic; Exercise below and Description full width.
- Assignment: two columns for Reporter and Marks.
- Do not restore the former `2fr / 1fr` properties rail at the current 640px maximum.

### A. Modal header

First line:

- Left: canonical dynamic identity `SUBJECT · STUDENT`, for example `MATHEMATICS · HASSAN SHAHID`, using a centred dot rather than a slash breadcrumb.
- Right: ticket position when multiple tasks exist, previous/next controls, and visible Close button.
- Identity: `17px / 22px`, semibold, uppercase subject with the Student name preserved in full.

Second line:

- Left: `Task details` plus the selected date when it improves Bird View context.
- Right: noninteractive full status and work-type summaries, such as `DONE · HOME WORK`.
- Context: `10-11px / 14px`, semibold or medium.

Third compact metadata line:

- A meaningful derived title using Topic, Chapter, or Description, maximum two lines; omit the line when it merely repeats an adjacent value without adding context.
- Save status on the opposite side.
- Use `12-13px` for the derived title and `10px / 13px` muted save metadata.

Header styling:

- Use a fine antique-brass rule under the header.
- Do not use a large coloured header block.
- Close button has a visually compact 14px icon inside a 32px click target.
- Close button uses a square `3px` radius hover surface.

### B. Academic details section

Section heading:

- `ACADEMIC DETAILS`.
- `10px / 13px`.
- Semibold uppercase.
- Ink colour at approximately 75% opacity.

Fields:

- Book when available.
- Chapter.
- Topic.
- Exercise.
- Description.

Rules:

- Use full persistent labels, never `Ch`, `Tp`, `Ex`, or `Ds`.
- Controls are full width.
- Select/control height: `34px`.
- Input text: `12.5-13px`.
- Control radius: `3px`.
- Use one consistent custom downward chevron.
- Description minimum height: `82px`.
- Description is vertically resizable and uses the existing instant `onChange` update path.
- Description may grow to a sensible maximum before internal scrolling.
- Focus border uses focus blue; do not rely only on a subtle colour change.

### C. Assignment and selectable tags

The former right-hand properties rail is superseded at the 640px maximum.

Use a two-column `ASSIGNMENT` row:

1. Reporter avatar/select with complete name.
2. Marks earned input with the total shown as `/ total` context.

Due date, assignee, and reschedule context remain readable compact properties where supported. Selectable Type and Status tags appear after the single Delete trigger in the final visual/DOM focus sequence.

In view mode, values look like aligned ledger rows rather than disabled controls. In edit mode, each value becomes a compact 32-34px control in the same position.

Reporter control:

- Circular initials avatar.
- Full reporter name.
- Consistent dropdown chevron.
- Do not show an unexplained single letter without the name.

Marks control:

- Label: `Marks`.
- Present the earned mark as the editable value and the existing total as clear read-only context, for example `[8] out of 10`.
- Use tabular numerals.
- Do not show an isolated number without the total.
- Avoid browser-native spinner buttons in the visual design.
- Distinguish no mark (`Not graded`) from a real zero (`0 out of 10`).

Status and work type:

- Continue to use the existing actions and values.
- In the expanded modal, always show complete readable labels.
- Tags use 2px corners, an icon, a light semantic background, and a 1px border.
- Do not show only `TW`, `O`, or `D`.

Assignee/student:

- Show the student's full name even though it also appears in the modal context.
- Include avatar/initials only if it does not make the rail visually noisy.
- Respect the existing editing behaviour; this specification does not change who may reassign a task.

Due date and rescheduling:

- Show the formatted date, never a raw timestamp.
- A rescheduled task shows a calendar-arrow icon and a concise line such as `Moved from 22 July`.
- The reschedule command belongs in the due-date action or overflow menu, not as an unexplained status code.

### D. Attachments section

Header row:

- Left: `ATTACHMENTS · N`.
- Right: `+ Attach files`.

Replace the unexplained square plus with this labelled action.

Attachment presentation:

- Thumbnail size: exactly `54 x 54px`.
- Thumbnail radius: `2px`.
- Neutral 1px border.
- Show a compact remove action on hover/focus.
- Remove icon may look 12px but must sit inside at least a 24px target.
- Keep the current maximum number of attachments.
- Use a clear empty state: `No attachments` plus `Attach files`.

Attachment subflow states:

1. **Choose source:** file/photo chooser and camera option where the existing device flow supports it.
2. **Preparing/cropping:** preserve the existing crop interaction inside a focused overlay.
3. **Uploading:** thumbnail placeholder, progress indicator, filename, and `Uploading...`.
4. **Uploaded:** previewable thumbnail with clear view and remove actions.
5. **Upload failed:** retain the item with `Upload failed`, `Retry`, and `Remove`.
6. **Limit reached:** show `5 of 5 attachments` and disable the add action with an explanation.
7. **Preview:** lightbox with previous/next navigation, position such as `2 of 5`, Close, and allowed remove action.

Do not erase a failed attachment without explanation. Removing an uploaded attachment must identify the attachment in the confirmation or provide immediate Undo when supported.

### E. Discussion and activity section

Use a compact tab pair:

- `DISCUSSION · N`.
- `ACTIVITY`.

Discussion is the default tab. If no true activity/event data is available, omit the Activity tab rather than fabricating a history. Do not call comments alone an activity stream.

Header:

- `DISCUSSION · N`.
- Use the existing total comment count.

Comment list:

- Author avatar, full name, role, and relative time.
- Comment text at `12px / 17px`.
- Replies indented with a fine left rule rather than large nested rounded boxes.
- Keep Reply and allowed Delete actions visually secondary.

Composer:

- Label or accessible name: `Write a comment`.
- Collapsed height: approximately `42px`.
- Expands when focused or when text wraps.
- Send button label: `Send`, accompanied by the existing send icon.
- Disabled Send state remains readable and clearly inactive.

Discussion subflow states:

- Loading comments.
- No comments yet.
- Writing a new comment.
- Posting comment.
- Post failed with the typed text retained and `Retry`.
- Reply composer open.
- Reply posting and failure.
- Delete comment/reply confirmation.
- Long thread with the composer still easy to reach.

Deleting a comment or reply must not cause the complete expanded modal to close. Failure feedback appears beside the affected comment action.

When activity data is available, the Activity tab uses a vertical ledger timeline:

```text
14:32  Status changed from Open to Done       Rafay Raza
14:30  Marks changed from — to 8/10           Rafay Raza
13:05  Attachment added                       Hassan Jawad
```

- Time in a narrow tabular column.
- Action in the main column.
- Actor in muted text.
- Use small icons only where they improve scanning.

### F. Add-another-task footer action

Replace the large unexplained dashed plus area with a labelled secondary action:

`+ Add another task for Hassan in Mathematics`

Style:

- Full-width or left-aligned text button.
- `32-34px` height.
- Neutral background.
- Thin dashed or solid border.
- 3px radius.
- Antique-brass icon accent on hover.
- Place this focusable action inside the final sticky action sequence after the selectable Type and Status badges. Do not leave a separate body-level plus region and do not move it visually with CSS ordering.

### G. Expanded footer

Use a sticky footer within the modal.

The visible and source-DOM order is exact: save feedback/metadata, the single overflow trigger containing Delete, selectable Type badge, selectable Status badge, labelled Add another, then a later primary action such as Mark done. Natural two-row wrapping is allowed; CSS visual reordering is not.

- Save feedback shows `Saving...`, `Saved ✓`, or a persistent failure.
- Delete is visually red and separated inside its overflow menu.
- Close remains the visible header button and is not duplicated in the footer.
- Do not render a second Delete control elsewhere.

### H. Overflow action menu

Use clear text actions in this order, showing only actions supported by existing behaviour:

```text
Edit task
Reschedule task...
Duplicate task
Move task
Copy task
────────────────
Delete task...
```

- Destructive action is last, separated, and coloured with `ticket.danger`.
- Use an ellipsis after actions that open a second decision surface.
- Do not place critical actions behind icon-only controls without an accessible name.

---

## 6. Multiple tickets in one cell

A student-and-subject cell may contain several tickets. The design must treat this as a normal state rather than hiding all but the first ticket.

### Collapsed presentation

- Show the currently opened/selected ticket when one exists; otherwise select the representative ticket deterministically.
- Recommended attention order: `IN_PROGRESS`, then `OPEN`, then ordinary `PENDING`, then rescheduled records, then `DONE`.
- Within the same state, use a stable due-date/creation ordering rather than allowing the visible ticket to change randomly between renders.
- Show `+N` for additional tickets.
- Give `+N` a complete accessible label such as `2 additional tasks; 3 tasks total in this cell`.
- Use a subtle stacked-paper outline no more than 2px behind the main card.
- Do not shrink several complete cards into the same 120px cell.

### Opening a multi-ticket cell

The expanded header shows:

```text
1 of 3    ‹ Previous   Next ›
```

Rules:

- Previous/next changes the ticket within the same cell without closing the modal.
- Preserve a user's unsaved field draft before switching.
- Ticket title and status update immediately when switching.
- Keyboard shortcut may use `Alt + Left/Right` if it does not conflict with existing Bird View behaviour.
- The `Add another task` action opens create mode while retaining the same student, subject, and date context.
- All footer actions, attachments, comments, marks, and destructive actions apply only to the active ticket.
- After deleting the active ticket, select the next available ticket. Deleting the final ticket closes the modal and returns the cell to its empty state.

### Optional task index

When a cell contains three or more tickets, the `1 of 3` control may open a compact index:

```text
Tasks for Hassan · Mathematics

○ Trigonometry review              Open
✓ Exercise 11C                     Done · 8/10
↻ Worksheet corrections            Rescheduled

+ Add another task
```

- Each row shows icon, derived title, status, and marks when relevant.
- The selected task has a brass left rule.
- Keep this index compact; it is navigation, not another full card layout.

---

## 7. Complete visual and feedback states

### Loading

Compact grid loading:

- Use a neutral skeleton inside the ticket footprint.
- Skeleton uses two title lines and one footer line.
- Do not pulse aggressively.

Expanded loading:

- Preserve modal size to avoid layout shift.
- Show skeletons for header title, academic rows, properties, and comments.
- Keep Close available during loading.

### Saving

- Footer displays a small progress spinner and `Saving...`.
- Compact ticket may show a tiny saving indicator only when the modal has closed before completion.
- Do not disable the complete modal while one field is saving.

### Saved

- Show a check icon and `Saved at 14:32`.
- Fade back to the normal metadata state after approximately 2-3 seconds.
- Do not use a large success toast for every field change.

### Save error

- Keep the user's visible value and mark the affected field.
- Show an oxblood inline banner: `Changes could not be saved. Retry`.
- `Retry` is a text button.
- Do not close the modal automatically.
- Do not rely on a temporary toast alone.

### Validation error

- Affected control receives an oxblood border and an inline message directly below it.
- Message explains the corrective action, for example `Enter a task description`.
- At submission, focus the first invalid field.
- Do not show validation using only a red outline.

### Empty optional section

- Attachment empty state: `No attachments` and `Attach files`.
- Discussion empty state: `No comments yet` and the composer.
- Marks with no value: `Not graded` in view mode; blank earned field with visible total in edit mode.
- Do not create large decorative empty-state illustrations inside the compact modal.

### Read-only

- Use text property rows rather than greyed-out inputs.
- Header displays lock icon and `View only`.
- Keep selectable/copyable text.
- Hide unavailable edit, upload, reschedule, mark, and delete actions.

### Offline or interrupted connection

- Footer displays `Offline · changes pending` only if the application can reliably detect it.
- Preserve the user's draft visually.
- Do not claim that a change is saved until confirmed.

### Deleted

- Confirm with specific context: `Delete Mathematics task for Hassan Jawad?`.
- Confirmation actions are `Cancel` and `Delete task`; destructive action uses oxblood styling.
- During deletion, keep the confirmation open and show `Deleting...`.
- On failure, keep the ticket and show a Retry message.
- Close the modal after a successful delete.
- Leave a seven-second Undo notification consistent with the existing application behaviour.
- Restored ticket briefly receives the brass highlight used for newly created tickets.

### Dependent academic-field states

- Topic is visibly unavailable until its required parent selection exists.
- Exercise is visibly unavailable until its required parent selection exists.
- Disabled state includes a short explanation such as `Select a chapter first`.
- No-results state says `No topics available for this chapter` rather than showing an empty menu.
- Loading options uses a compact spinner and `Loading topics...`.
- Failed lookup retains the previous valid selection where possible and shows `Could not load topics · Retry`.
- Changing a parent value must explain or allow reversal when it clears child values.

---

## 8. Status and type visual language

### Status mapping

| Status | Rail/accent | Icon concept | Visible label |
|---|---|---|---|
| Open | Academic emerald | Outlined circle | `OPEN` |
| In progress | Antique brass | Clock/progress | `WORKING` |
| Done | Success green | Check | `DONE` |
| Pending | Warning amber | Clock | `PENDING` |
| Rescheduled record | Muted plum/brass | Calendar-arrow | `RESCHEDULED` plus destination date |

Do not communicate status using colour alone.

### Work-type mapping

| Work type | Icon concept | Compact label | Expanded label |
|---|---|---|---|
| Tuition Work | Person/chalkboard | `TUITION` | `Tuition work` |
| Home Work | House/book | `HOME` | `Home work` |
| Class Work | Classroom board | `CLASS` | `Class work` |
| Test | Clipboard-check | `TEST` | `Test` |
| Project | Connected nodes | `PROJECT` | `Project` |

Use one consistent mapping everywhere in the collapsed and expanded ticket.

### Status and reschedule interaction states

Status selection must use complete names and icons. When the existing workflow requires a reschedule date instead of an ordinary status update, present a distinct reschedule surface rather than making `Pending` unexpectedly behave like a hidden command.

Reschedule surface:

```text
Reschedule task

Current date     23 July 2026
New date         [ Select date ]

The original ticket will remain linked to the new date.

[ Cancel ]                          [ Reschedule ]
```

Design these states:

- Date picker open.
- No date selected.
- Invalid or disallowed date.
- Rescheduling in progress.
- Reschedule failed with Retry.
- Reschedule succeeded, showing `Rescheduled to 26 July`.
- Cancel returns to the unchanged active ticket.

Marks transition:

- Entering Done reveals or emphasises the earned-mark control when existing behaviour requires marks.
- Leaving Done must not silently erase an existing mark.
- A real zero displays `0 out of 10`; an absent value displays `Not graded`.

---

## 9. Interaction and motion

- Entire compact card opens the expanded ticket.
- Distinguish click from drag using a small movement threshold so opening a ticket does not accidentally move it.
- Clicking the compact card in an existing batch-selection mode must preserve the current batch behaviour.
- Pressing Enter or Space on the focused card opens it unless an existing Bird View keyboard mode assigns a different action.
- Pointer hover should not move the card vertically.
- Use `120-160ms` transitions for border, background, and opacity.
- Opening animation: subtle fade plus scale from approximately `0.985` to `1`.
- Avoid bouncing, spring effects, or large zoom animations.
- Close action must always remain visible.
- Escape continues to close the modal.
- Clicking outside follows the existing behaviour unless it could discard a visible in-progress action.
- Keyboard focus must be clearly visible on the compact card and every expanded control.
- Tooltips may explain compact icons, but essential meaning must remain visible without hover.
- Changing fields must not scroll the modal unexpectedly.
- Opening an attachment preview must return focus to the attachment that launched it when closed.
- Submitting a comment leaves the user in the Discussion section and visibly inserts the new comment.
- Changing Chapter or Topic must make any dependent-value clearing understandable before the dependent fields disappear.
- Primary actions always use text labels; icon-only actions are reserved for Close, navigation, and compact utility controls with accessible names.

---

## 10. Accessibility and content resilience

### Keyboard and focus

- Compact tickets are focusable named controls with `aria-haspopup="dialog"` and a complete name containing the task title, status, marks, attachment/comment counts, and additional-task count where relevant.
- Empty eligible cells expose a named `Add task for {student} in {subject}` action to keyboard and assistive technology.
- When an expanded ticket opens, its wrapper ref focuses Description exactly once; if Description is unavailable, focus the first valid ticket control.
- The centered modal uses dialog semantics, a labelled heading, modal semantics, and a contained focus cycle.
- Escape from the ticket—including while a Type or Status badge menu is open—closes the entire ticket and clears its dropdown state. A true topmost nested modal such as attachment preview or delete confirmation may close first.
- Focus returns to the originating ticket or empty cell.
- Close, previous, next, overflow, attachment, comment, and footer actions are keyboard operable.
- Provide a keyboard-accessible Move/Copy action so drag is never the only way to relocate or duplicate a ticket.
- When a task switcher is implemented as tabs or a listbox, follow the corresponding arrow-key, Home/End, and selection behaviour consistently.
- Status and work-type choice sets behave as labelled single-choice groups, not a collection of unexplained buttons. Their option buttons use `tabIndex=-1`, receive programmatic Up/Down Arrow focus, show a standard focus ring, and select with Enter/Space.

### Labels and announcements

- Every form control has a persistent programmatic label.
- Placeholder text supplements a label; it never replaces one.
- Save success, save failure, validation failure, upload progress, comment submission, delete/undo, and reschedule results are announced through appropriately prioritised live regions without stealing focus.
- Status, type, reporter, marks, attachment count, and comment count have complete accessible names.
- Icon-only controls have tooltips and accessible names.
- Required and invalid fields expose required state, `aria-invalid`, and associated help/error text.
- Attachment controls use meaningful names such as `Preview attachment 2 of 5` and `Remove attachment worksheet.jpg`, not generic `Attachment` labels.

### Visual accessibility

- Normal text targets at least 4.5:1 contrast.
- Large text and non-text interface boundaries target at least 3:1 where applicable.
- Status and errors never rely on colour alone.
- Essential click targets are at least 24px, preferably 32px, even when the visible icon is smaller.
- Focus indicators remain visible against ivory, selected brass, and semantic status colours.
- Respect reduced-motion preferences by removing scale animation and using a short opacity transition only.

### Long and multilingual content

Test all designs with:

- Very long student names.
- Very long subject names.
- A topic spanning several words.
- A long description.
- No chapter/topic/exercise.
- English and Urdu content.
- Right-to-left text inside description and comments.
- Large comment and attachment counts.
- Decimal marks.

Do not allow long content to push footer controls outside the card or modal. Use clamping in the compact card and natural wrapping in the expanded modal.

---

## 11. Responsive rules

### Compact card

- At approximately 120px: show the complete compact hierarchy.
- Keep the matrix at 120px on narrow screens and use horizontal scrolling.
- Hide the least important secondary line first.
- Do not reduce important content to 8px.
- On touch devices, an empty eligible cell must show a persistent but quiet add icon/label; do not depend on hover.
- Compact visible icons may remain small, but their touch targets must not overlap neighbouring ticket actions.

### Expanded modal

- At all desktop widths: cap the modal at 640px.
- Below 640px: use `calc(100vw - 24px)` or a safe near/full-screen shell.
- As space narrows: the three-column Academic Details row and two-column Assignment row stack deliberately.
- Below approximately 520px: all property groups, marks controls, header actions, and attachment controls wrap into a single-column layout.
- On very narrow screens: modal can occupy the full viewport with `0-4px` outer radius.
- Header and footer remain visible while the body scrolls.
- On mobile, status/type move below the title and previous/next ticket navigation uses compact labelled controls.
- Mobile form controls and primary actions use at least `44px` height even though desktop controls remain `32-34px`.
- Apply safe-area padding to the full-screen modal footer.
- Keep the focused field and its validation message visible above the mobile software keyboard.
- Attachments become a horizontally scrollable strip with visible scroll affordance.
- Status/type tags wrap as complete units rather than clipping their text.
- The task switcher becomes a full-width `Task 1 of 3` control with previous/next buttons or a bottom-sheet index.
- Verify the complete modal at 200% text zoom without hiding footer actions or trapping content behind sticky regions.

---

## 12. Required example content

### Primary expanded-ticket acceptance frame

Use the following exact content for the primary high-fidelity expanded-ticket design:

- Subject: Mathematics.
- Student: Hassan Shahid.
- Date: 22 July 2026.
- Book: Mathematics WorkBook B.
- Chapter: Algebra.
- Topic: Simplifying Expression.
- Exercise: Worksheet 14.
- Description: Complete the worksheet.
- Reporter: Rafay Raza.
- Marks: 10 out of 10.
- Work type: Home Work.
- Status: Done.
- Attachments: 2 worksheet images.
- Discussion: 0 comments.

This completed worksheet frame must be shown over the Bird View grid in desktop and narrow-screen form. It is the primary proof that the expanded ticket in the supplied screenshot has been completely redesigned.

### Long-content stress frame

Use the following content as a second high-fidelity example to test long academic values and populated discussion:

- Subject: Mathematics.
- Student: Hassan Jawad.
- Chapter: Trigonometry Ratios.
- Topic: Applications of Trigonometric Ratios to Find Unknown Angles in Right Angled Triangle.
- Exercise: 11C.
- Description: Review Exercise to Complete.
- Reporter: Rafay Raza.
- Marks: 8 out of 10 for the completed-state example.
- Work type: Tuition Work.
- Status examples: Open and Done.
- Attachments: 2 in the populated example.
- Comments: 3 in the populated example.

Also test a sparse compact ticket with no chapter or topic. It must show the description as its meaningful title rather than rendering empty placeholders.

---

## 13. What must be avoided

- Large 16-24px corner radii.
- Glassmorphism.
- Gradients.
- Heavy background blur.
- Gold on every control.
- Oversized shadows.
- 8px meaningful body text.
- Empty labels such as `Ch: -`.
- Unexplained marks such as a standalone `8`.
- Unexplained codes such as `TW`, `O`, and `D` in the expanded view.
- Unlabelled plus buttons.
- A permanent Delete row among normal editing controls.
- Whole-card green backgrounds for every state.
- Colour-only status meaning.
- Placeholder-only form labels.
- Redesigning the surrounding Bird View page or unrelated application features.

---

## 14. Expected Antigravity deliverables

Produce or implement the following ticket visuals:

The deliverables are incomplete unless they include the exact Hassan Shahid completed worksheet frame from Section 5, with its two attachment thumbnails, `10 / 10`, `Home work`, `Done`, empty Discussion state, shared ivory background, and labelled Add-another action.

1. Empty cell — Default, hover, and keyboard-focus states.
2. Contextual create modal — Default and validation-error states.
3. Compact ticket — Open.
4. Compact ticket — In progress.
5. Compact ticket — Done with marks.
6. Compact ticket — Selected.
7. Compact ticket — Multiple tasks in one cell.
8. Compact ticket — Sparse content with no chapter/topic.
9. Compact ticket — Saving and save-error states.
10. Expanded ticket — View mode.
11. Expanded ticket — Edit mode.
12. Expanded ticket — Read-only mode.
13. Expanded ticket — Populated Open ticket.
14. Expanded ticket — Done ticket with marks.
15. Expanded ticket — Attachments and comments populated.
16. Expanded ticket — Multiple-ticket navigation.
17. Expanded ticket — Saving, saved, validation, and save-error states.
18. Expanded ticket — Narrow-screen/mobile adaptation.
19. Hover, focus, disabled, destructive, and overflow-menu states.
20. A concise token sheet covering colour, type, spacing, shape, icon, and state mappings.
21. Reschedule date surface — Default, validation, saving, failure, and success.
22. Attachment lifecycle — Empty, uploading, uploaded, failed, limit reached, and preview.
23. Discussion lifecycle — Empty, posting, reply, failure, long thread, and deletion.
24. Delete confirmation, deletion failure, and seven-second Undo notification.
25. Annotated keyboard, screen-reader, focus, and touch behaviour.

If implementing the design, preserve the existing data, actions, and Bird View behaviour. Limit changes to ticket-related presentation and component structure.

---

## 15. Acceptance checklist

- [ ] Compact ticket remains readable inside the existing Bird View cell.
- [ ] User can identify status, task, marks, reporter, attachments, comments, and work type without opening it.
- [ ] Empty chapter/topic/exercise values are not printed as dashes.
- [ ] Marks are displayed as earned out of total.
- [ ] Multiple tickets in one cell are visibly indicated.
- [ ] Selected styling is independent from status styling.
- [ ] Expanded modal uses full labels instead of cryptic abbreviations.
- [ ] The primary expanded frame is Mathematics · Hassan Shahid with Algebra, Simplifying Expression, Worksheet 14, Complete the worksheet, two attachments, Rafay Raza, 10/10, Home work, Done, and zero comments.
- [ ] The expanded shell and Task Entry use the same `#FFFEFA` shared ivory surface; no separate cool-grey or pure-white modal colour system is introduced.
- [ ] The screenshot’s `HW`, `D`, bare `10`, `ACTIVITY & COMMENTS`, and unlabelled plus are replaced by complete labels and explicit actions in the expanded design.
- [ ] The reference Done ticket does not show a contradictory `Mark done` action.
- [ ] Expanded modal has a visible Close button.
- [ ] Attach and add-another-task actions are labelled.
- [ ] One Delete overflow trigger is present without duplication, and visual/DOM focus order remains Inputs -> Delete -> Type badge -> Status badge -> Add another.
- [ ] Comments are presented under `Discussion`.
- [ ] Small typography remains readable.
- [ ] Controls and cards have sharp, consistent corners.
- [ ] Antique brass is used as a restrained accent, not the dominant colour.
- [ ] Keyboard focus is clearly visible.
- [ ] Empty eligible cells communicate how to create a task without remaining visually noisy.
- [ ] Create mode inherits student, subject, and date from the selected cell.
- [ ] View, edit, and read-only modes use one stable layout.
- [ ] Loading, saving, saved, validation, and save-error feedback are designed.
- [ ] Multiple tickets can be navigated without closing the expanded modal.
- [ ] Open, In progress, Done, Pending, and Rescheduled remain visually and semantically distinct.
- [ ] Rescheduling has its own understandable date-selection flow.
- [ ] Attachment upload, failure, retry, limit, preview, and removal states are covered.
- [ ] Comment and reply empty, posting, failure, retry, and deletion states are covered.
- [ ] Delete confirmation and seven-second Undo are covered.
- [ ] Zero marks and no marks are visually different.
- [ ] Long, sparse, multilingual, and right-to-left content is handled.
- [ ] Touch users can add/open tickets and operate the modal without hover-only actions.
- [ ] Modal semantics, focus containment/restoration, labels, and live feedback are annotated.
- [ ] No unrelated page, grid, backend, permission rule, or workflow is redesigned.
