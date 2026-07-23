# MyAcademy Whole-Application UX/UI Redesign Specification

## Primary instruction for Antigravity

Redesign the **entire existing MyAcademy application** as one coherent product while preserving its current routes, data, actions, role-dependent behaviour, and major workflows.

The result must feel:

- Royal but restrained.
- Academic and trustworthy.
- Professional rather than decorative.
- Compact where users scan large datasets.
- Calm and structured where users complete forms.
- Sharp-edged, precise, and self-explanatory.

Use the design direction named **Royal Academic Ledger** throughout the application.

Do not make unrelated backend, database, authentication, permission, or workflow changes as part of the visual redesign. Do not add non-existent modules such as messaging, WhatsApp, marketing, reporting, or a parent portal.

Before implementing code, Antigravity must read:

1. `AGENTS.md`.
2. `.agents/AGENTS.md` in full.
3. The relevant installed Next.js 16 guide under `node_modules/next/dist/docs/` before changing Next.js code.
4. `docs/design/BIRD_VIEW_COMPLETE_PAGE_DESIGN_SPEC.md` before changing any Bird View page or ticket experience.
5. `docs/design/BIRD_VIEW_TICKET_DESIGN_SPEC.md` as the subordinate detailed ticket reference.

The working tree may already contain user-owned Bird View changes. Preserve them and integrate with them rather than replacing or reverting them.

---

## 1. Design scope

### Application areas in scope

- Public login and registration.
- Authenticated application shell.
- Sidebar, top bar, profile menu, and responsive navigation.
- Task entry.
- Query entry.
- Attendance.
- Bird View, excluding duplication of the separate ticket specification.
- Syllabus entry.
- School, class, subject, book, chapter, and topic entry.
- Data directory.
- Task directory.
- Query directory.
- User/profile management.
- Account-role management.
- Registration and attendance approvals.
- Employee/candidate entry and directory.
- Owner Agent Assistant.
- Shared forms, tables, filters, dialogs, attachments, status controls, feedback, loading, empty, error, and read-only states.

### Out of scope

- New business modules.
- New database fields.
- New API contracts unless separately requested.
- Changing route URLs.
- Changing role permissions or authorization rules.
- Replacing the application's icon library solely for this redesign.
- Replacing Bird View with a conventional dashboard.
- Introducing charts or analytics where no underlying data view currently exists.
- Inventing persistent Agent chat history.
- Inventing edit/delete actions for read-only datasets.

### Existing routes that must remain represented

| Route | Existing purpose | Design family |
|---|---|---|
| `/login` | Login and account-registration modal | Authentication |
| `/` | Complete syllabus entry | Academic catalogue |
| `/task` | Create a task | Daily work |
| `/query` | Create a student query | Daily work |
| `/attendance` | Daily attendance and confirmation | Daily operations |
| `/bird-view` | Subject-by-student operational board | Operational canvas |
| `/school` | Add school/branch | Academic catalogue |
| `/classes` | Add and list classes | Academic catalogue |
| `/subject` | Add subject | Academic catalogue |
| `/book` | Add book | Academic catalogue |
| `/chapter` | Add chapter | Academic catalogue |
| `/topic` | Add topic | Academic catalogue |
| `/view-data` | Browse academic datasets | Directory |
| `/view-tasks` | Browse and edit tasks | Directory |
| `/view-queries` | Browse and edit queries | Directory |
| `/employee-record` | Add employee/candidate record | People |
| `/view-employees` | Employee/candidate directory | People directory |
| `/users` | Student, teacher, and coordinator profiles | People management |
| `/admin/users` | Account and role management | Access management |
| `/notification` | Registration and attendance approvals | Approval queue |
| `/agent` | Owner-only external agent chat | Conversation |

There is no separate home/dashboard route in the current application. Route `/` is Syllabus Entry. Do not invent a new dashboard as part of this visual scope.

---

## 2. Product information architecture

Reorganize the visible navigation labels into clearer product areas without changing route URLs.

### Recommended navigation groups

#### Daily Work

- Bird View — `/bird-view`.
- New Task — `/task`.
- New Query — `/query`.
- Attendance — `/attendance`, where currently permitted.

Bird View is the highest-priority daily surface and should be the first item in this group.

#### Academic Catalogue

- Syllabus — `/`.
- Schools — `/school`.
- Classes — `/classes`.
- Subjects — `/subject`.
- Books — `/book`.
- Chapters — `/chapter`.
- Topics — `/topic`.

#### Records

- Academic Data — `/view-data`.
- Tasks — `/view-tasks`.
- Queries — `/view-queries`.

#### People

- Profiles — `/users`.
- Employee Record — `/employee-record`.
- Employees — `/view-employees`.
- Roles & Access — `/admin/users`.
- Approvals — `/notification`.

Only show items already allowed for the current role. The redesign must not broaden access.

#### Owner Tools

- Agent Assistant — `/agent`.

### Terminology rules

- Use `Coordinator`, not `Admin`, when referring to the actual application role.
- Use `Profiles` for `/users` because it manages Student/Teacher/Coordinator profile records and credentials.
- Use `Roles & Access` for `/admin/users` because it changes account roles.
- Use `Approvals` for `/notification` because the page handles actionable queues rather than general notifications.
- Use `New Task` and `New Query` in navigation; page titles may remain `Create task` and `Record query`.
- Use sentence case for page, field, button, and menu labels.

---

## 3. Global visual concept: Royal Academic Ledger

### Design personality

The product should resemble a premium academic operations desk: measured, dependable, information-dense, and formally composed.

Royal character comes from:

- Midnight ink.
- Academic emerald.
- Restrained antique brass.
- Warm ivory and parchment surfaces.
- Fine rules and exact alignment.
- Small, confident typography.
- Sharp and consistent corners.

Royal character must not come from:

- Purple-and-gold decoration.
- Gradients.
- Glassmorphism.
- Large ornamental crests on working screens.
- Excessive shadows.
- Large rounded cards or pills.
- Decorative serif typography inside forms or tables.

### Global colour tokens

| Token | Value | Use |
|---|---:|---|
| `app.ink.950` | `#172238` | Sidebar, primary text, strong headers |
| `app.ink.800` | `#28364A` | Secondary headings |
| `app.emerald.800` | `#124D45` | Brand identity and primary actions |
| `app.emerald.700` | `#1A6358` | Primary hover |
| `app.emerald.100` | `#E5F0EC` | Selected/soft semantic surface |
| `app.brass.600` | `#B48632` | Premium accent, selected rules |
| `app.brass.100` | `#F4E9D2` | Soft accent background |
| `app.ivory.50` | `#FFFEFA` | Panels, forms, dialogs |
| `app.canvas.100` | `#F4F1E9` | Application workspace background |
| `app.canvas.200` | `#ECE7DC` | Secondary surface |
| `app.border.300` | `#D8D2C5` | Default border and dividers |
| `app.muted.600` | `#687286` | Secondary text and icons |
| `app.focus.600` | `#2463EB` | Keyboard focus |
| `app.success.700` | `#26705A` | Success and completed states |
| `app.warning.700` | `#9A6818` | Warning and pending states |
| `app.danger.700` | `#A33B3B` | Errors and destructive actions |
| `app.info.700` | `#365D7A` | Neutral information |

Do not continue using the existing fluorescent `success #33cc33` or `danger #ff3300` as primary semantic colours.

### Role colours

Role colour supplements a visible role label; it never replaces the label.

| Role | Accent |
|---|---|
| Owner | Deep emerald |
| Coordinator | Muted plum |
| Teacher | Burnished ochre |
| Assistant | Slate blue |
| Student | Academic blue |
| Parent | Muted rosewood |

Identity/avatar colours must appear less saturated than semantic status colours so avatars do not look like warnings or statuses.

### Typography

Use the application's existing `Inter` font.

| Style | Desktop specification | Use |
|---|---|---|
| Page title | `22px / 28px`, semibold | Primary page heading |
| Modal title | `17-18px / 23px`, semibold | Dialog heading |
| Section title | `14-16px / 20px`, semibold | Form/table section |
| Body | `13px / 19px`, regular | Standard content |
| Compact body | `12px / 16px` | Tables, filters, compact controls |
| Field label | `11px / 14px`, medium | Persistent labels |
| Metadata | `10px / 13px`, medium | Counts, timestamps, compact context |
| Dense Bird View text | Follow ticket specification | Specialised operational canvas |

Rules:

- Use sentence case by default.
- Reserve uppercase for short status labels, table headers, and overlines.
- Avoid `font-black` for ordinary UI content.
- Use tabular numerals for dates, counts, marks, attendance totals, and table IDs.
- Do not use important text below 10px.

### Spacing

Use a strict 4px base scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48`.

- Page gutter: 24px desktop, 16px tablet, 12px mobile.
- Panel padding: 16-20px.
- Form section gap: 20-24px.
- Field-row gap: 12-16px.
- Compact toolbar gap: 8px.

### Corners

| Element | Radius |
|---|---:|
| Status/type tag | `2px` |
| Input/button | `3px` |
| Compact card | `2-3px` |
| Panel/table container | `4-6px` |
| Dialog | `6px` |
| Avatar | Circular |

Avoid `rounded-xl`, `rounded-2xl`, and large pill shapes except where a circular identity/count treatment has an explicit purpose.

### Elevation

- Cards and tables: border only by default.
- Raised panel: `0 4px 14px rgba(23,34,56,0.08)`.
- Dialog: `0 18px 55px rgba(23,34,56,0.22)`.
- Do not stack multiple large shadows.

### Motion

- Standard state transition: `120-160ms`.
- Dialog entrance: opacity plus scale from `0.985` to `1`.
- Sidebar: `180-220ms` width/transform.
- No bouncing or large scaling.
- Provide reduced-motion behaviour.
- Never use infinite pulse for routine information.

---

## 4. Application shell

### Desktop shell

- Sidebar collapsed width: `64px`.
- Sidebar expanded width: `240px`.
- Sidebar brand/header height: `48px`.
- Top bar height: `48px` so shell edges align.
- Sidebar background: midnight ink.
- Main canvas: warm parchment.
- Standard pages scroll in the main content region.
- Bird View owns its internal full-canvas scrolling.

### Sidebar

Expanded navigation item:

- Height: `34px`.
- 14px icon inside a 28-32px icon area.
- 12px label.
- 3px corner radius.
- Active item: subtle brass/emerald surface plus a 2px brass left rule.
- Hover: soft white transparency, no scaling.

Collapsed navigation:

- Icon centred.
- Keyboard-accessible tooltip shows the complete label.
- Section boundaries remain visible through thin rules.
- Notification/approval count can appear as a small, labelled count indicator.

Footer:

- A clearly named expand/collapse button.
- Do not rely on an unexplained chevron alone.

### Mobile navigation

- Sidebar becomes a modal navigation drawer.
- Width: minimum of `86vw` and `300px`.
- The drawer includes product name, role, navigation groups, profile, and logout.
- Use a visible Close button.
- The background is inert while open.
- Return focus to the menu button when closed.

### Top bar

Left:

- Navigation toggle.
- Optional breadcrumb on desktop.

Centre/primary region:

- Page title aligned consistently rather than manually centred between unequal controls.

Right:

- Optional page-level quick action.
- Profile trigger with avatar and accessible name.

Every current route needs an explicit page-title mapping, including `/agent` and `/admin/users`.

### Profile menu

- Identity block with full name and role.
- `Sign out` as a labelled menu item.
- Provide loading and failure feedback.
- Escape and outside click close the menu.

### Page width templates

| Template | Width behaviour |
|---|---|
| Standard form | `max-width: 920px`, centred |
| Long form | `max-width: 1120px`, centred |
| Directory/table | Full available width with page gutters |
| Operational canvas | Edge-to-edge inside shell |
| Conversation | `max-width: 920px`, centred |

Do not use negative margins as a normal page-layout technique.

---

## 5. Shared page templates

### A. Entry template

Used by:

- Syllabus.
- School.
- Subject.
- Classes.
- Book.
- Chapter.
- Topic.
- Task.
- Query.
- Employee Record.

Structure:

```text
Page overline / breadcrumb
Page title                         Optional secondary action
One-sentence purpose or context

┌ Section panel ───────────────────────────────────────────┐
│ Section heading                                          │
│ Responsive field grid                                    │
│ Inline help / validation                                 │
└───────────────────────────────────────────────────────────┘

Draft/saving feedback                  Secondary   Primary
```

Rules:

- Use one column below 640px.
- Use two columns only when fields form a meaningful pair.
- Full-width fields: descriptions, addresses, attachments, multi-selects.
- Show dependency explanations instead of silently disabled fields.
- Keep the primary action in a predictable footer location.
- Retain entered values after a retryable failure.

### B. Directory template

Used by:

- Data View.
- Task View.
- Query View.
- View Employees.
- Profile lists.

Structure:

```text
Page title / record count                         Primary action
Search                         Filters   View options
Active filter chips
┌ Sticky-header table or responsive record list ───────────┐
│ Rows                                                     │
└───────────────────────────────────────────────────────────┘
Result count / state feedback
```

Rules:

- Search is the first toolbar control.
- Filter button includes active count.
- Active filters appear as removable chips.
- Clear All is text, not only an X icon.
- Keep identifying columns visible where practical.
- Wide tables scroll horizontally inside one controlled region.
- Mobile uses compact record cards or an explicit horizontal table treatment; do not randomly hide critical fields.
- Row actions use a consistent action menu.
- Empty and filtered-empty states are different.

### C. Operational template

Used by Bird View and Attendance.

- High-density toolbar.
- Sticky operational controls.
- Keyboard focus is intentionally designed.
- Status appears directly in the working surface.
- Avoid standard large form-card spacing.

### D. Management template

Used by Profiles, Roles & Access, and Approvals.

- Clear current mode or tab.
- Person identity remains visible during actions.
- High-impact actions explain consequences.
- Detail, edit, and review overlays share one dialog system.

### E. Conversation template

Used by Agent Assistant.

- Calm empty state.
- Readable message width.
- Sticky composer.
- Robust Markdown presentation.
- Visible connection/loading/error states.

---

## 6. Shared component specification

### Buttons

| Variant | Use | Visual treatment |
|---|---|---|
| Primary | One main page/modal action | Emerald fill, ivory text |
| Secondary | Cancel, alternative action | Ivory fill, ink border |
| Quiet | Low-priority toolbar/menu action | Transparent, subtle hover |
| Danger | Confirmed destructive action | Oxblood fill or border |
| Icon | Close, menu, navigation | 14px icon inside 28-32px target |

- Compact height: 32px.
- Standard height: 36px.
- Radius: 3px.
- Use visible labels for unfamiliar actions.
- Disabled state must remain legible.
- Loading state preserves button width.

### Form fields

- Persistent label above control.
- Standard height: 36px.
- Compact height: 32px.
- Text size: 12-13px.
- Radius: 3px.
- Focus: visible 2px focus-blue indicator.
- Help text: 11px muted.
- Error text: 11px danger with icon and programmatic association.
- Required state is communicated in text, not only by colour or an asterisk.

### Dependent select/combobox

States:

- Loading options.
- Disabled until parent selected.
- No matching options.
- Selected.
- Error.

Example guidance:

`Select a subject before choosing a book.`

Use searchable comboboxes for long Student, Subject, Book, Chapter, Topic, and Employee lists.

### Status badge

- Icon plus readable text.
- 2px radius.
- Light semantic background, dark semantic text, 1px border.
- Do not rely on colour alone.
- Use one mapping for the same status across cards, tables, forms, and dialogs.

### Alerts and feedback

Provide shared variants:

- Informational.
- Success.
- Warning.
- Error.

Feedback layers:

- Field-level error for one input.
- Inline alert for a section/page condition.
- Toast for completed background or temporary actions.
- Dialog for consequential confirmation.

Replace routine `window.alert()` and `window.confirm()` presentation with the shared system when within visual scope.

### Dialog system

All dialogs share:

- Consistent overlay.
- 6px panel radius.
- Header with visible title and Close button.
- Scrollable body.
- Predictable footer.
- Escape behaviour.
- Focus containment and restoration.
- Dirty-form close handling where relevant.
- Full-screen mobile adaptation.

Recommended widths:

- Confirmation: 400-440px.
- Standard editor: 600-680px.
- Large record editor: 800-960px.
- Image viewer: viewport-responsive.

### Tables

- Header height: 36px.
- Compact row: 36-40px.
- Standard row: 44-48px.
- Header text: 10px uppercase with modest tracking.
- Body text: 12px.
- Fine horizontal rules; minimal vertical rules.
- Row hover does not change layout.
- Inline edit must visibly distinguish display and edit states.
- Saving/error state belongs to the edited cell or row.
- Use complete accessible column headers.

### Tabs

- Use an underline or sharp segmented control, not rounded pills.
- Active tab uses ink text and a 2px brass/emerald indicator.
- Counts may appear as compact square-rounded badges.
- Support horizontal scrolling on mobile.

### Empty, loading, and error states

Every data surface must define:

- Initial skeleton.
- True empty state.
- Filtered-empty state.
- Error with Retry.
- Permission-limited/read-only state.

Avoid plain unstyled `Loading...` or `No data` text.

### Attachments and images

Use one attachment language across Task, Query, Bird View, and directories:

- `Attach files` labelled action.
- Thumbnail strip.
- Upload/crop/progress state.
- File count.
- View/remove actions.
- Shared image viewer.
- Clear failure and retry state.

---

## 7. Authentication design

### Login page — `/login`

Desktop layout:

- Left 44% brand panel in midnight ink.
- Right 56% ivory login area.
- No gradient or glass sphere.
- Brand panel uses a restrained academic line pattern, small crest/school icon, product name, and one concise value statement.
- Login form width: 380-420px.

Login form:

- `Welcome back` title.
- Username.
- Password with labelled show/hide action.
- Sign in primary action.
- Registration secondary action.
- Inline invalid-credentials and pending-approval messages.

Mobile:

- Brand panel becomes a compact 104-120px header.
- Login form follows immediately.
- Preserve a clear product identity without occupying half the viewport.

### Registration

Keep the existing fields but group them into three understandable stages inside the existing modal flow:

1. Identity and contact.
2. Designation and role-specific details.
3. Credentials and review.

Show:

- Stage indicator.
- Back and Continue.
- Student-only guardian fields only after Student is selected.
- Password match feedback while typing.
- Final statement that registration requires Owner approval.
- Dirty-form close confirmation.

Success state:

- Confirmation icon.
- `Registration submitted`.
- Clear explanation that access is unavailable until approval.
- Return to sign-in action.

---

## 8. Daily Work designs

### Task Entry — `/task`

Use the same Royal Academic Ledger language as the Bird View expanded task.

Page layout:

- Standard/long entry template, maximum 960px.
- Context header: assignee, class, reporter.
- Academic Scope section: subject, book, chapter, topic, exercise.
- Work Details section: type, status, due date, marks when Done.
- Task Brief section: description.
- Attachments section.
- Sticky/form footer with Save Task.

Important states:

- Student self-assignment/read-only context.
- Staff-selected assignee.
- Cascading field loading/empty/disabled states.
- Persistent absent/leave warning below the header.
- Done status reveals earned/total marks.
- Image select, crop, preview, remove, limit, and failure.
- Submitting, success, and retained-form error.

### Query Entry — `/query`

Use the same form anatomy as Task Entry so the two feel related.

Sections:

- Student Context: student, class, school, teacher.
- Academic Scope: subject, book, chapter, topic, exercise, page.
- Query Details: status and statement.
- Evidence: image attachments.
- Submit Query footer.

Distinguish Query visually through a question/annotation icon and a muted information-blue accent, not an unrelated colour system.

Important states:

- Student fixed to self versus staff selection.
- Teacher defaulted/selected/missing.
- Attendance warning.
- Empty curriculum dependency.
- Image crop/upload state.
- Submission success/error.

---

## 9. Attendance design — `/attendance`

### Page anatomy

```text
Attendance                          Date [23 July 2026]
Daily presence and exception record

[Students 32] [Teachers 8] [Coordinators 2]

Summary: Present 26 · Absent 3 · Late 2 · Leave 1

┌ Attendance table ────────────────────────────────────────┐
│ Person | Class/Dept | Present Absent Late Leave | Reason │
└───────────────────────────────────────────────────────────┘

Record status / validation                       Save attendance
```

### Visual rules

- Tabs use the shared sharp tab pattern.
- Date control remains prominent but compact.
- Summary counts use labelled metadata, not decorative dashboard cards.
- Status choices are a keyboard-capable segmented radio group.
- Selected status has icon, label, and faint row tint.

Suggested row tints:

- Present: faint emerald.
- Absent: faint oxblood.
- Late: faint amber.
- Leave: faint muted plum.

### Locked record

- Show a lock icon and `Attendance saved` banner.
- Inputs become readable property values rather than low-contrast disabled controls.
- Owner/Coordinator receives an explicit `Edit record` action.
- Confirmable records show `Awaiting owner confirmation` and `Confirm attendance`.

### Validation

- Non-present statuses reveal/require Reason.
- Missing reasons are indicated at row level and summarised above the Save action.
- Do not rely on a submission-time alert alone.

---

## 10. Bird View design — `/bird-view`

Bird View remains the specialised, full-canvas, highest-density operational workspace.

The complete whole-page specification is:

`docs/design/BIRD_VIEW_COMPLETE_PAGE_DESIGN_SPEC.md`

Use it for the toolbar, matrix, Grid/Stacked and Task/Query modes, headers, cell states, compact/expanded ticket integration, overlays, responsive behaviour, accessibility, and Safari geometry.

### Whole-page treatment

- Use edge-to-edge canvas inside the shell.
- Page title bar and Bird View toolbar form one aligned compact system.
- Preserve sticky student headers and subject column.
- Preserve Grid and Stacked modes.
- Preserve Task/Query switch, filters, date picker, batch mode, student selection, search, keyboard navigation, drag/drop, copy/paste, Undo, and edit mode.

### Toolbar grouping

From left to right:

1. Task/Query mode.
2. Grid/Stacked view.
3. Status and type filters.
4. Batch selection state.
5. Date.
6. Student group/selection.
7. Student search.

Use separators between groups. Full labels appear in open menus; toolbar labels may be compact.

### Ticket experience

The detailed ticket reference is:

`docs/design/BIRD_VIEW_TICKET_DESIGN_SPEC.md`

Use it only where it does not conflict with the latest `.agents/AGENTS.md` focused rules or the complete whole-page specification. In particular, the current expanded-ticket maximum is 640px, Absent/Leave cells remain clickable for view/override, and the board retains explicit 80px + 120px geometry.

### Mandatory Bird View engineering constraints

- Do not apply relative positioning, transforms, transitions, scale, or interactive backgrounds directly to table `td`/`th` elements.
- Use inner full-size wrappers for interaction and positioning.
- Keep explicit table pixel width and Safari column constraints.
- Preserve exact keyboard, focus, dropdown, Escape, reschedule, absent/leave, and drag/drop rules in `.agents/AGENTS.md`.

---

## 11. Academic Catalogue designs

Treat Schools, Classes, Subjects, Books, Chapters, Topics, and Syllabus as one connected product family.

### Shared catalogue context

Use a compact dependency trail where relevant:

```text
School / Class / Subject → Book → Chapter → Topic → Syllabus
```

The trail shows the user's current location; it does not imply relationships that the backend cannot enforce.

### School Entry — `/school`

Sections:

- School identity: name, code.
- Location: branch, city, address.
- Primary action: Add school.

Use a maximum form width of approximately 760px.

### Class Entry — `/classes`

- Compact Add Class form at the top or left.
- Existing classes below in a clean, dense collection.
- Class items use sharp bordered tiles rather than reusing input styling.
- Provide loading, empty, duplicate, success, and error states.

### Subject Entry — `/subject`

- Subject name and code in one paired row.
- Primary action: Add subject.
- Keep the small form intentionally narrow.

### Book Entry — `/book`

Sections:

- Publication: title, edition, publisher.
- Academic assignment: classes, subject, school.
- Multi-class selection uses labelled removable choices, not tiny pills with ambiguous close icons.
- Primary action: Add book.

### Chapter Entry — `/chapter`

Sections:

- Academic context: subject, class, book.
- Chapter details: number, title, page.
- Disabled dependency fields explain what must be selected first.
- Primary action: Add chapter.

### Topic Entry — `/topic`

Sections:

- Academic context: subject, class, book, chapter.
- Topic details: local number, topic name, page.
- Exercise appears for Mathematics using the existing behaviour.
- Explain how local topic number is combined with chapter number.
- Primary action: Add topic.

### Syllabus Entry — `/`

This is the most complete catalogue form.

Sections:

1. Institution: school.
2. Academic Context: subject, class, book, edition.
3. Curriculum Position: chapter and topic numbers/names.
4. Learning Detail: exercise, page, description.

Use a compact selected-context summary above the footer so users can verify the full hierarchy before submission.

### Persistent draft feedback

Catalogue forms currently preserve browser drafts. Show a small consistent state:

- `Draft restored`.
- `Draft saved locally`.
- `Clear draft`.

Do not let draft feedback compete with the primary submission action.

---

## 12. Directory designs

### Academic Data — `/view-data`

Header:

- Title: `Academic data`.
- Active-tab record count.
- Search and date filters.

Tabs:

- Syllabus.
- Subjects.
- Schools.
- Books.
- Chapters.
- Topics.

Rules:

- Tabs scroll horizontally on mobile.
- Changing tabs keeps the toolbar stable.
- Each table uses the shared directory language.
- Empty dataset differs from no filtered results.
- Staff-only contextual Add action may link to the existing entry route; do not show it to users without current access.

### Task Directory — `/view-tasks`

Toolbar:

- Global search.
- Date range.
- Status.
- Work type.
- Assignee.
- Subject.
- Class.
- Active filter chips and Clear All.

Table priorities:

1. Assignee.
2. Status.
3. Work type.
4. Subject/task summary.
5. Due date.
6. Marks.
7. Attachments/comments.
8. Remaining academic fields.

Inline editing:

- Display mode looks like a normal cell.
- Hover/focus reveals edit affordance.
- Edit mode uses the shared compact field.
- Saving and failure appear at cell/row level.
- Read-only fields do not look broken or disabled.

Use the same attachment, discussion, status, work-type, and reschedule treatments as Bird View.

### Query Directory — `/view-queries`

Toolbar:

- Search.
- Date range.
- Status.
- Teacher.
- Student.
- Subject.
- Class.

Table priorities:

1. Student.
2. Status.
3. Query statement.
4. Teacher.
5. Subject/topic.
6. Date.
7. Attachments.
8. Edit action.

Query edit modal:

- Uses the shared large-dialog shell.
- Read-only student/teacher/class values appear as property rows.
- Editable curriculum, statement, page, status, and images use standard fields.
- Dirty, saving, success, and error states are visible.

Image viewer:

- One consistent previous/next pattern.
- Image count and current index.
- Copy action with success/failure feedback.
- Visible Close action.
- Touch-friendly controls on mobile.

---

## 13. People and access designs

### Profiles — `/users`

Make the difference between profile records and role access explicit.

Top modes:

- `Directory`.
- `Add profile`.

Directory groups/tabs:

- Students.
- Teachers.
- Coordinators.

Directory row/card:

- Avatar.
- Full name.
- Profile type.
- Contact/email.
- Student class/status when relevant.
- View and Edit actions.

Add Profile form sections:

1. Profile type.
2. Identity.
3. Contact.
4. Student academic/guardian information when applicable.
5. Login credentials.
6. Review and confirmation.

Subject multi-selection:

- Searchable choice list.
- Selected subjects shown as compact labelled tags.
- `All Junior Subjects` remains an explicit shortcut with an explanation.

Detail and edit modals use the shared dialog system rather than separate overlay languages.

### Roles & Access — `/admin/users`

Purpose statement:

`Manage account roles and application access. Profile details are managed separately.`

Use grouped role sections or one filterable table while preserving current role grouping.

Each account item shows:

- Avatar.
- Full name.
- Username.
- Current role badge.
- Role selector.
- Per-row saving/error state.

High-impact role changes require a concise confirmation explaining that related profile behaviour may change.

### Approvals — `/notification`

Rename the visible page to `Approvals`.

Tabs:

- Registrations.
- Attendance.

Registration queue:

- Pending items first.
- Name, requested designation, contact, submitted date, and status.
- Primary action: Review.
- Review dialog contains editable submitted details and Approve/Decline actions.
- Approved and declined entries remain visibly resolved and non-actionable.

Attendance queue:

- Date.
- Number of unconfirmed records.
- Status.
- Review Attendance action.

The current page has contrast and undefined-style problems. Rebuild its presentation entirely from shared tokens and components rather than preserving its current dark inline styling.

---

## 14. Employee and candidate designs

### Employee Record — `/employee-record`

Use the long-form entry template.

Sections:

1. Personal information.
2. Contact information.
3. Education and specialisation.
4. Employment status.
5. Employment dates.
6. Professional link.

Conditional behaviour:

- Specialisation appears according to degree logic already present.
- Employment dates follow current status behaviour.
- `Currently working` disables end date and visibly explains the state.

Footer:

- Validation summary when required.
- Submit record primary action.

### Employee Directory — `/view-employees`

Use the shared directory template.

Priority columns:

- Name.
- Status.
- Contact.
- Email.
- Degree/specialisation.
- Employment dates.
- LinkedIn.

Coordinator view:

- Read-only directory and detail presentation.

Owner view:

- Edit action opens shared large-dialog editor.

On mobile, use record cards with the most important identity/status information and an explicit View action instead of compressing every table column.

Do not imply that an Employee Record automatically has an application account.

---

## 15. Agent Assistant design — `/agent`

### Page layout

- Conversation area centred at maximum 920px.
- Compact page header: `Agent Assistant` and connection/status area.
- Empty state with icon, short explanation, and 3-4 suggested prompt buttons.
- User messages aligned right with restrained emerald treatment.
- Agent responses aligned left on ivory surface with an ink border.
- Sticky composer at bottom.

### Composer

- Multiline input.
- Send action.
- Clear disabled/loading state.
- Enter behaviour remains consistent with the current application intent.

### Markdown

- Readable paragraphs.
- Proper heading hierarchy.
- Tables inside controlled horizontal overflow.
- Code blocks with copy action and dark-ink theme.
- Links visibly identifiable.

### Required states

- Verifying Owner access.
- Access denied.
- Empty conversation.
- Sending.
- Agent responding.
- Response rendered.
- Service unavailable.
- Retry.

Do not design a persistent conversation-history sidebar because the current application does not persist chat history.

---

## 16. Responsive strategy

### Breakpoints

- Mobile: `<640px`.
- Tablet: `640-1023px`.
- Desktop: `1024-1439px`.
- Wide desktop: `>=1440px`.

### Forms

- One column on mobile.
- Two columns on tablet/desktop only for related fields.
- Sticky footer becomes normal-flow footer when it would cover mobile content.

### Directories

- Keep search and Filter visible.
- Additional controls move into Filter panel.
- Use responsive record cards when a table cannot retain identity and action clarity.
- Do not hide status, person identity, or primary action.

### Bird View

- Remains desktop-first and horizontally navigable.
- Preserve its matrix rather than transforming it into unrelated mobile cards.
- Follow the dedicated Bird View and ticket specifications.

### Dialogs

- Standard margin: 12px on narrow screens.
- Large editors become full-screen sheets below approximately 640px.
- Header/footer remain visible while body scrolls.

---

## 17. Accessibility and interaction requirements

- Provide a skip link and a semantic main content region.
- Every icon-only action has an accessible name.
- Visible keyboard focus uses the shared focus token.
- Do not remove outlines without a replacement.
- Modal focus is contained and restored.
- Escape closes the appropriate overlay according to existing workflow rules.
- Status never depends only on colour.
- Fields have real labels and associated error text.
- Loading regions expose busy/status semantics.
- Toasts and form results use appropriate live regions.
- Table headers identify their scope.
- Touch/click targets are at least 24px and preferably 32px.
- Support 200% browser zoom.
- Support long names and curriculum values.
- Support English and Urdu content without clipping.
- Respect reduced-motion preferences.

---

## 18. Universal state checklist

Every applicable page/component must have designed states for:

- Initial loading.
- Loaded.
- True empty.
- Filtered empty.
- Partial-data failure.
- Full error with Retry.
- Read-only.
- Permission denied.
- Dirty form.
- Validation error.
- Saving/submitting.
- Saved/success.
- Optimistic pending.
- Optimistic rollback/failure.
- Destructive confirmation.
- Undo where the existing workflow supports it.
- Slow connection.
- Mobile.
- Keyboard focus.

Do not present only ideal, fully populated desktop screens.

---

## 19. Recommended design and implementation sequence

### Phase 1: Foundations

- Global tokens.
- Typography.
- Spacing.
- Corners.
- Focus.
- Motion.
- Icons.
- Story/examples for every semantic state.

### Phase 2: Shell and shared components

- Sidebar.
- Top bar.
- Profile menu.
- Page header.
- Buttons.
- Form fields.
- Status badges.
- Alerts/toasts.
- Dialog.
- Table and filter toolbar.
- Empty/loading/error states.

### Phase 3: Catalogue and entry forms

- School, Class, Subject.
- Book, Chapter, Topic.
- Syllabus.
- Shared dependency and draft feedback.

### Phase 4: Daily work

- Task Entry.
- Query Entry.
- Attendance.
- Shared attachments and image crop/view presentation.

### Phase 5: Directories

- Academic Data.
- Tasks.
- Queries.
- Employees.

### Phase 6: People and access

- Profiles.
- Roles & Access.
- Approvals.
- Employee Record.

### Phase 7: Bird View integration

- Apply shared shell/tokens/toolbars without breaking specialised geometry.
- Integrate the dedicated ticket specification.
- Preserve Safari, keyboard, focus, drag/drop, and optimistic-update rules.

### Phase 8: Authentication and Agent polish

- Login and registration.
- Agent Assistant.
- Final responsive/accessibility consistency pass.

Each phase must preserve user-owned work and be reviewed before broad mechanical replacement of styles.

---

## 20. Expected Antigravity deliverables

### Design-system deliverables

- Colour variables.
- Typography scale.
- Spacing scale.
- Radius and shadow scale.
- Button variants.
- Field variants.
- Status/type/role tags.
- Alerts and toast.
- Dialog system.
- Table and filter system.
- Empty/loading/error states.
- Attachment/image system.

### Screen deliverables

Produce high-fidelity desktop designs for:

1. Login.
2. Registration.
3. Authenticated shell expanded/collapsed.
4. Syllabus Entry.
5. One simple catalogue form: Subject.
6. One dependent catalogue form: Topic.
7. Task Entry.
8. Query Entry.
9. Attendance editable.
10. Attendance locked/confirmation.
11. Bird View grid.
12. Bird View stacked mode.
13. Compact and expanded ticket states from the ticket specification.
14. Academic Data directory.
15. Task Directory.
16. Query Directory and image viewer.
17. Profiles directory and add flow.
18. Roles & Access.
19. Approvals.
20. Employee Record.
21. Employee Directory.
22. Agent Assistant empty/responding/error states.

Also provide mobile adaptations for:

- Login/registration.
- Standard entry form.
- Directory/record card.
- Navigation drawer.
- Standard dialog.
- Task/Query form.
- Attendance.

Bird View remains a specialised horizontally navigable surface; demonstrate its narrow-screen behaviour rather than replacing it.

### If implementing code

- Create shared primitives before copying page-specific styles.
- Do not rewrite business logic solely to achieve visual consistency.
- Do not change APIs or schema unless separately approved.
- Do not revert existing changes.
- Verify every existing primary action still works.
- Follow Next.js 16 installed documentation.
- Follow all `.agents/AGENTS.md` focused rules.

---

## 21. Application-wide acceptance criteria

- [ ] Every existing route has an intentional design.
- [ ] All screens look like one product rather than unrelated templates.
- [ ] Bird View remains the most compact and operationally important surface.
- [ ] The separate Bird View ticket specification is followed.
- [ ] Navigation groups are understandable and role-aware.
- [ ] Sidebar and top bar geometry align.
- [ ] Every route has the correct page title.
- [ ] No important text is below 10px.
- [ ] Page, section, field, and metadata typography is consistent.
- [ ] Inputs and buttons use shared heights and sharp radii.
- [ ] Status, type, and role meanings include visible text/icons, not colour alone.
- [ ] Forms stack correctly on mobile.
- [ ] Dependent fields explain why they are disabled or empty.
- [ ] Directory toolbars share the same search/filter/chip structure.
- [ ] Tables share typography, headers, row density, inline-edit, and empty states.
- [ ] Dialogs share overlay, header, footer, Close, Escape, focus, and responsive behaviour.
- [ ] Attachments use one presentation across Task, Query, Bird View, and directories.
- [ ] Loading, empty, filtered-empty, error, success, and read-only states are designed.
- [ ] Destructive actions are visually separated from routine actions.
- [ ] Registration clearly explains Owner approval.
- [ ] Attendance clearly distinguishes editable, saved/locked, and confirmed records.
- [ ] Profiles and Roles & Access are clearly different concepts.
- [ ] Employee records do not imply application accounts.
- [ ] Agent Assistant does not imply persistent history.
- [ ] No non-existent modules are presented as implemented.
- [ ] Application code, data, routes, workflows, and permissions remain intact unless separately approved.
- [ ] Keyboard focus, zoom, mobile, and reduced-motion behaviour are verified.

---

## 22. Final design direction

The finished application should feel like a single premium academic operations system:

- Midnight ink gives authority.
- Academic emerald supplies identity and primary action.
- Antique brass marks selection and importance.
- Warm ivory makes dense information easier to read.
- Fine rules and sharp corners create precision.
- Inter typography maintains clarity at compact sizes.
- Shared components make every workflow predictable.

The aim is not to make MyAcademy visually luxurious at the expense of usability. The aim is to make it feel **well-governed, deliberate, fast, and trustworthy** across every existing screen.
