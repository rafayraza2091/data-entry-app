# Attachment Preview Review Workspace Guideline

## Purpose

The current attachment preview works mainly as an image lightbox. For teacher review, it should behave like a compact marking workspace where the teacher can see the uploaded student work and the relevant task information together.

The goal is to let a teacher open an attachment and immediately answer:

- Whose work is this?
- Which subject and task is this for?
- What was assigned?
- How many attachments are there?
- What marks are currently entered?
- Does the image need rotation, zooming, or a clearer reupload?
- Can I add marks or a comment without leaving the preview?

## Design Direction

Match the existing MyAcademy visual language:

- Professional, royal, dense, operational interface.
- Deep navy, emerald, charcoal, muted gold, and soft ivory tones.
- Small fonts with strong hierarchy.
- Sharp edges and controlled radius, preferably 4px to 8px.
- Thin borders and dividers.
- No playful oversized cards.
- No decorative gradients or unnecessary illustrations.
- Every control should clearly reflect its purpose.

This screen is not a gallery. It is a teacher review tool.

## Recommended Layout

Use a three-zone modal:

1. Top command bar
2. Main image viewer
3. Right task-review panel
4. Bottom attachment thumbnail strip

Suggested structure:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Haram Nizami • Mathematics • Attachment 1 of 2                               │
│ Rotate Left  Rotate Right  Zoom -  Zoom +  Fit  Actual  Reset  Close         │
├──────────────────────────────────────────────────────┬───────────────────────┤
│                                                      │ Student               │
│                                                      │ Haram Nizami           │
│                                                      │                       │
│                  IMAGE VIEWER                         │ Task                  │
│                                                      │ Exercise 1.2 Q2-Q6     │
│             uploaded handwritten work                 │ Math • Tuition Work   │
│                                                      │                       │
│                                                      │ Marks                 │
│                                                      │ [ 9 ] / 10             │
│                                                      │ [Save Marks]           │
│                                                      │                       │
│                                                      │ Comment               │
│                                                      │ [Add note...]          │
├──────────────────────────────────────────────────────┴───────────────────────┤
│ [thumb 1 active] [thumb 2] [thumb 3]                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Top Command Bar

The top bar should remain visible while reviewing attachments.

Left side:

- Student name
- Subject
- Attachment count, for example `Attachment 1 of 2`

Middle/right controls:

- Previous attachment
- Next attachment
- Rotate left
- Rotate right
- Zoom out
- Zoom in
- Fit to screen
- Actual size
- Reset view
- Download or open original, optional
- Close

Danger action:

- Delete should be present only if the user has permission.
- Do not make Delete visually dominant.
- Place Delete away from primary review controls.
- Use red text/icon only, not a large red button.

## Image Viewer

The image area is the main focus.

Requirements:

- Center the image by default.
- Fit tall student notebook images within available height.
- Allow zooming and panning.
- Keep the background dark charcoal so notebook pages remain visually clear.
- Add previous/next arrows on the left and right side of the image area.
- Keep arrows subtle until hover.
- Support keyboard navigation.

Image states:

- Loading state
- Failed image state
- No attachment state
- Rotated preview state
- Zoomed state

## Rotation UX

Add rotation controls because many student uploads are sideways or poorly oriented.

Minimum controls:

- Rotate left: -90 degrees
- Rotate right: +90 degrees
- Reset rotation

Recommended behavior for first version:

- Rotation should be temporary in preview only.
- Do not alter the actual uploaded file in the first implementation.
- Show a small badge when rotation is active, for example `Rotated 90°`.

Future optional behavior:

- Add `Save rotation` only after the temporary rotation UX works well.
- Saving rotation should require explicit confirmation.
- Saved rotation should update future previews for all users.

## Zoom and Pan UX

Minimum controls:

- Zoom in
- Zoom out
- Fit to screen
- Actual size
- Reset view

Recommended interactions:

- Mouse wheel or trackpad pinch zooms the image.
- Drag pans the image when zoomed.
- Double click toggles between fit and 100%.
- Zoom percentage appears subtly, for example `90%`.

## Right Review Panel

The right panel should contain all relevant context from the task card.

Use compact sections:

### Student

- Student name
- Class
- Attendance state if available

### Assignment

- Subject
- Chapter
- Topic
- Exercise
- Description
- Task type
- Due date
- Reporter/teacher
- Status

### Grading

- Current marks input
- Total marks
- Status badge
- Save marks button
- Optional quick actions:
  - Mark checked
  - Needs reupload
  - Wrong attachment
  - Ask for correction

### Comments

- Comment input
- Add comment button
- Recent comments, if available

Do not make the panel too wide. Suggested width: 340px to 420px on desktop.

## Bottom Thumbnail Strip

Use thumbnails for all attachments connected to the task.

Behavior:

- Active thumbnail should have a muted gold border.
- Show attachment index, for example `1`, `2`, `3`.
- Show small status if useful:
  - checked
  - rotated
  - needs reupload
- Clicking a thumbnail switches the main image.

## Visual Tokens

Suggested colors:

- Modal overlay: `rgba(5, 8, 12, 0.82)`
- Viewer background: `#080B10`
- Panel background: `#F8F6F0` or `#FFFFFF`
- Primary text: `#172238`
- Muted text: `#687386`
- Border: `#D8DEE8`
- Gold accent: `#B48632`
- Emerald status: `#1F8A5B`
- Danger: `#D92D20`
- Toolbar dark: `#111827`

Suggested typography:

- Header: 14px to 16px, 700 weight
- Labels: 10px to 11px, uppercase, 700 weight
- Body text: 12px to 13px
- Inputs: 13px to 14px
- Buttons: 12px to 13px, 700 weight

Suggested spacing:

- Top bar height: 48px to 56px
- Panel padding: 16px
- Section gap: 14px
- Field gap: 8px
- Thumbnail size: 56px to 72px
- Border radius: 6px

## Keyboard Shortcuts

Recommended shortcuts:

- `Esc`: close preview
- `ArrowLeft`: previous attachment
- `ArrowRight`: next attachment
- `R`: rotate right
- `Shift + R`: rotate left
- `+`: zoom in
- `-`: zoom out
- `0`: fit to screen
- `1`: actual size

Show shortcuts in tooltips, not as permanent instructional text.

## Mobile and Small Screen Behavior

For smaller screens:

- Keep image viewer first.
- Convert the right panel into a bottom drawer.
- Toolbar can become icon-only.
- Thumbnail strip remains at bottom.
- Marks and comments should be accessible from a `Review` button.

## Empty and Error States

No attachment:

- Show a quiet message: `No attachment uploaded for this task.`
- Keep task details visible.

Image failed:

- Show: `Could not load attachment.`
- Include `Open original` if possible.

Wrong attachment:

- Add a quick action: `Mark as wrong attachment`.
- Allow teacher to add a note.

Needs clearer upload:

- Add a quick action: `Needs clearer image`.
- This can add a predefined comment.

## Minimum Implementation Scope

For the first version, implement only:

- Split modal layout with image viewer and right task panel.
- Attachment thumbnails.
- Previous/next attachment navigation.
- Rotate left/right/reset as temporary preview-only rotation.
- Zoom in/out/fit.
- Marks input in the right panel.
- Comment input in the right panel.

Avoid implementing saved rotation, image editing, OCR, or AI grading in the first pass.

## Future Enhancements

Later improvements:

- Save rotation permanently.
- Brightness and contrast controls.
- Grayscale/readability mode.
- AI-assisted mistake detection.
- AI suggested marks.
- Side-by-side comparison of assigned task and submitted work.
- Teacher review status per attachment.
- Parent-visible reviewed feedback.

## Acceptance Criteria

The redesigned attachment preview is successful if:

- Teacher can review an uploaded image without losing task context.
- Teacher can rotate a sideways image quickly.
- Teacher can zoom and inspect handwritten work.
- Teacher can enter or adjust marks from the preview.
- Teacher can add a comment from the preview.
- Teacher can move between attachments without closing the modal.
- Delete is available but visually secondary.
- The design visually matches the MyAcademy royal/professional UI direction.

