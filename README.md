# Reversent — AI safety evaluation

Professional business edition for Reversent, the independent AI-safety project founded by Thor Fabian Pettersen.

## Website

The complete website is in `dist/`. It uses plain HTML, CSS and JavaScript. No installation or build step is required. The exact blue Reversent logo asset from the supplied v4.5 site is included locally. No external fonts or runtime dependencies are required.

The design uses Reversent’s navy and cyan palette, a concise business narrative, an interactive diagram of the proposed Aegis decision boundary, an intervention comparison, an evaluation process, and an explicit research-status section.

All original topics, five evaluation stages, public research links, benchmark count and version/status information from the supplied site are preserved. The intended commercial model remains clearly identified as research-stage and unvalidated. The updated site includes the existing Reversent contact address and links to the wider Reversent sites.

## Accessibility and navigation

Responsive desktop and mobile layouts, semantic landmarks, a skip link, visible keyboard focus, an accessible mobile menu, reduced-motion support, and active section navigation. There are no visible interaction tutorials.

## Interactive front panel

Hold the primary mouse button and drag to rotate the complete panel on both axes, including the reverse of the same live screen with naturally mirrored lettering. The same colors, pressure state and animations remain visible from either side. The view stays at the released orientation. The reset icon or Home key restores the front view; focused arrow-key controls also rotate it. Goal-pressure and motion controls work independently of dragging. A drag is distinguished from a click, so rotating does not accidentally select a stage.

Selecting AI System, Aegis or the Correction Path changes the panel to blue, violet or green respectively. The goal-pressure slider changes signal speed and pressure state; it does not run or represent an AI evaluation. Manual rotation remains available with ambient motion paused or reduced motion enabled. Animations stop outside the viewport and while the document is hidden.

The exact supplied Reversent v4.5 logo is used in the header, footer and favicon. The main navigation’s Reversent Network button jumps to the footer links, ordered with Research before Introducing Aegis. The Metaphysical Ocean link remains in that network.

## Hosting elsewhere

Copy the contents of `dist/` into your website root. For GitHub Pages, place these files at the root of the selected publishing folder. Keep index.html, styles.css and script.js together.

## Validation

JavaScript syntax, HTML structure and landmarks, local asset references, internal anchors, original research links and research-stage claims were checked. Pointer interactions were checked for click/drag separation, full rotation, release position, cancellation, slider independence, reduced-motion operation and keyboard reset. Browser-based visual testing was not performed.
