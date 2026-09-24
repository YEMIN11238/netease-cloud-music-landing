# Goodpatch-inspired PC revision

Reference: https://goodpatch.com/ja, visually reviewed 2026-09-24.

Implemented: full-viewport music artwork and oversized centered headline; scroll-linked circle mask; pinned light two-column discovery scene; oversized editorial section headings; side-filtered two-column album gallery; staggered musician posters; magnetic circular CTAs; preserved ASCII scene, stacked playlists, vinyl control, album switcher, community reactions, sound routes, scene selector, 14-chapter navigation and motion pause.

The opening now uses an original lightweight WebGL image treatment: slow surface distortion and traveling light while idle, local refraction and glow under the mouse, and a small pointer-following shift of the artwork and heading. It renders only while the opening story is onscreen, limits canvas resolution and frame rate, and falls back to the still image if WebGL is unavailable. The pause control and reduced-motion preference hide this effect.

Only desktop is in scope. All reference effects are independently implemented; Goodpatch assets, mascot, brand identity and website source were not copied. The opening is an animated still-image composition, not a supplied video or a true 3D scene. The original Orange Horse and CARGOX-inspired interactions remain where compatible; the old two-screen smoke layout is superseded by the new reference.

Hero: `assets/music-hero-red.png`, 1672 × 941 pixels. Generated with built-in imagegen, one request, no variants. The source output is not included in this repository.

## Final generation prompt

Use case: stylized-concept
Asset type: original raster hero artwork for a premium desktop music concept homepage.
Primary request: a wide 16:9 cinematic macro world of soft inflated crimson and vermilion sculptural sound loops, rounded pebbles and cloud-like cushions, with a large central glowing peach-coral vinyl-like circular sculptural ring/disc with a central hole.
Scene/backdrop: an immersive sophisticated monochrome red studio world, dimensional sculptural forms filling the entire canvas.
Style/medium: polished high-end 3D art direction, original inflatable abstract design scene, smooth tactile resin and rubber with exquisite soft shadows.
Composition/framing: landscape 16:9, balanced centered main ring/disc, full visible circular silhouette, enough surrounding forms for depth; centered subject remains strong under a circular center crop. Cinematic macro perspective.
Lighting/mood: warm diffused studio lighting, glowing peach-coral highlights, optimistic and premium musical energy.
Color palette: crimson, vermilion, red, peach-coral highlights, nuanced warm red shadows.
Constraints: image artwork only. A website will overlay a large white headline separately. Absolutely no text, letters, typography, UI, logos, watermark or people. No dark grungy science-fiction appearance. Create one original composition, not a copy of any existing artwork.
