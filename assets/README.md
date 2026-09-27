# assets/

This folder is reserved for any images, exported icons, or font files you add later
(e.g. the MeleteNova Solutions logo as a PNG/SVG, resume thumbnails, or custom icon sets).

Right now the prototype has no external asset dependencies — all icons are inline SVG
in index.html, and fonts (Sora, Inter) load from Google Fonts via a `<link>` tag in
index.html's `<head>`.

If you add files here, reference them from CSS or HTML like:
  background-image: url('assets/your-file.png');
  <img src="assets/your-file.svg">
