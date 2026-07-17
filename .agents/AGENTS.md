<!-- BEGIN:bird-view-rules -->
# Bird View Page (src/app/(dashboard)/bird-view/page.tsx) Guidelines

When modifying the Bird View grid, strictly follow these layout and functionality rules:

1. **Table Cell Safari Bug (CRITICAL)**: 
   - NEVER apply `transition`, `transform`, `scale`, or dynamic interactive background colors directly to `<td>` or `<th>` elements. This fundamentally breaks Safari's table rendering engine.
   - ALWAYS wrap the cell content in an inner `<div>` that has `w-full h-full`. Apply all hover, transition, scaling, and z-index behaviors to this inner `<div>`.

2. **Column Width Consistency (Safari Override)**:
   - The left-most column (Subject codes) must be strictly clamped (e.g., `w-20 min-w-[5rem] max-w-[5rem]`).
   - Student columns are constrained by `min-w-[120px]`.
   - **CRITICAL**: Do NOT use Tailwind flexible width classes (`w-full`, `w-max`, `min-w-max`) on the `<table>` element. Safari will completely miscalculate the layout and push columns around. You MUST dynamically calculate the explicit pixel width of the table (e.g., `style={{ width: \`${80 + (activeStudentsCount * 120)}px\` }}`) and apply `mx-0 mr-auto` to force Safari to respect the constraints.


4. **Custom Colors**:
   - Due to Next.js dev server caching with Tailwind JIT, use inline styles for highly specific custom hex colors (e.g., `style={{ backgroundColor: '#254245' }}`) to prevent them from vanishing during hot-reloads.
   
5. **Drag and Drop**:
6. **Ticket Popup Tab Navigation & DOM Order**: The Tab sequence within a ticket popup must strictly follow the visual layout order: `Inputs -> Delete Button -> Badges -> Plus Button`. To achieve this, the DOM order must match the visual order. This means the Footer (Delete button) and Badge containers must be placed *after* the main content inputs in the JSX.
   
7. **Badge Dropdowns (Tab Traversal)**: The `<button>` elements representing options inside the Task Type and Status badge dropdowns MUST have `tabIndex={-1}`. The Tab key should completely ignore these options and jump over the badge to the next element. Navigation within the open dropdown must be handled exclusively via the Arrow keys (Up/Down) using programmatic `.focus()`.
   
8. **Ticket Escape Key Behavior**: The global Escape key handler must close the *entire* ticket (e.g., setting `clickedCellId` to null) and clear any open badge dropdowns simultaneously. Do not trap the Escape key to only close the dropdown while leaving the ticket open.
   
9. **Ticket Autofocus on Open**: When a ticket popup opens, it must automatically focus the Description textarea (or the first focusable input) using a `ref` callback on the popup wrapper. If this is missed, focus remains outside the popup (e.g., on the body), which causes the `Tab` key to jump to elements completely outside the ticket popup.

10. **Reschedule Date Picker Keyboard Navigation**: The reschedule modal calendar must support Arrow key navigation to change dates and Enter to submit. Ensure `e.stopPropagation()` is called alongside `e.preventDefault()` inside the `onKeyDown` handler of the date picker to prevent arrow keys from bubbling up and triggering the main board's cell navigation.

11. **Badge Dropdown Focus Highlighting**: Since badge dropdown options are navigated programmatically via Arrow keys and not via `Tab` (due to `tabIndex={-1}`), their highlight state cannot rely solely on `focus-visible`. Use standard `focus:` tailwind classes (e.g., `focus:scale-110 focus:ring-2 focus:ring-blue-500 z-10`) to ensure they visibly highlight when focused programmatically.

12. **Task View Pending Reschedule**: The "PENDING" status behavior from Bird View (prompting for a reschedule date) is also mirrored in the Task View table (`src/app/(dashboard)/view-tasks/page.tsx`). Do not blindly save a "PENDING" status change; intercept it, open the Reschedule Modal, and hit `/api/tasks/reschedule`.
<!-- END:bird-view-rules -->

<!-- BEGIN:general-workflow-rules -->
# General Agent Workflow Guidelines

1. **Commit Changes**: ALWAYS commit code after completing a reasonable chunk of work, bug fix, or rule update. Use standard `git commit -m "..."`.
2. **Do Not Push**: NEVER push the code to a remote repository (`git push`) unless the user explicitly asks you to.
3. **Do Not Build Docker Images**: NEVER run docker builds or create docker images unless explicitly requested by the user.

# Project Architecture & API Details

1. **App Structure**: The application is a Next.js (App Router) project centered around managing educational tasks and queries. The primary interface is the `Bird View` (`src/app/(dashboard)/bird-view/page.tsx`), which renders a highly complex matrix grid mapping Subjects to Students.
2. **Data Entities**: 
   - `Tasks`: Represents tuition work, homework, classwork, or projects.
   - `Queries`: Represents student questions or issues. Managed via `/api/queries/route.ts`.
3. **API Endpoints**: 
   - `GET /api/queries`: Supports advanced filtering (`studentName`, `subject`, `status`, `search` on statement, and `dateFilter`). Returns an array of records and aggregated `analytics` (`byStatus`, `bySubject`).
   - `POST /api/queries`: Creates a new query entry.
   - `DELETE /api/queries`: Deletes a query entry by ID.
4. **Optimistic Updates**: The Bird View grid relies on optimistic state updates. When creating a new task/query or copying an existing one, the UI immediately creates a temporary ID (e.g. `Date.now() + Math.random()`) and injects it into the grid state, replacing it later when the API responds.
<!-- END:general-workflow-rules -->

<!-- BEGIN:deep-project-reference -->
# Deep Project Reference (Current Repository)

This section was produced from a static audit of the complete repository on 2026-07-15. It documents what the checked-in code currently does, including inconsistencies and unsafe legacy utilities. It is not a statement that every current behavior is desirable.

When this section conflicts with a focused rule above, the focused rule wins. In particular, all Bird View layout, Safari, focus, keyboard, commit, push, and Docker restrictions above remain mandatory.

## 1. Product Scope and Current Boundaries

`data-entry-app` is the MyAcademy education-operations application. It combines these domains in one Next.js application:

- Login, self-registration, account approval, roles, and profile records.
- School, class, subject, book, chapter, topic, and syllabus data entry.
- Student task assignment and query/question tracking.
- Bird View, a date-oriented subject-by-student task/query workspace.
- Read-only dataset browsers and editable task/query tables.
- Employee/candidate record entry and review.
- An owner-only proxy UI for an external agent service.

There is currently **no messaging module**, WhatsApp integration, campaign system, queue, webhook consumer, Java service, email/SMS provider, or marketing subsystem in this repository. Any future messaging work is a new bounded context and must not be described as already implemented.

## 2. Technology Baseline

| Area | Current implementation |
|---|---|
| Web framework | Next.js `16.2.9`, App Router, standalone output |
| UI runtime | React and React DOM `19.2.4` |
| Language | TypeScript `5.9.3`; strict mode; target `ES2017`; `@/*` maps to `src/*` |
| Styling | Tailwind CSS `3.4.19`, PostCSS, Autoprefixer, global legacy form/table classes, inline styles |
| Database access | Prisma Client/CLI `5.14.0` |
| Database | PostgreSQL through `DATABASE_URL` |
| Authentication | `bcryptjs` password hashes and `jose` HS256 session JWTs |
| Images | Browser canvas plus `react-image-crop`; local filesystem persistence |
| Agent rendering | `react-markdown` with `remark-gfm` |
| Icons/fonts | Font Awesome 6.4 CDN and Inter through `next/font/google` |
| Container runtime | Multi-stage `node:20-alpine`; non-root UID/GID 1001 |
| Application port | `3005` in development, production start, Docker, and Compose |

Next.js `16.2.9` requires Node `>=20.9.0`. At the time of the audit, the host shell was Node `18.16.0`, which is unsupported for this installed Next.js version. Do not interpret a host-side failure under Node 18 as an application defect until the command is repeated with a supported Node runtime.

### Next.js 16 documentation rule

Before changing Next.js code, read the relevant local documentation under `node_modules/next/dist/docs/`. Frequently relevant files include:

- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`

The installed docs explicitly deprecate the `middleware.ts` convention in favor of `proxy.ts`. The repository still uses `src/middleware.ts`. Treat that as current legacy behavior; do not rename it as an unrelated cleanup, but use the documented `proxy` convention when a scoped migration is requested.

## 3. Runtime Architecture and Request Flow

The application is a single Next.js deployment. There is no separate backend repository or internal event bus.

```text
Browser
  -> Next.js App Router pages and client components
  -> same-origin route handlers under /api/*
  -> Prisma Client
  -> external PostgreSQL

Optional owner chat path:
Browser -> POST /api/agent/chat -> AGENT_API_URL -> external agent service

Query image path:
Browser crop -> POST /api/upload -> public/uploads/queries/... -> GET /uploads/...
```

The dashboard shell is server-authenticated, while most feature screens are client components that fetch JSON with raw `fetch()`. There is no React Query, SWR, Redux, Zustand, server actions, shared typed API client, schema validator, form library, or drag-and-drop library.

### Server/client boundary

- Server components: root layout, dashboard layout, and thin wrappers for `/`, `/book`, `/chapter`, `/school`, `/subject`, `/topic`, `/task`, `/query`, `/employee-record`, `/view-employees`, and `/view-queries`.
- Client components/pages: login, classes, Bird View, agent, role management, notifications, user management, dataset/task/query views, dashboard shell, all forms, and all interactive employee/query components.
- `src/app/(dashboard)/layout.tsx` verifies a decoded session, reads `sidebarExpanded`, and passes the session name/role and sidebar preference to `ClientLayout`.
- `ClientLayout` controls mobile/desktop layout and persists desktop sidebar state in both a cookie and `localStorage`.

## 4. Repository Map

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Root metadata, Inter font, Font Awesome CDN, global CSS |
| `src/app/login/page.tsx` | Login form and self-registration modal |
| `src/app/(dashboard)/layout.tsx` | Authenticated server layout |
| `src/app/(dashboard)/ClientLayout.tsx` | Responsive shell, sidebar state, top navigation |
| `src/components/Sidebar.tsx` | Role-conditioned navigation visibility |
| `src/components/TopNav.tsx` | Page title and sidebar toggle |
| `src/components/ProfileMenu.tsx` | Avatar, greeting, logout |
| `src/app/(dashboard)/bird-view/page.tsx` | Central 2,610-line interactive matrix/stacked workspace |
| `src/app/(dashboard)/task/*` | Task entry page and reusable task modal/form |
| `src/app/(dashboard)/query/*` | Query entry page and reusable query modal/form |
| `src/app/(dashboard)/view-tasks/page.tsx` | Filterable, editable task table |
| `src/app/(dashboard)/view-queries/*` | Filterable query table, edit modal, image viewer |
| `src/app/(dashboard)/view-data/page.tsx` | Tabs for reference/syllabus datasets |
| `src/app/(dashboard)/users/page.tsx` | Student/teacher/admin profile creation and editing |
| `src/app/(dashboard)/admin/users/page.tsx` | Account role management |
| `src/app/(dashboard)/notification/page.tsx` | Pending registration review/approval |
| `src/app/(dashboard)/employee-record/*` | Employee/candidate form |
| `src/app/(dashboard)/view-employees/*` | Employee table and owner edit modal |
| `src/app/(dashboard)/agent/page.tsx` | Owner agent chat UI |
| `src/components/*EntryForm.tsx` | Syllabus hierarchy/reference entry forms |
| `src/components/ImageCropper.tsx` | Client-side crop and JPEG conversion |
| `src/hooks/usePersistentForm.ts` | Browser draft restore/save for reference forms |
| `src/lib/auth.ts` | JWT sign/verify and session cookie helpers |
| `src/lib/prisma.ts` | Shared Prisma client factory |
| `src/middleware.ts` | Legacy global authentication redirects and limited page RBAC |
| `src/app/api/**/route.ts` | Public HTTP route handlers/BFF layer |
| `prisma/schema.prisma` | Current PostgreSQL data model |
| `prisma/dev.db` | Tracked legacy SQLite artifact; not used by the PostgreSQL datasource |
| `Dockerfile`, `docker-compose.yml`, `start.sh` | Standalone container build and startup schema push |
| Root `test-*`, `fix-*`, `check-*`, `scratch_*` files | Manual diagnostics and one-off data/source mutations; not an automated test suite |

## 5. Authentication, Sessions, and Roles

### Login/session lifecycle

1. `POST /api/auth/login` requires `username` and `password`.
2. It finds `DataentryUser` by exact username. If no account exists, it checks `PendingUser` by username and returns an approval-pending message for any matching record, regardless of its current pending/declined status.
3. `bcrypt.compare()` verifies the password.
4. `setAuthCookie()` signs a one-day HS256 JWT containing `userId`, `username`, `role`, first/last names, and a redundant `expires` field.
5. Cookie name is `session`; attributes are `httpOnly`, `sameSite=lax`, `path=/`, a one-day expiry, and `secure=false` in all environments.
6. `getSession()` verifies the JWT but does not reload account status or role from PostgreSQL.
7. Logout deletes the cookie.

`JWT_SECRET` has a hard-coded fallback in `src/lib/auth.ts`. Production must supply a strong value; never rely on the fallback. Because roles live in the JWT, an owner role change does not affect an existing session until re-login or token expiry.

### Current role enum

| Role | Current application treatment |
|---|---|
| `OWNER` | Owner tools, role management, agent, employee edit, broad task/query access |
| `COORDINATOR` | Staff behavior; employee create/view; grouped with teachers in task-user results |
| `TEACHER` | Staff task/query behavior; teacher profile category |
| `ASSISTANT` | Included with owner in task-user `admins`; mapped to Teacher profile only during role migration |
| `STUDENT` | Self-assignee defaults; name-based task filtering; client-side query filtering; Bird View student list limited to self |
| `PARENT` | Enum exists, but there is no Parent profile model or dedicated row-level data behavior |

An “Admin” selected in registration/direct user creation maps to the `COORDINATOR` role. There is no `ADMIN` enum value.

### Middleware behavior

The matcher covers almost every request except `/api/auth`, Next static/image paths, and the favicon. It first checks only whether a `session` cookie exists, then decrypts it for limited role redirects.

- Unauthenticated non-auth API requests are normally redirected to `/login`, not returned as JSON `401`.
- `/book`, `/chapter`, `/school`, `/subject`, and `/topic` redirect Student/Parent to `/view-data`.
- `/admin*` pages redirect every non-owner.
- `/employee-record*` and `/view-employees*` redirect roles other than Owner/Coordinator.
- `/`, `/classes`, `/users`, `/notification`, `/agent`, `/bird-view`, `/task`, `/query`, and all view pages are not role-restricted by the middleware.
- The `/api/admin/*` pathname does not start with `/admin`, so the page-prefix check does not secure API handlers.

Middleware/sidebar visibility is never sufficient authorization. Route handlers must enforce authorization independently.

## 6. Page and UI Route Inventory

| Route | Main behavior | Current effective access |
|---|---|---|
| `/login` | Login plus registration modal | Public |
| `/register` | No page exists, although middleware treats it as public | Public 404 |
| `/` | Cascading syllabus entry form | Any authenticated role |
| `/task` | Create task; role-adaptive reporter/assignee defaults | Any authenticated role |
| `/query` | Create query with optional cropped images | Any authenticated role |
| `/book` | Create a book for one or more comma-serialized classes | Staff roles; Student/Parent redirected |
| `/subject` | Create subject and code | Staff roles; Student/Parent redirected |
| `/classes` | Create/list classes | Any authenticated role |
| `/school` | Create school/branch | Staff roles; Student/Parent redirected |
| `/chapter` | Create chapter under subject/class/book | Staff roles; Student/Parent redirected |
| `/topic` | Create topic under subject/class/book/chapter | Staff roles; Student/Parent redirected |
| `/bird-view` | Task/query matrix and stacked board | Any authenticated role |
| `/view-data` | Read-only tabs for six reference/syllabus datasets | Any authenticated role |
| `/view-tasks` | Filter and inline-edit tasks | Any authenticated role; API applies only Student row restrictions |
| `/view-queries` | Filter/edit queries and view/copy images | Any authenticated role; Student filtering occurs after all rows reach the client |
| `/employee-record` | Create employee/candidate record | Owner/Coordinator |
| `/view-employees` | View employees; Owner can edit | Owner/Coordinator |
| `/agent` | In-memory markdown chat with external agent | Owner link, client check, and owner API check |
| `/admin/users` | Group accounts by role and change roles | Owner page/API checks |
| `/users` | Add/list/edit Student, Teacher, Admin profiles | Owner link only; no page/API owner guard |
| `/notification` | Edit/approve/decline registrations | Owner link only; current APIs lack owner guard |

Sidebar hiding is presentation only. `/users` and `/notification` are especially important examples: non-owners do not see links, but an authenticated user can navigate directly under current code.

### Dashboard shell behavior

- All roles are shown Task Entry, Query Entry, Syllabus, Book, Subject, Classes, School, Chapter, Topic, Bird View, Data View, Query View, and Task View links. Student/Parent discoverability therefore differs from the middleware redirects on some entry pages.
- Owner/Coordinator are shown Employee Record and View Employees.
- Owner alone is shown Agent Assistant, User Roles, Users, and Notification.
- Desktop sidebar width is 60px collapsed and 250px expanded. At widths below 768px it is removed when collapsed and displayed above a dark backdrop when expanded.
- The initial sidebar state is read from the `sidebarExpanded` cookie. Desktop resize recovery prefers the `localStorage` value. Toggling on desktop writes both stores.
- Active link styling uses exact pathname equality.
- Profile Menu closes on outside click or Escape and logs out through a POST followed by hard navigation.
- The registration modal has Close/Cancel controls but no Escape or backdrop-close behavior.

## 7. Core Frontend Workflows

### Syllabus/reference hierarchy

The hierarchy is represented by repeated strings, not database relations:

```text
School + Subject + Class
  -> Book
  -> Chapter
  -> Topic / Exercise / Page
  -> DataEntry syllabus description
```

- `DataEntryForm` fetches Subject, Class, and School, then cascades Book -> Chapter -> Topic.
- Topic selection can auto-populate page.
- Chapter number/name and topic number/name selects share identifiers to keep labels aligned.
- `BookEntryForm` stores multiple selected classes as one comma-separated `className` string.
- `TopicEntryForm` posts a local topic number; the API stores `${chapterNumber}.${localTopicNumber}`.
- Exercise input is shown only when the selected subject name contains `math`.
- `usePersistentForm` stores browser drafts under `draft_<form-id>`, begins listeners after 500 ms, and dispatches native `change` events during restoration.
- Successful submission does not clear stored drafts. Multi-class badge state is not faithfully represented by a normal form field.

### Task flow

`TaskEntryClient` loads task users and syllabus reference data in parallel. It derives a selected Student's class, filters books by subject/class, then filters chapters and topics.

- Student is forced as their own assignee and defaults reporter to the first owner.
- Non-students default reporter to themselves and may choose any assembled task user.
- Parent follows the non-student UI path.
- Required server fields are `createdBy`, `subject`, `description`, `reporter`, and `assignee`.
- Status values used by the UI are `OPEN`, `IN_PROGRESS`, `DONE`, and `PENDING`.
- Task types are `Home Work`, `Tuition Work`, `Class Work`, `Test`, and `Project`.
- The component is reused as a Bird View modal with prefilled subject, student, and due date.

### Query and image flow

`QueryEntryClient` derives class/school from the selected Student, filters reference data, and supports multiple cropped attachments.

1. The user selects an image.
2. `ImageCropper` reads it with `FileReader`, starts with a 90% crop, converts visual coordinates to natural image dimensions, draws to canvas, and emits JPEG quality `0.95`.
3. The client posts blobs to `/api/upload` with school, class, and student path fields.
4. Returned URLs are stored in `QueryEntry.images` during creation.

The query view can append newly uploaded images in its request, but the current `PUT /api/queries/[id]` handler ignores `images`, so those appended URLs are not persisted by that endpoint.

### Registration and profile flow

- Public registration creates a bcrypt-hashed `PendingUser`, not an active account.
- Notification approval creates `DataentryUser` plus a Student/Teacher/Admin profile in one Prisma transaction and marks the pending row approved.
- Direct creation through `/users` first creates `DataentryUser`, then creates the category profile outside a transaction.
- Direct Student creation uses raw SQL and does not set `Student.userId`.
- Role change updates `DataentryUser.role`, then best-effort deletes/creates a profile in the target table; the whole operation is not transactional.

### Employee flow

- Owner/Coordinator can create and view `EmployeeRecord` rows.
- Only Owner can update them.
- Status controls whether employment dates are shown.
- “Currently working” stores the literal string `Currently working here` in `toDate` as well as the Boolean flag.

### Read and edit views

`/view-data`

- Fetches Subject, School, Book, Chapter, Topic, and DataEntry datasets in parallel.
- Defaults to the syllabus-entry tab and renders tab-specific columns.
- Search scans stringified values of every row property.
- Date filtering is performed in the browser using `date` or `createdAt`.
- There is no pagination, server-side search, editing, or delete action.

`/view-tasks`

- Fetches Tasks plus all reference/dropdown datasets.
- Filters by free-text search, status, task type, assignee, subject, class, and date range.
- Status/type/syllabus fields use always-visible selects; description and due date use click-to-edit controls saved on blur/Enter.
- Select edits are optimistic and remain changed locally even when the API rejects the request.
- The UI does not hide editing by role; Student enforcement comes from `/api/tasks`, and other roles have broad edit access.

`/view-queries`

- Fetches Queries plus all reference/dropdown datasets.
- Filters by search, status, teacher, student, subject, class, and date range.
- Provides inline status changes, a full edit modal, a temporary “resolved” toast, attachment previews, and a circular previous/next image viewer.
- Student/Teacher/Class are read-only in the modal; syllabus fields, statement, page, and status are editable.
- Existing images cannot be removed through this modal. Newly cropped images are sent by the UI but ignored by the current update handler.
- Clipboard copy uses `navigator.clipboard`; non-PNG content is rendered through canvas for Safari compatibility.

### Owner utility pages

- `/users` has list and add modes for Student, Teacher, and Admin profiles, a confirmation modal, details modal, and edit modal. Student “All Subjects Junior” expands to a hard-coded list of English, Geography, History, Islamiat, Mathematics, Urdu, Quran Translation, and Science.
- `/admin/users` groups accounts by every Role enum value and PATCHes role changes. Student avatars use deterministic name colors.
- `/notification` keeps approved/declined rows visible, disables actions once no longer pending, and supports editing registration data before approval.
- `/agent` stores chat history only in component memory, sends `{message}` to the proxy, auto-scrolls, and renders GFM markdown. Refreshing loses the conversation.

## 8. Bird View Deep Reference

`src/app/(dashboard)/bird-view/page.tsx` is the most complex and regression-sensitive file. Read the focused rules at the top of this file before touching it.

### Data shape and loading

- Grid rows are Subjects.
- Grid columns are active Students.
- Grid cells contain Tasks or Queries matching student full name plus subject.
- Task date is `dueDate`; Query date is `createdAt`.
- Initial parallel load requests Bird View data for today/task view, chapters, topics, and task users; `/api/auth/me` is loaded separately.
- Date, active Task/Query view, or `refreshTrigger` changes refetch cell data.
- Student/subject names are string identity keys throughout cell matching.

### Layout and views

- Grid view is the subject-by-student matrix.
- Stacked view renders each student's tasks vertically, sorted `IN_PROGRESS`, `OPEN`, `PENDING`, `DONE`.
- Table width is calculated explicitly: mobile uses `64 + visibleStudents * 96`; desktop uses `80 + visibleStudents * 120`.
- The first column and headers are sticky.
- Student/subject ordering is per-browser and stored in `localStorage` key `birdViewOrder`.
- Unassigned subject/student intersections are striped and do not open an entry form.

### Toolbar and filtering

The board toolbar includes:

- Task/Query toggle.
- Grid/Stacked toggle.
- Status and task-type dropdowns.
- Batch selection.
- Custom date picker.
- Student picker with `All`, `Olevels`, `Matric`, and `Junior` heuristic categories.
- Student search.

`boardFilters` also contains `assignee` and `reporter`, but the current toolbar has no controls for those two properties.

### Ticket editing

- Empty assigned cell opens a prefilled Task/Query modal.
- Populated task cell expands into one or more editable tickets.
- Expanded tasks edit chapter, topic, exercise, description, reporter, task type, and status.
- Expanded Query cards are simplified and do not expose the full Task ticket editor.
- The plus button creates a new task optimistically with a temporary numeric ID, then replaces or removes it based on the server response.
- Chapter changes clear dependent topic/exercise values through separate PATCH calls.

### Optimistic behavior

| Operation | Current rollback behavior |
|---|---|
| Clone/copy task | Inserts temporary task; replaces on success; removes on failure |
| Ticket plus/add | Inserts temporary task; replaces on success; removes on failure |
| Inline field update | Updates immediately; logs failed response; no rollback |
| Drag move | Updates assignee immediately; no rollback |
| Batch update | Updates immediately; `Promise.all` does not reject on HTTP non-2xx; no rollback |
| Delete | Hides immediately, waits 7 seconds, then sends DELETE; only network exceptions restore visibility |

Delete confirmation supports Enter/Escape. Undo is available through the toast or Cmd/Ctrl+Z during the seven-second delay.

### Native drag and drop

- Student column reorder and Subject row reorder use native HTML5 drag events, transparent drag images, and custom floating previews.
- Reordering is local to the current browser.
- Task drag without a modifier changes assignee.
- Shift, Alt, or Meta while dropping clones the task.
- `clonedCells` prevents repeated copies into the same cell during one gesture.
- A visual drop on another Subject row still changes only assignee; task subject is not changed.

### Keyboard map

| Shortcut | Behavior |
|---|---|
| Cmd/Ctrl+Shift+F | Toggle focus of Student Search; clearing it restores column highlight behavior |
| Cmd/Ctrl+Left / Right | Previous/next date |
| Cmd/Ctrl+B | Return to today |
| Cmd/Ctrl+Shift+M | Open new Task/Query modal, using highlighted Student if available |
| Digits | Highlight visible Student by one-based position; 200 ms buffer supports multi-digit indexes |
| Shift+Digits | Highlight Subject by one-based position |
| Arrow keys | Navigate highlighted Student/Subject and scroll into view |
| `E` | Toggle grid edit mode when no input is focused |
| Edit-mode arrows | Move active grid cell |
| Edit-mode Enter | Open populated cell or create in assigned empty cell |
| Edit-mode Backspace/Delete | Begin deletion of the first task in the cell |
| Cmd/Ctrl+C or `+` | Copy first task in current cell |
| Cmd/Ctrl+V | Clone horizontally; cross-subject paste is rejected |
| Cmd/Ctrl+Z | Undo pending delayed deletion |
| Escape | Layered clear/close/focus-return behavior; ticket Escape closes entire ticket and dropdowns |

### Focus invariants

- Ticket opening must focus Description or the first focusable control.
- Ticket DOM/Tab order is Inputs -> Delete -> Badges -> Plus.
- Badge option buttons stay `tabIndex={-1}` and use Arrow-key programmatic focus.
- Ticket Tab/Shift+Tab cycles within ticket focusables.
- Date/student/filter menu options are largely removed from ordinary Tab order and arrow-focused.

### Role caveat

Bird View renders edit, batch, delete, drag, and quick-add controls for every authenticated role. The API must be the authority. Current `GET /api/bird-view` limits the Student list for a Student session but does **not** apply the same restriction to returned date cell data, so all matching tasks/queries for that date can be included in the response.

### Known Task/Query mode mismatch

Bird View chooses `/api/queries` for generic inline/batch PATCH operations in Query mode, but `/api/queries` has no PATCH handler. Query creation also requires fields that a quick blank Task-shaped add does not supply. Do not assume all shared Task/Query board interactions work for Query mode merely because the toggle exists.

## 9. API Conventions and Exact Inventory

All route handlers are public HTTP endpoints in Next.js terms. Global middleware is an optimistic request gate, not a substitute for handler authorization.

### Authentication endpoints

| Method/path | Request | Success | Important errors/notes |
|---|---|---|---|
| `POST /api/auth/login` | `{username,password}` | `200 {success,message}` and session cookie | `400` missing, `401` invalid, `403` matching pending record |
| `POST /api/auth/logout` | none | `200 {success:true}` | Deletes cookie |
| `GET /api/auth/me` | session cookie | `{user:{id,username,role,firstName,lastName,className}}` | Student class is found by first/last name, not `userId` |
| `POST /api/auth/register` | Names, credentials, contact/address/designation, optional family contacts | `201 {success,message}` | Creates `PendingUser`; username collision with active account checked, pending collision falls to `500` |

### Reference and syllabus endpoints

| Method/path | Behavior |
|---|---|
| `GET /api/subjects` | All subjects ordered by name |
| `POST /api/subjects` | Create `{name,code?}`; application-level duplicate check on name |
| `GET /api/classes` | All classes ordered by creation |
| `POST /api/classes` | Create trimmed `{name}`; DB unique violation becomes `400` |
| `GET /api/schools` | All schools ordered by name/branch |
| `POST /api/schools` | Create name/address/branch/city/code; duplicate check on name+branch |
| `GET /api/books?subject=&className=` | Optional exact subject and `className contains` filters; newest first |
| `POST /api/books` | Create title/className/subject/edition/publisher/school; duplicate check is title only |
| `GET /api/chapters?book=&subject=` | Optional exact filters; ordered by subject/book/chapter number |
| `POST /api/chapters` | Create chapter; duplicate check on subject+book+chapter number |
| `GET /api/topics?book=&chapterNumber=` | Optional filters; ordered hierarchy |
| `POST /api/topics` | Stores topic number as `chapterNumber.localTopicNumber`; duplicate check on subject+book+chapter+topic |
| `GET /api/entries` | All syllabus entries newest first |
| `POST /api/entries` | Parses numeric fields, generates locale date/time strings, and performs a multi-field application duplicate check |

These handlers have no role check beyond the global session middleware.

### Task endpoints

`POST /api/tasks`

- Requires a decoded session.
- Required body fields: `createdBy`, `subject`, `description`, `reporter`, `assignee`.
- Optional: `className`, `book`, `chapter`, `topic`, `exercise`, `status`, `taskType`, `dueDate`.
- Returns created row with `201`.
- The server trusts client-supplied creator/reporter/assignee values.

`GET /api/tasks`

- Optional filters: `assignee`, `reporter`, `subject`, `status`, `taskType`, `createdBy`, `className`, `dateFilter`, `startDate`, `endDate`.
- Defaults to the last seven days when no date filter is supplied.
- Student sessions add an `OR` restriction for `assignee` or `createdBy` matching their full name; later URL fields are combined with that object.
- Returns `{success,data,analytics:{byStatus,byType,byStudent},meta:{totalRecords}}`.

`PATCH /api/tasks`

- Body: `{id,fieldName,newValue}`.
- Allowed fields: `description`, `status`, `subject`, `book`, `chapter`, `topic`, `exercise`, `taskType`, `dueDate`, `assignee`, `reporter`.
- Student may edit only a task assigned to or created by their full name.

`DELETE /api/tasks?id=<id>`

- Requires session and existing row.
- Student may delete only a task assigned to or created by them.

### Query endpoints

`POST /api/queries`

- Required: `studentName`, `teacherName`, `className`, `subject`, `queryStatement`.
- Optional syllabus fields, status, school, creator, images, and client-supplied `createdAt`.
- Returns created row with `201`.
- No handler-level identity/ownership rule.

`GET /api/queries`

- Optional filters: `studentName`, `teacherName`, `subject`, `status`, `search`, `dateFilter`, `startDate`, `endDate`.
- `search` performs case-insensitive statement containment.
- Defaults to the last seven days without a date filter.
- Returns `{success,data,analytics:{byStatus,bySubject},meta:{totalRecords}}`.

`DELETE /api/queries?id=<id>` deletes an existing row without an ownership check.

`PUT /api/queries/[id]` updates only Subject, Book, Chapter, Topic, Exercise, Page Number, statement, and status. It does not update Student, Teacher, Class, School, creator, or images.

### Bird View and task-user endpoints

| Method/path | Contract |
|---|---|
| `GET /api/bird-view?date=YYYY-MM-DD&view=task|query` | Requires session; returns `{subjects,students,cellData}`. Task rows use due-date day bounds; Query rows use creation-date day bounds. |
| `GET /api/task-users` | Returns `{teachers,students,admins,owners}`. Teachers = Teacher/Coordinator; admins = Owner/Assistant. Student profile class/school is joined by normalized names, including `.`/blank last-name fallback. |

### User and approval endpoints

| Method/path | Current behavior and guard |
|---|---|
| `GET /api/admin/users` | Owner check; returns account identity/role without passwords |
| `PATCH /api/admin/users/[id]` | Owner check; changes role and best-effort migrates profile table; prevents self-demotion |
| `GET /api/admin/pending-users` | No handler owner check; returns full PendingUser rows, including password hashes |
| `POST /api/admin/pending-users/[id]` | No handler owner check; transactionally approves and creates account/profile |
| `PUT /api/admin/pending-users/[id]` | No handler owner check; edits registration/profile input fields |
| `DELETE /api/admin/pending-users/[id]` | No handler owner check; marks `DECLINED`, does not delete |
| `GET /api/users` | No handler owner check; returns all Student/Teacher/Admin profile PII |
| `POST /api/users` | No handler owner check; creates account then profile non-transactionally; Admin -> Coordinator |
| `PUT /api/users` | No handler owner check; updates category profile; Student path uses raw SQL |

### Employees, uploads, and integrations

| Method/path | Contract |
|---|---|
| `GET /api/employees` | Owner/Coordinator; returns all EmployeeRecord rows newest first |
| `POST /api/employees` | Owner/Coordinator; creates employee record |
| `PUT /api/employees` | Owner only; updates supplied fields by ID |
| `POST /api/upload` | Multipart `images` plus school/class/student; returns `201 {urls}` |
| `GET /uploads/[...path]` | Reads local upload; JPEG default plus PNG/WebP/GIF content types; one-year public immutable cache |
| `POST /api/agent/chat` | Owner only; forwards JSON to `AGENT_API_URL`; returns upstream JSON/status |
| `GET /api/test` | **State-changing diagnostic:** inserts a timestamped Subject and exposes stack on failure |

## 10. Database Model and Integrity Rules

The Prisma datasource is PostgreSQL. Every model uses an auto-incrementing integer primary key. Most have `createdAt @default(now())` and `updatedAt @updatedAt`.

| Model | Purpose and important columns | Declared uniqueness/relations |
|---|---|---|
| `DataEntry` | Syllabus row: school, book, subject, class, edition, chapter/name, topic number/name, description, exercise, page, display date/time | PK only |
| `BookEntry` | Book title, comma-capable class string, subject, edition, publisher, school | PK only |
| `SubjectEntry` | Subject name and optional code | PK only |
| `SchoolEntry` | Name, address, branch, city, optional code | PK only |
| `ChapterEntry` | String subject/book, integer chapter number, title, optional page | PK only |
| `TopicEntry` | String subject/book/chapter name, chapter number, formatted topic number, name, optional exercise/page | PK only |
| `QueryEntry` | Student/teacher/class/school strings, syllabus strings, statement, status, creator, `String[] images` | PK only; `questionNumber` exists but APIs do not use it |
| `DataentryUser` | Login identity, bcrypt password, names, Role | Unique username; mapped to table `dataentryUser` |
| `Student` | Optional `userId`, identity/contact/guardian data, class/school, status, `String[] subjects` | `userId` unique but no foreign key |
| `Teacher` | Optional `userId`, identity/contact and optional guardian/other data | `userId` unique but no foreign key |
| `Admin` | Same profile shape as Teacher | `userId` unique but no foreign key |
| `ClassEntry` | Class name | Unique name |
| `TaskEntry` | Creator/class/subject/syllabus strings, description, reporter, assignee, status, type, optional due date | PK only |
| `PendingUser` | Registration identity, hashed password, contact/designation/guardian data, status, resolution time | Unique username; no `updatedAt` |
| `EmployeeRecord` | Personal/contact/education/employment data; several dates stored as strings | PK only |

There are no Prisma `@relation` declarations, foreign keys, explicit secondary indexes, or composite unique constraints. `Student.userId`, `Teacher.userId`, and `Admin.userId` are merely nullable unique integers. Subject/book/chapter/student/task relationships are denormalized text matches.

Application-level duplicate checks are race-prone because most are not backed by database constraints. Status, designation, task type, and many category fields are unrestricted strings rather than enums.

`prisma/dev.db` contains an older SQLite schema for early syllabus tables, but `schema.prisma` is PostgreSQL and never points to that file. Do not use `dev.db` as a current schema or data source.

## 11. Shared Functions and Libraries

| Function/library | Where and why it is used |
|---|---|
| `encrypt`, `decrypt` | `src/lib/auth.ts`; sign/verify one-day HS256 JWTs |
| `setAuthCookie`, `clearAuthCookie`, `getSession` | Server cookie session lifecycle |
| Shared `prisma` | `src/lib/prisma.ts`; database client with query logging |
| `bcryptjs` | Login password compare and registration/direct-user hash with cost 10 |
| `usePersistentForm` | Restores/saves six reference-entry form drafts in `localStorage` |
| `ImageCropper` | Natural-resolution crop via canvas and JPEG blob output |
| `ReactMarkdown` + `remark-gfm` | Owner agent response tables, lists, links, headings, and code blocks |
| `getLocalDateString` | Task/Bird View local `YYYY-MM-DD` formatting without UTC conversion |
| `getVibrantColor` | Deterministic name-based avatars/highlights in several duplicated implementations |
| Bird View helper colors/badges | Reporter, task type, and status visual mapping |
| Native HTML5 DnD | Bird View row/column reorder and task move/clone |
| Browser Clipboard/Canvas | Query image copy, including non-PNG conversion for Safari |

`src/lib/prisma.ts` currently clears the development global before constructing a client and enables `log: ['query']` unconditionally. Bird View and Employee API modules also instantiate separate `PrismaClient` objects; Bird View disconnects its module-level client after each request.

## 12. Styling and UI System

- `src/app/globals.css` defines the full-height shell, 60/250px sidebar offsets, responsive dashboard padding, and reusable legacy panel/form/table classes.
- Tailwind tokens include `primary`, `primaryDark`, status colors, Kanban grays, `customTeal`, `customMustard`, and role colors.
- Bird View intentionally uses inline custom hex colors because of the documented Tailwind dev-cache behavior.
- `src/app/(dashboard)/page.module.css` is leftover starter CSS and is not imported by inspected components.
- Some referenced styling is not defined in the inspected globals/Tailwind config: `animate-slide-up`, `animate-fade-in`, `animate-fadeIn`, `custom-scrollbar`, `modal-overlay`, `modal-content`, `form-input`, `form-select`, `--border-color`, and `--primary-color`.
- TopNav has no explicit title mapping for `/agent` or `/admin/users`, so they show `Dashboard`.

### Build-tool configuration details

- `next.config.ts` sets `output: 'standalone'` and hard-codes development origins for `192.168.100.20` and `www.beaconbridge.com`. `allowedDevOrigins` is development-server configuration, not production CORS policy.
- `tsconfig.json` enables `strict`, `allowJs`, `skipLibCheck`, `noEmit`, bundler module resolution, isolated modules, incremental compilation, and the React JSX transform. It includes `.next` generated types.
- Tailwind scans `src/pages`, `src/components`, and `src/app`; there are no Tailwind plugins.
- ESLint uses the Next core-web-vitals and TypeScript configurations with no project-specific rules. It ignores `.next`, `out`, `build`, and `next-env.d.ts`.
- `package-lock.json` is the only package-manager lockfile; documented Yarn/pnpm/Bun alternatives in README are not the repository's locked workflow.
- `.gitignore` excludes environment files, build output, coverage, TypeScript build info, and generated Prisma output, but does not exclude `public/uploads`.
- `.dockerignore` excludes `.env`, `node_modules`, `.next`, the tracked SQLite file, TypeScript build info, Git metadata, and development documentation from the Docker build context.

## 13. Environment Variables and Required Services

| Variable | Required | Current behavior |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL Prisma connection; the only key present in local `.env` |
| `JWT_SECRET` | Production: yes | Falls back to an unsafe source-code value if absent |
| `AGENT_API_URL` | Only for Agent feature | Defaults to `http://host.docker.internal:8000/api/agent/chat` |
| `NODE_ENV` | Runtime managed | Docker sets `production` |
| `PORT` | Optional | Docker sets `3005` |
| `HOSTNAME` | Optional | Docker sets `0.0.0.0` |
| `NEXT_TELEMETRY_DISABLED` | Optional | Docker build/runtime set `1` |

Required infrastructure:

- External PostgreSQL reachable by `DATABASE_URL`.
- Writable local filesystem if query uploads are enabled.
- Optional external Agent HTTP service.
- Internet access at build/runtime where needed for package/font/CDN behavior.

There is no `.env.example`, startup environment validation, secret manager, PostgreSQL service in Compose, upload volume, object storage, cache, queue, health check, or backup configuration.

Never copy actual credentials from `.env` or Compose into documentation, logs, tests, or responses.

## 14. Local Development and Production Startup

### Commands

```bash
npm ci
npx prisma generate
npm run dev       # 0.0.0.0:3005
npm run lint
npm run build
npm run start     # port 3005
```

There is no `npm test`, dedicated typecheck script, seed script, migration script, or CI command.

For local schema synchronization, the repository currently relies on `prisma db push`; there is no `prisma/migrations` history. Do not run schema push against an unknown/shared database without explicit scope and a backup plan.

### Docker startup

1. Multi-stage Docker build runs `npm ci`, `prisma generate`, and `next build`.
2. Standalone output, static assets, `public`, and Prisma files are copied to a non-root image.
3. Prisma CLI `5.14.0` is installed globally.
4. `start.sh` attempts `prisma db push --skip-generate` up to five times, waiting three seconds between failed attempts.
5. It then executes `node server.js` on port 3005.

Compose has only the app service and connects to a host PostgreSQL using `host.docker.internal`. It contains an inline database credential, no database service, no persistent upload volume, no health check, and no secret management. Never build Docker images unless the user explicitly requests it, as required above.

The current README is the default Create Next App template. Its port 3000, `app/page.tsx`, and Vercel instructions do not describe this project accurately.

## 15. Upload Storage Behavior

Upload directory format:

```text
public/uploads/queries/{sanitizedSchool}/{sanitizedClass}/{sanitizedStudent}/query_{timestamp}_{random}.jpg
```

Current implementation characteristics:

- Directory labels remove non-alphanumeric/non-space characters but retain identity names in URLs.
- Every input is written with a `.jpg` filename, regardless of actual MIME/content.
- No explicit MIME, magic-byte, size, count, resolution, malware, or quota validation.
- No deletion or orphan cleanup when queries/images change.
- Catch-all serving has no explicit resolved-path containment proof.
- Responses use `public, max-age=31536000, immutable`, even for student query images.
- Local container files disappear on replacement and diverge across replicas without shared storage.
- Two real query JPEGs are currently tracked in Git; new uploads are not ignored by `.gitignore`.

Treat uploaded query images as sensitive student data even though current storage/cache behavior does not provide appropriate privacy controls.

The tracked `public` tree also contains five default Create Next App SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg`) that are not referenced by inspected application source. The two tracked query JPEGs together are roughly 1.27 MB and already demonstrate inconsistent school-directory capitalization/punctuation.

## 16. Testing and Diagnostic Reality

There is no automated test framework, assertion suite, coverage threshold, test database isolation, browser test suite, API contract test, or CI workflow. Files named `test-*` are manual scripts/experiments and may mutate the configured database.

| File | Behavior | Safety |
|---|---|---|
| `check-students.js` | Reads all Students and prints status values | Read-only; exposes data |
| `checkReporters.mjs` | Finds Task reporters containing ` .` | Read-only |
| `delete-test.js` | Deletes a named test Student/account | Destructive |
| `fix-abdul.js` | Changes the first matching Abdul Student to Active | Destructive and ambiguous |
| `fix-orphans.js` | Prints full matching rows and may delete a user named Ummay | Destructive; may expose password hash |
| `fixNames.mjs` | Rewrites four hard-coded short Task assignee names | Destructive; no transaction |
| `updateNames.mjs` | Removes ` .` in Task assignees and Query student names | Destructive; no transaction |
| `test-prisma.js` | Creates a test Student | Destructive |
| `test_prisma.js` | Creates Subject `Maths` | Destructive |
| `test-raw-update.js` | Overwrites subjects for Student ID 8 | Destructive and ID-specific |
| `test-update.js` | Overwrites the first Student with hard-coded profile data | Critically destructive |
| `test-bird-view.js` | Prints active Student data | Read-only; exposes data |
| `test-raw.js` | Prints all active Student names/subjects | Read-only; exposes data |
| `test-users.js` | Name-joins account/student rows and prints them | Read-only; ambiguous join |
| `test_api.js` | Queries tasks due on one hard-coded date | Read-only; timezone-dependent |
| `test_date.js`, `test-colors.js`, `test-width.html` | Local date/color/CSS experiments | Pure local diagnostics |
| `test-api.js` | Empty exploratory `main`, never invoked | No-op |
| `scratch_move.py`, `scratch_move2.py` | Rewrite Bird View using absolute path/fragile line or marker logic | Highly destructive source scripts |
| `test-payload.json`, `test-post.json` | Manual API fixtures with personal-looking data/test password | Static but sensitive-looking fixtures |

Never run a root maintenance/test script merely because its name starts with `test`. Read it first, confirm the target database/environment, and get explicit approval for destructive data changes.

## 17. Known Security, Privacy, and Integrity Gaps

These are current-code observations, not permission to broaden an unrelated task. Document or fix them only within the user's requested scope.

### Critical authorization/session gaps

1. Missing `JWT_SECRET` silently enables a known fallback secret.
2. Session cookie uses `secure=false` even in production.
3. Sessions do not revalidate account existence, status, or role.
4. Pending-user APIs have no owner check and expose complete rows including password hashes.
5. `/api/users` exposes and mutates profile PII without an owner check.
6. `/users` and `/notification` rely on hidden navigation rather than page/handler authorization.
7. No CSRF/origin validation, login throttling, lockout, MFA, revocation list, or security audit log exists.
8. Student Query filtering occurs after the full response reaches the browser.
9. Bird View Student filtering does not restrict returned cell data.
10. Parent has no dedicated task/query row-level restriction.

### Data integrity and behavior gaps

1. User/profile relations lack foreign keys and often rely on names.
2. Direct account/profile creation and role migration are not atomic.
3. Role migration can delete profile data before a replacement succeeds.
4. Most duplicate checks are application-only.
5. Status/category fields are free strings.
6. No list endpoint has pagination or a hard result limit.
7. Employee/syllabus display dates use strings; API day filters depend on server-local time.
8. Query edit requests include images but the handler ignores them.
9. `GET /api/test` mutates data and exposes stack details.
10. `GET /api/bird-view` and `GET /api/employees` create their own Prisma clients; Bird View disconnects after each request.

### Operational gaps

1. Container startup uses `prisma db push`, not versioned migrations.
2. Compose embeds a database administrator credential.
3. Uploads are non-durable and non-shared.
4. Agent proxy has no explicit timeout or cancellation policy.
5. Prisma query logging is unconditional.
6. No health checks, metrics, tracing, backup/restore runbook, CI/CD pipeline, or rollback procedure exists.
7. README and actual runtime configuration disagree.

## 18. Change-Safety Checklist for Future Agents

Before changing code:

1. Read root `AGENTS.md`, this entire `.agents/AGENTS.md`, and the relevant local Next.js 16 guide.
2. Inspect `git status` and preserve unrelated user changes.
3. Identify both page/UI visibility and route-handler authorization; never treat Sidebar conditions as security.
4. For schema work, inspect all raw SQL utilities and current string-based joins before changing field/table names.
5. For Bird View, preserve the focused Safari, width, DOM order, focus, Escape, and badge rules exactly.
6. For Task/Query changes, update every consumer: entry form, view table, Bird View, API contract, analytics, and student restrictions.
7. For uploads, consider create, serve, append/remove, cleanup, cache privacy, and container persistence together.
8. Do not run manual database scripts against the configured database without reading them and confirming authorization.

After changing code:

1. Run focused validation with a supported Node version.
2. Confirm API non-2xx paths and optimistic UI rollback behavior, not only success cases.
3. Check Student, Parent, Teacher, Coordinator, Assistant, and Owner behavior where relevant.
4. Re-test Safari table layout/focus behavior for any Bird View change.
5. Update this reference when routes, fields, services, commands, or invariants change.
6. Commit only the completed logical chunk; never push unless explicitly requested.
<!-- END:deep-project-reference -->

<!-- BEGIN:bird-view-operational-reference -->
# Bird View Operational Reference (Primary Workspace)

The project owner identifies Bird View as the application's most important and most frequently used workspace. Treat every change that can alter its data, layout, keyboard behavior, focus, dates, authorization, or mutations as high risk. This section supplements the critical rules at the top of this file; it does not replace them.

This is a description of the implementation audited on 2026-07-15. Statements under **current limitation** describe the code as it exists; they are not instructions to preserve a defect and are not authorization to fix it during an unrelated task.

## 19. Bird View Ownership and Change Boundary

The primary route is `/bird-view`, implemented by the 2,610-line Client Component at `src/app/(dashboard)/bird-view/page.tsx`. It is a matrix workspace whose rows and columns provide the main operational view of Tasks and Queries.

Any of the following is a Bird View change, even when the page itself is not edited:

- Changing Task or Query request/response fields, status strings, date handling, or authorization.
- Changing Student full-name construction, Student status, Subjects, class names, or assigned Subject arrays.
- Changing `/api/bird-view`, `/api/task-users`, `/api/auth/me`, `/api/tasks`, `/api/queries`, `/api/chapters`, or `/api/topics`.
- Changing `TaskEntryClient`, `QueryEntryClient`, upload behavior, dashboard overflow, global table styles, Tailwind configuration, or shared keyboard handlers.
- Changing Prisma fields used by Task, Query, Student, Subject, account, Chapter, or Topic records.

The directly coupled files are:

| File | Bird View responsibility |
|---|---|
| `src/app/(dashboard)/bird-view/page.tsx` | Board state, toolbar, filtering, grid/stacked rendering, tickets, keyboard behavior, drag/drop, optimistic mutations, modals, delete/undo |
| `src/app/api/bird-view/route.ts` | Authenticated read model for Subjects, active Students, and date-specific Task/Query cells |
| `src/app/api/tasks/route.ts` | Task create, list, inline update, move, batch update, and delete contract |
| `src/app/api/queries/route.ts` | Query create/list/delete contract used by the board and Query form |
| `src/app/api/queries/[id]/route.ts` | Query update contract; uses `PUT`, not the board's shared `PATCH` shape |
| `src/app/api/task-users/route.ts` | Reporter, teacher, owner, assistant, and Student choices; profile enrichment is name-based |
| `src/app/(dashboard)/task/TaskEntryClient.tsx` | Full Task form opened from an empty grid cell or global shortcut |
| `src/app/(dashboard)/query/QueryEntryClient.tsx` | Full Query form and optional image upload flow |
| `src/app/globals.css` | Dashboard sizing, shared form styling, animation/style availability |
| `prisma/schema.prisma` | Persisted Task, Query, Student, Subject, user, Chapter, and Topic fields |

Do not split, rewrite, virtualize, or replace the board merely because the page is large. First establish behavioral parity for Safari geometry, mouse use, keyboard use, focus, all roles, both modes, both layouts, optimistic failure, and date boundaries.

## 20. End-to-End Read Flow

Bird View is a Client Component. On mount it performs two independent startup flows:

1. `GET /api/auth/me` populates `currentUser` for creator/reporter defaults and the embedded entry forms.
2. The main initialization sets today as `selectedDate`, then requests `/api/bird-view?date=<local YYYY-MM-DD>&view=task`, `/api/chapters`, `/api/topics`, and `/api/task-users` in parallel.

When the initial Bird response succeeds, the page:

1. Reads `subjects`, `students`, and `cellData`.
2. Applies the browser's saved `localStorage.birdViewOrder` to Subjects and Students.
3. Selects every fetched Student ID.
4. Stores the initial Task cells.
5. Ends the full-page loading state even if some requests failed.

A second effect watches `selectedDate`, `activeView`, and `refreshTrigger`. It requests `/api/bird-view` again and replaces only `cellData`. It does not refresh Subjects, Students, their assignments, saved selection, Chapters, Topics, or reporter choices.

### Current request-lifecycle limitations

- Setting the initial date activates the second effect, so the page commonly sends two overlapping requests for today's Tasks. The apparent “skip initial fetch” block does not return.
- Date/view requests have no `AbortController`, request ID, or latest-response guard. An older request can resolve last and overwrite a newer date or mode.
- A later non-2xx response leaves the previous `cellData` in place. The displayed date/mode can therefore disagree with the visible records.
- There is no board-level error, empty-error distinction, retry control, stale-data label, or partial-load message; errors are logged only.
- `/api/bird-view` returns Subjects and Students on every date/mode refresh even though the refresh effect ignores them.
- Opening an entry modal before `/api/auth/me` resolves can initialize the child form with `user = null`. The child copies the prop into state only on first render, so it can remain on “Please log in.” Quick actions in the same race use `System` as creator/reporter.
- A successful full-form submission increments `refreshTrigger`. Clone and quick-add instead reconcile their temporary row directly and do not trigger a canonical board refresh.

## 21. Exact `/api/bird-view` Read Contract

Request:

```text
GET /api/bird-view?date=YYYY-MM-DD&view=task|query
Cookie: session=<JWT>
```

Successful response:

```text
{
  subjects: SubjectCell[],
  students: StudentColumn[],
  cellData: TaskCell[] | QueryCell[]
}
```

Selected fields are deliberately narrower than the underlying tables:

| Shape | Returned fields |
|---|---|
| Subject | `id`, `name`, `code` |
| Student | `id`, `firstName`, `secondName`, `subjects`, `className` |
| Task cell | `id`, `assignee`, `subject`, `status`, `taskType`, `book`, `chapter`, `topic`, `exercise`, `description`, `reporter`, `createdBy`, `className`, `dueDate` |
| Query cell | `id`, `studentName`, `subject`, `status` only |

The endpoint always loads Subjects first, active Students second, and cell data third. It creates a module-level `PrismaClient` but disconnects it in every request's `finally`, causing connection churn and possible interference between concurrent requests.

### Date meaning

| Board mode | Database field | Inclusion rule |
|---|---|---|
| Task | `TaskEntry.dueDate` | Between server-local start and end of the requested day |
| Query | `QueryEntry.createdAt` | Between server-local start and end of the requested day |

The browser creates a local `YYYY-MM-DD`, while the server parses the date-only value and applies its own local hours. Browser, Node process, container, and database timezone differences can move records around midnight. The normal Task list filters Tasks by `createdAt`, while Bird View groups them by `dueDate`; those screens intentionally have different current meanings.

Unknown `view` values return Subjects and Students with empty `cellData` and status 200. Invalid dates can reach the database as invalid bounds and produce status 500.

### Current role behavior

| Session | Student columns | Cell payload | Board controls |
|---|---|---|---|
| Student | Exact active Student whose first and second names equal session names | Currently all matching-date Tasks/Queries, not only that Student | Full edit/drag/batch/delete/create UI is rendered |
| Parent | All active Students | All matching-date Tasks/Queries | Full controls are rendered; no Parent-specific row restriction |
| Teacher/Coordinator/Assistant/Owner | All active Students | All matching-date Tasks/Queries | Full controls are rendered |

This is a critical privacy fact: hiding other Student columns does not remove their rows from the Student session's network response or React state. `/api/bird-view` must enforce row-level visibility before data leaves the server.

Task mutations call `getSession`; Students may modify/delete a Task assigned to or created by their exact full name. Other authenticated roles are not further restricted there. Query POST/GET/DELETE and Query `PUT /api/queries/[id]` have no handler-level identity or ownership checks and depend only on global routing/middleware. There is no school/tenant boundary.

## 22. Placement, Identity, and Assignment Rules

Bird View currently uses display strings as relationships:

- Task-to-Student: `task.assignee === "<firstName> <secondName>".trim()`.
- Query-to-Student: `query.studentName === "<firstName> <secondName>".trim()`.
- Record-to-row: `record.subject === subject.name` with exact case and whitespace.
- Student-to-Subject assignment: a trimmed, case-insensitive comparison between `student.subjects[]` and `subject.name` in the main grid.

Consequences that every change must account for:

- Renaming a Student does not migrate existing Task assignees or Query student names.
- Duplicate full names can cause one record to appear under multiple Student columns.
- Case, punctuation, blank surnames, `.` surnames, or repeated spaces can orphan a record from the grid.
- `/api/task-users` enriches accounts from Student profiles through normalized name matching; ambiguous first-name fallbacks can attach the wrong class/school.
- Assignment may recognize a cell as valid while exact record placement fails because Subject comparison is stricter.
- Task drag-to-Student updates only `assignee`; it does not update `className`.
- No Task or Query foreign key points to Student or Subject. Stable identity cannot be inferred from the current response.

Until a deliberate migration introduces `studentId`/`subjectId`, preserve exact string construction consistently and test rename/duplicate-name cases. A future ID migration must include schema migration, backfill, ambiguous-row reporting, dual-read/dual-write transition if required, API DTOs, forms, lists, Bird View, analytics, and rollback.

## 23. Board State Model

The monolithic page holds several independent state systems. Understand which system a change touches before editing it.

| State group | Important state/refs | Responsibility |
|---|---|---|
| Directory | `subjects`, `students`, `selectedStudentIds`, `studentCategoryFilter` | Rows, columns, assignment, visibility |
| Read data | `cellData`, `loading`, `refreshTrigger`, `selectedDate`, `activeView` | Selected-day Task/Query dataset |
| Presentation | `viewMode`, `clickedCellId`, `mousePos` | Grid/stacked shape, ticket expansion, drag previews |
| Crosshair | `activeSubjectIdRef`, `activeStudentIdRef`, `gridContainerRef` | Imperative row/column highlight without normal React state |
| Edit cursor | `isEditMode`, `currentRow`, `currentCol`, `copiedTaskRef` | Spreadsheet-like keyboard operations |
| Toolbar | filter dropdown booleans, `studentSearchQuery`, `calendarMonth`, `boardFilters` | Menus, filtering, search, date selection |
| Reorder | dragged/hovered Student and Subject indexes | Local row/column ordering |
| Task drag | `draggedTaskId`, `draggedTaskSource`, `clonedCells` | Task move and modifier-clone gesture |
| Batch | `isBatchMode`, `selectedTaskIds` | Multi-Task status update |
| Delete | `taskToDelete`, `pendingDeletions`, `toastConfig`, `deleteTimeoutsRef` | Confirmation, seven-second delay, undo |
| Ticket/form | `activeDropdown`, `newEntryModal`, Chapters, Topics, reporters, `currentUser` | Inline editor and full entry modal |

These state systems are not automatically reset when the date, Task/Query mode, Grid/Stacked layout, filter, or Student selection changes. Before adding a reset, specify whether state should persist or be scoped. Silent persistence currently creates several cross-mode ID and stale-index hazards described below.

## 24. Filtering, Search, Selection, and Ordering

The derived `filteredCellData` first removes pending-deletion IDs and then applies four client-side filters:

- `status`: case-normalized, with `IN_PROGRESS` recognized by substring `PROGRESS`.
- `taskType`: exact string equality.
- `assignee`: exact string equality; state exists but there is no toolbar control.
- `reporter`: exact string equality; state exists but there is no toolbar control.

Status and Task Type are the only visible board filters. Filters persist when Task/Query mode changes. Because Query cells do not contain `taskType`, any active Task Type filter removes every Query.

Filtering is applied before the board determines whether a cell is occupied. A cell containing records hidden by a filter behaves like an empty cell and can open a create form, allowing accidental duplicates. Header counts, stacked ordering, keyboard copy, keyboard delete, and the visible first ticket also operate on filtered data rather than the full day dataset.

Student visibility is the intersection of:

1. IDs in `selectedStudentIds`.
2. Students still present in the loaded directory.
3. Case-insensitive full-name containment for `studentSearchQuery`.

Search cannot rediscover a Student who was deselected in the picker. A category tab does more than filter the picker: it replaces `selectedStudentIds` with every Student in that category.

Category classification is heuristic:

- `O1`, `O2`, `O3`, `O LEVEL`, or `OLEVEL` -> Olevels.
- `F.S.C`, `FSC`, `MATRIC`, or any occurrence of `9` or `10` -> Matric.
- Missing/unmatched class -> Junior.

Substring `9`/`10` checks can misclassify unrelated labels. An empty category can show “Deselect All” because JavaScript `.every()` is true for an empty list.

### Local order

Subject and Student drag reorder persists this shape in `localStorage.birdViewOrder`:

```text
{
  subjectIds: number[],
  studentIds: number[]
}
```

It is per browser profile, not per user, school, device, or server account. New IDs absent from saved order are appended. Corrupt JSON is logged and ignored. `localStorage.setItem` errors are not handled.

Rendered columns follow the reordered `students` array, but keyboard order follows `visibleStudentIds`, whose base order comes from `selectedStudentIds`. Reordering a Student, or deselecting then reselecting one, does not align those arrays. Digit shortcuts, Left/Right navigation, and edit-mode column movement can therefore disagree with the visual column order.

## 25. Render Tree, Geometry, and Layering

The component renders in this order:

1. Dynamic global crosshair and Bird View CSS.
2. Fixed click-away overlay for an expanded ticket.
3. Floating Student and Subject drag previews.
4. The 35px toolbar.
5. The scrollable board and table.
6. Batch action bar.
7. Full Task/Query entry modal.
8. Undo toast.
9. Delete confirmation modal.

The main grid geometry is intentionally explicit:

| Dimension | Small screens | `md` and wider |
|---|---:|---:|
| Subject column | 64px | 80px |
| Student column | 96px | 120px |
| Board row | 96px | 120px |
| Table width | `64 + visibleStudents * 96` | `80 + visibleStudents * 120` |
| Expanded ticket shell | 280×210px | 340×220px |
| Expanded ticket content | Up to 60vh | Up to 60vh |

The table uses `table-fixed`, `border-separate`, an explicit `colgroup`, an explicit pixel width, and `mx-0 mr-auto`. Do not replace this with flexible width utilities. Continue to obey the Safari inner-`div` interaction rules at the top of this file.

Current stacking order is approximately:

| Layer | z-index |
|---|---:|
| Crosshair pseudo-elements | 5 / 6 |
| Sticky Subject column | 10 |
| Sticky Student header | 20 |
| Sticky corner | 30 |
| Ticket click-away overlay / edit ring | 50 |
| Expanded ticket shell | 60 |
| Ticket badges/footer | 70 |
| Badge option stacks | 80 |
| Expanded content, toolbar menus, entry modal | 100 |
| Batch action bar | 200 |
| Undo toast | 300 |
| Delete confirmation | 400 |
| Drag previews | 9999 |

The board's scroll/overflow ancestors can still clip expanded tickets vertically. Horizontal edge anchoring compares the Student's index in the full array with boundaries from the visible array; when Students are hidden, the first/last visible ticket can use the wrong left/right anchor and clip.

The page globally changes `.dashboard-content` padding to 4px while mounted. Long Subject names/codes are not truncated inside the narrow sticky column. The 35px toolbar contains several fixed-width controls and has no toolbar-level horizontal scrolling or compact mobile layout; only one inner group wraps.

The dynamic crosshair CSS emits one selector per Subject and Student. `updateHighlight` mutates `data-active-subject` and `data-active-student` on the grid DOM node through refs. Header background classes also read those refs, but ref mutation does not cause a React render; pseudo-element highlights update immediately while header classes can wait for an unrelated render.

## 26. Grid and Stacked Layout Semantics

### Grid

- One row per Subject and one column per visible Student.
- A cell is assigned when the Student's Subject list contains the row Subject after trim/case normalization.
- An assigned empty cell opens the full entry form when clicked.
- An occupied cell expands into its ticket popup.
- An unassigned cell uses the striped background and ignores the create/open portion of the click, although its wrapper still looks clickable.
- Row/column headers toggle crosshair highlighting and are also native drag handles.

### Stacked

- Records are grouped per Student without Subject rows.
- Row count is `max(filtered records for any Student) + 1`, with at least one row.
- Each Student receives one explicit dashed plus cell immediately after their final visible record.
- Tasks sort by `IN_PROGRESS`, `OPEN`, `PENDING`, `DONE`; unknown/lowercase statuses have index `-1` and sort before recognized statuses.
- A Subject badge on each Task identifies its original Subject.
- `handleStackedDrop` exists but is not wired to JSX.

Edit mode can still be toggled while Stacked is visible, but its commands continue indexing `subjects[currentRow]` and `visibleStudentIds[currentCol]`; the visual edit ring is Grid-only. This can mutate a hidden logical Grid cell. Switching layout, changing Student visibility, or reordering does not clamp/reset edit indexes; empty arrays can produce `-1` indexes.

Task drop in either visual layout changes only the assignee. A drop over another Subject row does not change Subject, so the card returns to its original row under the new Student. Modifier clone also retains the original Subject while marking the visually entered target cell as cloned.

## 27. Cell and Ticket Rendering

Task/Query placement is recalculated from names and Subject strings. In compact mode, only the first filtered record in a cell renders, with no `+N` indicator. Expansion renders every filtered record in that cell.

The API supplies no `orderBy` for Bird cell records. Therefore “first record” is not a stable business rule across reloads. It controls:

- Compact preview.
- Edit-mode copy.
- Edit-mode Delete/Backspace.
- Which item a user may assume is primary.

Task tickets provide inline controls for Chapter, Topic, Exercise, Description, Reporter, Task Type, and status. The compact card shows Chapter, Topic, optional Exercise/Description, reporter avatar, type badge, and status badge.

Chapter selection sends three separate optimistic PATCH calls: Chapter value, blank Topic, and blank Exercise. Topic sends two: Topic and blank Exercise. The inline Topic list matches `TopicEntry.chapterName` exactly, while the full Task form accepts chapter title or name; title-backed Tasks can have no inline Topic options.

Reporter choices merge `/api/task-users` teachers/admins/owners with reporter strings already present in current `cellData`. The three hard-coded reporter-name color overrides are Rafay, Tayyaba, and Rabia; all other colors are deterministic hashes.

Task item React keys use the array index, while Description is an uncontrolled textarea using `defaultValue`. After deletion, filtering, reordering, or a server refresh, React can reuse a textarea DOM node for another record and preserve the wrong displayed value/focus.

### Query rendering is intentionally much narrower in current code

The Query branch returns a minimal card with only the word `Query` and its status. It does not render query statement, Student/teacher details, images, inline fields, delete button, task/status badges, drag source, or batch click handler. Expanded Query cells still show the generic trailing plus button.

Task/Query switching does not reset filters, ticket ID, edit mode, copied record, selected batch IDs, pending deletions, or badge state. Task and Query tables use independent integer ID sequences, so an ID from one mode can accidentally match an ID in the other mode's client state.

## 28. Mutation and Failure Matrix

| Operation | Browser behavior | HTTP contract | Current failure behavior |
|---|---|---|---|
| Inline Task field | Immediately replaces field in `cellData` | `PATCH /api/tasks {id,fieldName,newValue}` | Logs non-2xx/network error; does not restore old value |
| Task drag move | Optimistically changes `assignee` | Same Task PATCH | No rollback; class and Subject are not updated |
| Task clone/copy | Appends temporary record | `POST /api/tasks` | Replaces temp on 2xx; removes it on non-2xx/network error |
| Chapter/topic cascade | Sends multiple optimistic requests | Several independent Task PATCH calls | Partial success can leave dependent fields inconsistent |
| Batch Task status | Optimistically changes all selected IDs | One Task PATCH per ID | `Promise.all` treats HTTP errors as success; selection clears and batch exits |
| Full Task form | Waits for POST, then refreshes board | `POST /api/tasks` | Shows form error and retains form |
| Full Query form | Uploads images, POSTs Query, then refreshes | `POST /api/upload`, then `POST /api/queries` | Upload/query errors remain in form |
| Ticket quick plus | Appends temp Task-shaped object | Task or Query POST based on mode | Removes temp and alerts on non-2xx/network error |
| Delayed delete | Hides ID, waits seven seconds | Task or Query DELETE based on mode at confirmation | Does not inspect response status; non-2xx is treated as deletion success |
| Undo | Clears pending timeout and unhides ID | No request if used before timeout | Only currently visible toast ID can be undone |

### Verified quick-plus contract failures

- Task quick plus sends `description: ''`, but Task POST requires a truthy description. It is expected to return 400.
- It sets `className` to `subject.name`, not the target Student's class.
- Query quick plus sends a Task-shaped body without required `teacherName`, `className`, or `queryStatement`. It is expected to return 400 and displays “Failed to create task.”
- Query cloning cannot succeed from the four-field Bird Query DTO because required Query creation fields were never loaded.

### Full-modal date behavior

- Task modal receives the board's selected date as `dueDate` and submits it as an ISO timestamp.
- Query modal receives Subject and Student but does not receive/use the stored board date. A Query created while viewing a historical/future date is created at the current server time, then disappears when the selected date refreshes.

### Delete/undo details

- Confirmation adds the numeric ID to `pendingDeletions`, which hides it from filtered data immediately.
- One timeout per ID can exist, but `toastConfig` represents only the newest deletion. Earlier pending deletions lose their visible Undo action.
- Cmd/Ctrl+Z undoes only the currently visible toast ID and can intercept normal text undo while the toast exists.
- A thrown network error unhides the row but can leave the success toast visible.
- Outstanding timers are not cleared on component unmount; leaving the page does not cancel the eventual DELETE.
- Confirmation, toast, and alerts always use Task wording, including Query mode.
- Pending IDs persist across mode/date changes. Because Task and Query IDs can overlap, a pending Task deletion can hide a same-numbered Query.
- A delayed delete has no record version check; another user's intervening edit does not prevent deletion.

### Concurrency details

- Inline PATCH is last-response-wins at the database, which may not be the last user action.
- There is no optimistic version, ETag, `updatedAt` precondition, idempotency key, or duplicate-clone constraint.
- Temporary IDs are `Date.now() + random(0..999)` and can collide during rapid operations.
- Clone/add responses can arrive after date/mode changes and append or reconcile an old-mode record into the currently displayed `cellData`.
- `copiedTaskRef` persists across dates, modes, filters, and deletion.
- Batch selected IDs persist across filters, dates, layout, and Task/Query mode. Hidden records remain counted and submitted.

## 29. Drag, Drop, Copy, and Reorder Contracts

Student/Subject reorder uses native HTML5 drag, a transparent native drag image, and a custom fixed preview. It has no keyboard or touch equivalent. Subject preview includes hidden Students and uses exact Subject assignment matching, unlike the normalized main grid.

Task cards are drag sources only in the Task branch and outside Batch mode.

- Plain drop: update assignee.
- Shift, Alt, or Meta: clone for the target Student.
- Cmd/Ctrl+C in edit mode: copy the first filtered Task into an in-memory ref.
- `+` in edit mode: same copy behavior.
- Cmd/Ctrl+V: clone only when current row Subject equals copied Task Subject; otherwise alert.

Modifier cloning currently begins on `dragenter`, before a drop. Crossing multiple cells can issue multiple POST requests without dropping. Rapid repeated drag-enter events can race the React `Set` update. Releasing the modifier after entering can leave the clone already submitted and then move the original on drop.

For a future correction, define one explicit semantic contract before editing: either a drop targets only a Student, or it targets Student+Subject and updates both fields. Never allow the visual target and persisted target to disagree silently.

## 30. Keyboard, Escape, and Focus Model

Bird View installs multiple native listeners:

1. Document handler for search, date shortcuts, and layered Escape.
2. Document handler for Cmd/Ctrl+Shift+M.
3. Document handler for edit mode, numbers, arrows, copy/paste, Delete, Enter, and another Escape implementation.
4. Window handler for Cmd/Ctrl+Z.
5. While delete confirmation is open, a window capture handler that stops every key before the others.

Current shortcuts are:

| Input | Behavior |
|---|---|
| Cmd/Ctrl+Shift+F | Focus Student Search; if already focused, blur, clear it, and clear Student highlight |
| Cmd/Ctrl+Left / Right | Previous/next selected date outside input, textarea, or select |
| Cmd/Ctrl+B | Today outside input, textarea, or select |
| Cmd/Ctrl+Shift+M | Open Task/Query form, optionally with highlighted Student; no input/modal context guard |
| `E` | Close toolbar menus, blur active element, toggle edit mode, initialize indexes to zero |
| Digits | One-based Student highlight using a 200ms multi-digit buffer |
| Shift+Digits | One-based Subject highlight in Grid mode |
| Normal arrows | Move Subject/Student crosshair and scroll headers into view |
| Edit arrows | Change index-based active cell |
| Edit Enter | Expand occupied cell or open entry form for assigned empty cell |
| Edit Backspace/Delete | Confirm deletion of the first filtered record |
| Edit Cmd/Ctrl+C or `+` | Copy first filtered Task |
| Edit Cmd/Ctrl+V | Horizontal same-Subject clone |
| Cmd/Ctrl+Z | Undo the newest visible pending deletion |
| Escape | Several overlapping close/clear behaviors described below |

### Input guard limitation

Global grid handlers exclude `INPUT`, `TEXTAREA`, and `SELECT`, but not normal buttons, focusable labels, interactive divs, or contenteditable elements. Arrow, digit, `E`, Enter, Delete, and copy/paste behavior can act on the grid while a toolbar button or other non-form control has focus unless a local handler stops propagation.

Cmd/Ctrl+Shift+M has no context guard and can open/reinitialize a form while typing, while another modal/ticket is open, or while a menu is open. Cmd/Ctrl+Z can override native text undo whenever the Bird delete toast is visible.

### Escape precedence limitation

The first Escape handler intends to clear Search, otherwise close open UI, otherwise return focus to a grid cell, otherwise clear crosshair highlight. The later document handler also processes the same Escape and closes Batch mode, toolbar menus, the ticket, and the entry modal. One Escape can therefore affect more than one layer.

The first handler reads Search and filter state that is absent from its effect dependency array, so its closure can be stale. Its focus-return query expects `td[data-subject-id][data-student-id]`, but rendered cells have neither attribute nor `tabIndex`; that branch cannot currently focus a cell.

### Ticket focus contract

The required ticket order is currently preserved:

```text
Chapter -> Topic -> Exercise -> Description -> Reporter
-> Delete -> Task Type badge -> Status badge
-> next Task's controls, if present -> Plus
```

Tab and Shift+Tab are trapped and wrapped within the expanded ticket. Badge option buttons remain `tabIndex={-1}` and are reached only by Arrow keys. Badge triggers are focusable interactive `div`s, open their menu on focus, and lack native button/menu ARIA semantics.

Three autofocus paths can compete when a ticket opens: the `clickedCellId` effect, the expanded wrapper ref, and the last Description textarea's resize ref. Two use 50ms timers; the textarea uses 10ms. Focus outcome depends on timer ordering, and some timers are not cancelled if the ticket closes quickly. Focusing a Description also moves the caret to the end after a timer, overriding a mouse-selected caret position.

Backdrop/cell close does not explicitly clear `activeDropdown`, restore focus to the originating cell, or cancel all focus timers. The required Escape behavior remains: Escape inside a ticket must close the entire ticket and all badge menus, not only one menu.

### Delete-dialog focus limitation

The capture handler calls `preventDefault`, `stopPropagation`, and `stopImmediatePropagation` for every key. It handles Enter as confirm and Escape as cancel. As a result, Tab/Shift+Tab cannot reach Cancel/Delete, Space cannot activate a focused button, focus is not placed or trapped in the dialog, and Enter confirms regardless of intended focus. The dialog also lacks explicit dialog semantics and focus restoration.

## 31. Toolbar and Picker Behavior

- Task/Query and Grid/Stacked toggles are ordinary buttons and do not reset incompatible state.
- Status and Task Type triggers open on click, or on keyboard-visible focus. ArrowDown moves to the first option after a 50ms timer.
- Status/Type option buttons are outside ordinary Tab order. Selecting an option does not explicitly close its menu.
- Opening one toolbar menu does not explicitly close the others.
- Outside mousedown and wrapper blur close menus.
- Calendar and Student picker controls are programmatically Arrow-focused and mostly `tabIndex={-1}`.
- Calendar Right/Down moves one focusable item forward; Left/Up moves one backward. It is linear, not day/week calendar navigation.
- Selecting a day changes `selectedDate` but does not close the calendar.
- Date keyboard shortcuts do not synchronize `calendarMonth`, so crossing a month can leave the open picker showing a different month.
- Batch Select has a focusable label and a default-focusable nested checkbox, creating two Tab stops.
- Student checkboxes are labelled but deliberately removed from ordinary Tab traversal.
- Custom dropdowns, calendar, badge menus, entry overlay, and delete overlay do not expose a complete dialog/menu/listbox/calendar ARIA model.

## 32. Task and Query Capability Matrix

| Capability | Task | Query |
|---|---|---|
| Read by selected date | Yes, by due date | Yes, by created date |
| Grid and stacked display | Yes | Yes, minimal cards |
| Empty-cell full form | Yes | Yes |
| Selected date honored by full form | Yes | No |
| Compact business detail | Chapter/topic/description/badges | Status only |
| Expanded inline editor | Yes | No |
| Ticket mouse delete | Yes | No |
| Edit-mode first-record delete | Yes | Can reach generic delete flow |
| Drag source/move | Yes | No |
| Modifier clone | Yes | No usable Query source/DTO |
| Batch pointer selection | Yes | No |
| Shared PATCH endpoint | Supported | Not supported; actual update is `PUT /api/queries/[id]` |
| Ticket quick plus | Rendered but currently fails required description | Rendered but currently sends invalid shape |
| Status vocabulary | Usually uppercase | Form normally creates lowercase |

Do not advertise or expose a Query action unless its API contract, authorization, DTO, rollback, wording, and tests actually exist.

## 33. Performance Profile

The board is an unvirtualized `Subjects × visible Students` table. Current hot paths include:

- `filteredCellData` recreates a new array on every render.
- `tasksPerStudent` scans all filtered records once per Student and sorts each group.
- Every Student header scans all filtered records again for its active count.
- Every rendered cell scans filtered records to find its items, and some click/render paths repeat the scan.
- The Grid worst case approaches `Subjects × Students × records` string comparisons per render.
- Dynamic CSS generates one Subject selector and one Student selector.
- Every toggle, menu, drag position, optimistic write, and focus-related state update can rerender the monolith.
- The API has no pagination/hard limit and the schema has no declared indexes for Task due date, Query created date, Student status/name, assignee, Query student name, or Subject placement.
- `/api/task-users` performs nested in-memory normalized-name matching.

Use at least 100 Students, 20 Subjects, and 5,000 selected-day records for a realistic performance regression fixture. Measure request count, server query time/plan, JSON size, first usable render, scroll, menu open, ticket open, filter, date switch, and drag latency.

If optimization is authorized, first introduce a typed indexed read model keyed by stable Student/Subject IDs and memoize derived maps. Request cancellation/sequence protection and database indexes are lower-risk early improvements. Virtualization is high risk because sticky cells, explicit Safari geometry, scroll-to-highlight, ticket overflow, native drag, and keyboard coordinates all depend on real table DOM.

## 34. Known Bird View Limitations by Priority

### Critical: privacy and authorization

1. Student Bird responses include other Students' date-matching cell records.
2. All authenticated roles receive editing controls; visual hiding is not authorization.
3. Query handlers lack handler-level ownership and school isolation.
4. Names act as foreign keys and allow collisions, orphaning, and misattribution.

### High: mutation correctness

1. Query shared PATCH does not exist.
2. Task and Query ticket quick-plus requests fail current validation.
3. Historical/future Query modal creation ignores selected date.
4. Inline/move/batch mutations do not reconcile HTTP failure.
5. Delete treats HTTP failure as success.
6. Old date/view responses can overwrite the latest selection.
7. Modifier drag can clone before an actual drop.
8. Cross-Subject visual drop changes only Student.
9. Cross-mode/date selected and pending numeric IDs can affect unrelated records.
10. No deterministic cell record order defines preview/copy/delete target.

### High: keyboard/focus safety

1. Two Escape implementations respond to the same event.
2. Grid focus restoration targets attributes that are not rendered.
3. Delete confirmation blocks Tab and Space and always maps Enter to deletion.
4. Global shortcuts can operate while ordinary buttons are focused.
5. Edit indexes become stale after layout/filter/order changes.
6. Multiple autofocus timers compete.

### Medium: usability and observability

1. No visible fetch error, retry, stale marker, or partial-load state.
2. Compact cells hide additional record count.
3. Query cards omit the statement and core context.
4. Toolbar can overflow narrow screens.
5. Expanded edge positioning is wrong for some hidden-Student layouts.
6. Filters can make an occupied cell look creatable.
7. Menus lack complete semantics and consistent close/focus restoration.
8. There is no keyboard/touch equivalent for drag operations.

## 35. Mandatory Bird View Regression Checklist

There is currently no automated browser suite. Use a disposable database with synthetic identities; never run root `test-*`, `fix-*`, or scratch rewrite scripts against a real configured database merely because they look relevant.

### Read, role, and privacy

- [ ] Owner, Coordinator, Teacher, Assistant, Parent, and Student can load only their intended Students and cells.
- [ ] Inspect the network response, not only rendered columns, for Student/Parent privacy.
- [ ] Direct Task and Query API calls enforce the same policy as the UI.
- [ ] School/tenant isolation is verified if introduced.
- [ ] Duplicate names, blank/`.` surnames, case/spacing variants, and renamed Students are covered.

### Initial load, dates, and races

- [ ] Exactly one intended initial Bird request occurs.
- [ ] Today, yesterday, tomorrow, leap day, month/year boundary, and daylight/timezone boundary are correct.
- [ ] Task due-date and Query created-date semantics are explicitly asserted.
- [ ] Test with Node in UTC and `Asia/Karachi`, using one declared academy timezone as expected truth.
- [ ] Delay date A response, select B, resolve A last, and verify B remains visible.
- [ ] Repeat the stale-response test for Task -> Query.
- [ ] Non-2xx refresh does not present old data as the new date/mode.
- [ ] Newly changed Subjects/Students/assignments have a defined refresh path.

### Safari and responsive geometry

- [ ] Safari verifies explicit computed table width and stable 64/80px Subject column.
- [ ] Safari verifies stable 96/120px Student columns and 96/120px rows.
- [ ] No transform, transition, scale, or interactive background is applied directly to `td`/`th`.
- [ ] Sticky top row, left column, and corner remain aligned during two-axis scrolling.
- [ ] Zero, one, many, selected, deselected, searched, and reordered Students preserve width.
- [ ] First/middle/last visible tickets expand without clipping, including hidden columns.
- [ ] Long Subject codes/names and narrow/mobile toolbar behavior are tested.

### Filters, selection, and ordering

- [ ] Status/Type filters work for every accepted case/spelling and do not create false empty cells.
- [ ] Task Type state does not unintentionally blank Query mode.
- [ ] Search only/also includes deselected Students according to the specified product rule.
- [ ] Category tabs and Select/Deselect All handle empty categories.
- [ ] Drag Student, then verify digits, Left/Right, edit movement, and visual order agree.
- [ ] Deselect/reselect a Student and repeat keyboard-order tests.
- [ ] Saved local order reloads safely for added/removed IDs and different signed-in users.

### Grid, stacked, and multiple records

- [ ] Assigned/unassigned cells use normalized Subject rules consistently.
- [ ] Empty assigned Grid cells and Stacked plus cells open the correct form.
- [ ] Multiple records have deterministic preview/count/expanded ordering.
- [ ] Copy and Delete target the documented record.
- [ ] Grid -> Stacked with edit mode active cannot mutate a hidden Grid coordinate.
- [ ] Stacked status order covers uppercase, lowercase, completed, and unknown values.
- [ ] Zero Subjects and zero visible Students show an accurate empty state.

### Ticket and keyboard focus

- [ ] Opening a populated cell focuses Description or first valid control exactly once.
- [ ] Mouse caret placement in Description is not moved unexpectedly.
- [ ] Tab order remains Inputs -> Delete -> Type -> Status -> Plus and wraps.
- [ ] Shift+Tab is the exact reverse.
- [ ] Badge options never enter Tab order; Arrow navigation follows visual order.
- [ ] Enter/Space selects a badge option and returns focus to the trigger.
- [ ] Escape closes the entire ticket and every badge dropdown in one defined layer.
- [ ] Backdrop close clears dropdown state and restores focus.
- [ ] Toolbar buttons cannot accidentally activate grid Arrow/E/Delete/digit actions.
- [ ] Multi-digit buffer always clears after 200ms even across rerenders.
- [ ] Cmd/Ctrl+Shift+M is tested from body, input, textarea, menu, ticket, and existing modal.

### Create, inline edit, copy, and drag

- [ ] Full Task creation honors Student, Subject, class, reporter, creator, and selected date.
- [ ] Full Query creation honors Student, teacher, class, school, Subject, attachments, and intended date.
- [ ] Quick plus is hidden or sends a valid mode-specific contract.
- [ ] Inline 400/403/404/500/network failure restores or refetches canonical state.
- [ ] Chapter/topic/exercise cascades cannot partially corrupt dependent values.
- [ ] Copy state is reset or validated across date/mode changes.
- [ ] Plain drop moves exactly once and updates every required field.
- [ ] Modifier drop clones exactly once and only under the specified drop semantic.
- [ ] Crossing a cell without dropping cannot create an unintended record.
- [ ] Same-Student and cross-Subject drops are deterministic.
- [ ] Drag end always clears preview, hover, source, and cloned-cell state.
- [ ] Keyboard/touch alternatives are tested if drag remains core functionality.

### Batch, delete, and undo

- [ ] Selections are scoped/cleared across filter, date, layout, and Task/Query changes.
- [ ] Query cards are selectable only if Query batch is genuinely supported.
- [ ] Batch 400/403/405/500 and partial failure are surfaced and reconciled per record.
- [ ] Repeated action clicks cannot submit duplicate batches.
- [ ] Delete dialog receives focus; Tab, Shift+Tab, Space, Enter, and Escape are safe.
- [ ] A non-2xx DELETE restores the record and shows an error.
- [ ] Network failure restores the record and removes stale success messaging.
- [ ] Undo button and Cmd/Ctrl+Z work within seven seconds.
- [ ] Multiple pending deletions each have deterministic undo behavior.
- [ ] Navigation/unmount behavior for pending timers is explicitly specified.
- [ ] Task and Query wording is correct.

### Accessibility and performance

- [ ] Table has useful interaction instructions/caption where appropriate.
- [ ] Clickable headers/cells and badges have keyboard semantics and accessible names.
- [ ] Menus expose expanded/selected relationships; dialogs expose modal/name relationships.
- [ ] Toast and selection changes are announced through an appropriate live region.
- [ ] Color is not the only status/type indicator and tiny text remains readable.
- [ ] Screen-reader and keyboard-only flows cover every core operation.
- [ ] The 100 Student / 20 Subject / 5,000 record fixture remains usable.
- [ ] Request counts, query plans, payload size, render time, scroll, ticket open, filter, and date switch meet agreed budgets.

## 36. Safe Bird View Modification Workflow

Before implementation:

1. Read the top-level `AGENTS.md`, this complete file, and the relevant Next.js 16 guide in `node_modules/next/dist/docs/` before writing Next.js code.
2. Inspect Git status and preserve all unrelated user work.
3. State the exact current behavior and the intended behavior; do not silently “clean up” a keyboard, date, drag, or layout contract.
4. Identify affected DTO fields, API methods, authorization, Prisma fields/indexes, Task/Query forms, both board modes, both layouts, and failure states.
5. Create a small synthetic regression dataset with multiple records per cell, hidden Students, duplicate-like names, historical/future dates, and at least one unauthorized role.
6. Capture Safari and another browser baseline for geometry/focus when UI layout is involved.

During implementation:

1. Prefer a small, reviewable change over a monolithic Bird View rewrite.
2. Keep server authorization authoritative; never rely on hidden controls.
3. Use stable IDs in new contracts where possible, but do not partially migrate one consumer.
4. Define pending/success/failure reconciliation for every optimistic mutation.
5. Guard async reads against stale responses.
6. Preserve explicit table geometry and apply interactive effects to inner wrappers.
7. Preserve the ticket DOM/Tab order and badge `tabIndex={-1}` rule.
8. Test both Task and Query explicitly; shared-looking UI does not imply a shared API contract.

Before handoff:

1. Run focused static/type/lint checks with a Node version supported by this Next.js version.
2. Run the applicable regression groups above, including deliberate non-2xx and delayed responses.
3. Verify network payload privacy for Student/Parent sessions.
4. Re-test Safari table width, sticky geometry, ticket focus, badge arrows, and Escape.
5. Confirm no root maintenance script or real database was mutated unintentionally.
6. Update this section if a current limitation, contract, shortcut, field, or invariant changed.
7. Commit the logical chunk; do not push unless explicitly requested.
<!-- END:bird-view-operational-reference -->
