# Scholar-led content library

## What will change
- Reframe the site around ulama and scholars, removing Instagram from all visible branding and introductory copy.
- Add a content category to every library item, with options for Fatwa, Advice, Motivation, Reminder, and Lecture.
- Add category filtering to the catalog and a category selector to the add-content form.
- Replace video-first tiles with editorial question cards: the question becomes the largest visual element, followed by scholar, category, topic, and a short excerpt.
- Open each card in a polished overlay. On larger screens, the answer appears beside the original video; on phones, the content stacks cleanly.

## Data and existing content
- Add a validated `content_type` field to the existing content records.
- Keep all existing entries and classify them as Fatwa by default.
- Preserve the current scholar/topic organization and open content-entry access.

## Technical details
- Extend the Lovable Cloud schema, grants, generated query typing, and filters for content categories.
- Use the existing dialog and button patterns for accessible keyboard navigation, focus handling, and close controls.
- Keep the original source link available inside the detail overlay without presenting Instagram as part of the site identity.
- Update page metadata and all visible labels from “fatwa-only” language to a broader scholar-led library.
- Verify loading, filtering, card opening, video placement, and mobile/desktop layouts in the running app.
