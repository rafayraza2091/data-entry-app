<!-- BEGIN:bird-view-rules -->
# Bird View Page (src/app/(dashboard)/bird-view/page.tsx) Guidelines

When modifying the Bird View grid, strictly follow these layout and functionality rules:

1. **Table Cell Safari Bug (CRITICAL)**: 
   - NEVER apply `transition`, `transform`, `scale`, or dynamic interactive background colors directly to `<td>` or `<th>` elements. This fundamentally breaks Safari's table rendering engine.
   - ALWAYS wrap the cell content in an inner `<div>` that has `w-full h-full`. Apply all hover, transition, scaling, and z-index behaviors to this inner `<div>`.

2. **Column Width Consistency**:
   - The left-most column (Subject codes) must be strictly clamped. Both the top-left `<th scope="col">` and the row headers `<th scope="row">` MUST use identical width constraints (e.g., `w-20 min-w-[5rem] max-w-[5rem]`).
   - Student columns are constrained by `min-w-[120px]`. 
   
3. **Layout Alignment**:
   - The `.dashboard-content` has a global padding of `4px`.
   - Elements (like the top navigation buttons div) that need to touch the left sidebar must use negative margins to compensate for the padding: `w-[calc(100%+4px)] ml-[-4px]`.

4. **Custom Colors**:
   - Due to Next.js dev server caching with Tailwind JIT, use inline styles for highly specific custom hex colors (e.g., `style={{ backgroundColor: '#254245' }}`) to prevent them from vanishing during hot-reloads.
   
5. **Drag and Drop**:
   - Do not overlap drag grip icons with text. The subject rows display `subject.code || subject.name` perfectly centered and do NOT have a drag icon, because users can just click and drag the cell itself.
<!-- END:bird-view-rules -->
