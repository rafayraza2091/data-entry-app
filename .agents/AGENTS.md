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
