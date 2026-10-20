# Blender hardware and environment

The editable `home-lab.blend` contains the 13 equipment types plus dedicated 2U rack variants for NAS and UPS and a furnished home-lab room. Open it in Blender to inspect, refine, or render the models. These are generic teaching models built against the simulator's port contract, not manufacturer CAD or exact product replicas.

The library adds beveled cases, vents, fasteners, drive trays, rack ears, keyboard legends, screen surfaces, socket contacts, tabletop materials, rack rails and casters. The 18U rack uses a 19-inch equipment width and 1.75-inch U pitch. The coordinate scale is 19/6 inches per simulation unit. Socket IDs are glTF extras, allowing the browser's power, cabling, rack and guided-learning logic to operate the models.

## Rebuild from this repository

Install Blender and the optional glTF optimizer, then run from the repository root:

```sh
npm ci
npm install --no-save --package-lock=false gltfpack@1.3.0
blender --background --python blender/build_lab.py
node blender/optimize.mjs
node test-lab-blender.mjs
npm run build
```

Set `LAB_RENDER=1` on the Blender command to also render `blender/home-lab-preview.png`. The Python script is the reproducible model source. Manual edits in the .blend file must be reflected in the script or separately exported before rerunning it, since rebuilding replaces generated files.

The browser downloads `lab-blender-hardware.glb` and `lab-blender-room.glb`. GLB files use meshopt compression and the bundled decoder. Preserve `device_<type>` roots, `labPort` and `labPower` extras, material names ending `_active`, and `architectural_backdrop` when editing or optimizing. Keep the asset socket coordinates aligned with `hardware-spec.json`. Blender converts the script's simulation coordinates to its Z-up convention; glTF exports return to the browser's Y-up convention.

The exploded viewer keeps the Blender chassis whole and animates only its connectors and wires. Physical link lamps, screen illumination, and cable pulses derive from simulation state. A lit Ethernet link still does not prove that IP, DNS, or a service works.

References: [Blender glTF export](https://docs.blender.org/manual/en/5.1/addons/import_export/scene_gltf2.html), [meshoptimizer gltfpack](https://meshoptimizer.org/gltf/).

The browser routes cables along the workbench and outside rack channel. The room includes cable-management hoops aligned with that channel. `equipmentDimensions()` and `equipmentPorts()` define the rack-variant geometry contract; the engine uses 18 numbered units while preserving existing lower-unit saved placements.

Edition 40 corrects top-facing text orientation at authoring time: a label with a +Y simulation normal uses the identity Blender quaternion, avoiding the ambiguous parallel-axis track quaternion. Keyboard rows and all socket coordinates stay fixed. The worktop, room wall and floor now have separate materials; the ESD mat remains distinct. Rebuild and meshopt optimization are required before shipping the two GLB files.
