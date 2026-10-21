# Virtual Lab Portfolio release notes

## Unified portfolio — October 21, 2026

- Added a portfolio landing page with links to the networking lab, Orbit OS & Scripting Lab, Packet Rescue, Packet Blocks and the RAID guide.
- Imported Orbit source, 56 automated tests, licensed runtime assets and 24 Packet Rescue missions into `orbit/`.
- Preserved the networking app at `home-lab.html` and redirect legacy root workflow bookmarks there.
- Added return navigation and one build/CI pipeline for both apps; website packaging excludes test files and personal exports.
- Kept simulation rules and browser storage keys intact. Localhost and GitHub Pages progress remain separate.


## Standalone GitHub project — October 20, 2026

- Extracted the Home Lab application, tests and model sources from the validated Edition 47 implementation.
- Added a dedicated GitHub repository and Pages workflow that tests the lab before publishing only browser runtime files.
- Added a direct project-source link in the lab and kept Home navigation within this application.
- Removed links to the wider study hub and unavailable network guide. The included RAID guide returns to Home Lab.
- Updated local setup and Blender export paths for the standalone repository layout.
- Existing saved builds remain portable through JSON export/import. Browser storage is separate on each hosting origin.

The networking, hardware, RAID, VM and guided-task simulation rules are unchanged from Edition 47.
