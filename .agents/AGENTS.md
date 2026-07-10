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
   - Do not overlap drag grip icons with text. The subject rows AND the student columns display their labels perfectly centered and do NOT have a drag icon floating on top, because users can just click and drag the cell itself. Keep the UI clean.
<!-- END:bird-view-rules -->
