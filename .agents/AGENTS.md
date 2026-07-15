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
