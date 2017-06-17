# image-gallery
Simple VanillaJS image gallery using a WordPress API as the backend.
Displays all featured images from posts. No authentication required.

## Sample data
Included is a local JSON file of a few posts.
Images are still fetched remotely.

## To do
- [x] Likes
  - [x] hide heart on grid view
  - [x] hookup heart counter
- [ ] Comments
  - [ ] design comment box
  - [ ] get comments from JSON
  - [ ] post new comment
  - [ ] delete comment??
- [ ] Bugs and Refactoring
  - [x] Consistent show/hide
  - [x] Fix the errors showing in the console, even if they aren't breaking anything...
  - [x] clicking on single image takes you to grid-view... - display: none fixes....
  - [x] grid-view height maintained when not visible.
- [ ] CSS
  - [ ] remove all id's from css where possible eg class of hideable instead of setting each id with an opacity.
