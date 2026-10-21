# Orbit Lab — OS & Scripting Studio

A beginner learning portal built around an interactive 3D computer lab. Students learn through **read → try → inspect → explain**, with one task visible at a time.

This workspace is part of the [Home Lab Workshop portfolio](../README.md). It has its own source, lessons, games and browser progress; the broader study hub is not included.

## Learning paths

| Path | Tasks | Practice |
|---|---:|---|
| Your first terminal | 6 | OS, kernel, shell, paths, files and help |
| Linux files & Bash | 6 | Navigation, folders, file copying and a script |
| Windows & PowerShell | 6 | Cmdlets, help, processes, object pipelines and IP inspection |
| macOS & zsh | 5 | Mac paths, Terminal, files and interface inspection |
| Python from zero | 8 | Output, variables, arithmetic, lists, loops, conditions, functions and a report |
| PowerShell automation | 4 | Messages, variables, saved reports and service inspection |
| Build a learning VM | 5 | Exact resources, guest boot, separate console, checkpoints and recovery |
| Independent support challenge | 3 | Filter evidence, document findings and repair a script |
| Linux fieldwork | 8 | Paths, append vs overwrite, file evidence, deletion behavior |
| Windows support desk | 8 | Explorer operations, process diagnosis, verification and handoff |
| macOS files & recovery | 7 | Finder, Get Info, Trash/Put Back and Activity Monitor |
| Python inventory project | 8 | Dictionaries, JSON, filtering, totals and verified reports |
| Reliable Python automation | 6 | Conversion, exceptions, validation boundaries and assertions |
| VM change & recovery lab | 6 | Isolated guest, baseline, checkpoint, change and verified rollback |
| PowerShell evidence pipeline | 7 | Filter, sort, measure, export and inspect CSV records |

There are **93 tasks across 15 paths**, organized as Foundations → Applied OS skills → Deeper projects. The original 43 beginner tasks are unchanged. Tasks are not equivalent to unique exam skills or a full certification curriculum.

## What works

- Three OS-themed workstations, an actual Three.js room, reused Blender-authored hardware, desktop console, rack server, bounded zoom/pan, and clickable reference posters.
- A visible animated Orbit assistant with Show me where highlighting, explanations, task feedback, definitions, real-work examples and a line-by-line code helper. Optional browser narration includes voice selection, reading speed and automatic Guided-step reading. **ElevenLabs is not connected**; this edition uses device/browser speech voices.
- Guided, Practice and Challenge help levels. Independent challenge goals, optional hints and a results review.
- OS-themed File Explorer, Finder and Ubuntu Files: address navigation, folder search, new folders, copy/paste, rename, properties, preview, Trash and restore. OS-themed Task Manager, Activity Monitor and System Monitor: process search/sort, scenario resource displays, practice workload and protected process controls. The GUI and Get-Process use shared process state.
- A shared simulated filesystem for each course’s shell, code editor and file browser. Guest files are separate from host files.
- **Real Python** through pinned Pyodide 314.0.7, served locally and run in a Web Worker. Includes Stop, an eight-second execution limit, output limits, and variable inspection. The runtime starts on the first Python run.
- Bounded PowerShell/Bash/zsh teaching interpreters. Unknown commands, unsupported options, missing files and wrong OS commands produce useful errors.
- VM checks validate every named requirement rather than crediting a matching guest name alone.
- Search across lessons, definitions, acronyms, command examples and source references; click-and-flip memory cards.
- Browser-local progress, course-specific workspaces, export/import with validation, and script downloads.
- Responsive layout, keyboard alternatives for 3D controls, visible focus, reduced-motion support and graceful WebGL failure.

## Packet Blocks campaign

Launch **Packet Blocks** from the top bar or computer dock, or use `/orbit/#packet-blocks`. Toggle bits or select a tile and its destination, then press **Send Packet**. Early rounds include Orbit's guidance; later rounds test independent understanding. Help and small interactive examples remain available. No countdown or lives are required.

The campaign contains **32 rounds in eight chapters and 24 aligned rescues**. Original Packet Rescue missions and the original block arcade remain accessible through **Mission map**, with their earlier saves intact. New campaign progress is separate because the objectives and tasks changed. OS coursework is unchanged.

| Chapter | Skills | Objective context |
|---|---|---|
| Bits / Octets | Four-bit training, eight-bit octets, binary and decimal | Supporting instruction for A+ 2.6 / Network+ 1.7 |
| IPv4 / Address types | Four octets, invalid and duplicate addresses, private and special-use ranges | A+ 220-1201 2.6 / Network+ N10-009 1.7 |
| Configuration | Manual addressing, DHCP, gateway and DNS | A+ 2.4, 2.6 / Network+ 3.4 |
| Network boundaries | Mask-based membership, including /23 across octets | A+ 2.6 foundation / Network+ 1.7 extension |
| Subnetting | /25–/30, network/broadcast/usable ranges | Network+ 1.7 extension |
| Applied troubleshooting | DHCP failure, wrong mask, combined gateway/DNS faults | A+ 5.5 / Network+ 5.3, 5.5 |

Each mission carries its chapter mapping and source ID in `packet-curriculum.js`. **Curriculum & sources** provides the published final A+ v3.0 and Network+ v4.0 PDFs, vendor setting/command references and RFC/IANA sources. These are original educational exercises, not official exam questions. Not all objectives in these sections are covered.

Windows 11 24H2-style, Ubuntu 24.04 GNOME and macOS Sequoia 15-style settings, the supported terminal commands and packet delivery share a single campaign network state. OS switching preserves progress. DNS lookup is displayed separately from delivery. A successful ping alone cannot earn repair credit: all required plan settings must match. The standalone OS coursework retains its own per-course machines.

**Settings & rewards** contains mute, reduced motion, bit hints, cosmetics, concept mastery, replay and a confirmation-protected campaign reset. Endless practice unlocks at eight completions. Progress uses `orbit-packet-blocks-v2` in localStorage; no account or network service is required. The existing coursework export/import does not include this separate campaign save.

Limitations: the views are restricted recreations, not pixel-identical licensed desktops. Commands produce teaching output, not full OS output. Packet flow is an authored logical simulation; it does not emulate Ethernet timing, ARP, transport handshakes, all routing policies or actual network traffic. APIPA is simplified across OS themes. Browser speech uses the device's available voice. Physical touch devices and every browser/OS combination have not been tested.

## Packet Blocks validation

Automated checks cover all 56 authored solutions and incorrect configuration fields, binary/mask arithmetic, private/special-use boundaries, the `192.168.1.130/26` regression, /31–/32 exceptions, shared DNS/routing state, malformed saves and UI lifecycle behavior. Stress checks generate 10,000 solvable rounds, perform 5,000 save/restore transitions and cycle the UI through 300 OS/tool/open/close sequences. Browser coverage and limits are recorded in `../audits/packet-blocks.json`.

## Run locally

From the repository root, run `npm run build` then `npm run serve`. Open **http://127.0.0.1:8783/orbit/**. The server listens only on this computer.

To run this workspace on its own, use the commands below from the `orbit/` directory.

Node 22+ is required for checks and builds. Python 3 is a convenient static web server. No npm installation is needed.

```sh
npm test
npm run build
python3 -m http.server 8782 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8782/`. Use HTTP rather than opening `index.html` with a file URL; modules, WebAssembly and workers need a web origin.

## Educational boundaries

These are **restricted OS and shell simulations**, not licensed Windows/macOS images, full Linux emulation or real virtual machines. Commands never execute on a visitor’s host shell. Networking output and VM behavior are simulated; the lab sends no ping packets, installs no applications and creates no cloud resources.

Python is a genuine runtime, not canned output. It runs in a separate browser worker and uses an in-memory virtual filesystem. Successful runs synchronize text files in the current practice folder with the Files app. Nested Python directories are temporary in this introductory edition. No local filesystem mounting, package downloading or interactive `input()` lesson is provided. A worker and time limit keep ordinary lesson mistakes away from the UI; this is not a hardened service for executing adversarial code.

PowerShell and Unix shell support is deliberately smaller than a real shell. Use the in-app command reference. External programs, administrative changes, complex quoting, command substitution, arbitrary shell loops, background jobs and general shell grammar are outside this version. The Python path does support actual Python loops, conditions and functions.

The coach uses authored lesson instructions and local state; it is not an AI service and sends no prompts to a remote model. Browser narration availability and voice quality depend on the device.

## Standards and sources

Original exercises support CompTIA A+ 220-1202 operating-system, basic-scripting and troubleshooting topics, with virtualization supporting Core 1. The Python sequence intentionally goes beyond scripting awareness to teach practical coding. This is not a complete A+ course, an exam-question bank or a CompTIA/Dion-endorsed product.

References are available inside the lab and in [SOURCES.md](SOURCES.md). Dion’s public course catalog is linked as optional study; proprietary course content and assessment questions are not copied.

## Architecture

- `engine.js`: deterministic command model, paths/files and VM constraints.
- `curriculum.js`: lesson content, result checks, glossary, references and search.
- `storage.js`: schema-checked progress import/restore, including Trash and process state.
- `desktop-model.js` / `desktop.js`: shared file/process state and OS-themed GUI tools.
- `assistant.js`: visible coach, spotlight guidance and browser speech controls.
- `depth-curriculum.js` / `powershell-depth.js`: applied and deeper projects.
- `pipeline.js`: bounded PowerShell object-pipeline support.
- `packet-core.js`: shared campaign network calculations, state, routes and limited command outputs.
- `packet-curriculum.js` / `packet-progress.js`: authored missions, mappings, validation, mastery and bounded saves.
- `packet-os.js` / `packet-blocks.js` / `packet-blocks.css`: OS presentation, interactions and responsive game UI.
- `app.js`: navigation, OS applications, coach and interactions.
- `world.js`: Three.js environment, Blender hardware loading, screens and camera.
- `python-worker.js` / `python.js`: Python execution and lifecycle limits.
- `tests/`: end-to-end lesson solutions at the engine level, negative checks, real Python execution and persistence cases.
- `scripts/build.mjs`: static artifact with only application/runtime files.

All dependencies and runtime assets are local. No analytics, accounts, advertising or external runtime CDN is used. See [ASSETS.md](ASSETS.md) for asset provenance and dependency notices.

## Validation

Automated checks exercise all non-Python lesson solutions and all Python lessons using the bundled runtime; reject wrong VM settings, output and syntax; verify file/path behavior, pipeline semantics, shell errors, bounded recursion, search, state restoration and worker cancellation during startup.

Browser QA additionally covers first-task entry, Linux commands, real Python output and Stop, wrong/correct VM configuration, guest-console context, checkpoint restoration, search, Mac console, and responsive overflow. Automated coverage is not a claim of full real-OS compatibility.

## Earlier OS-interface validation

At this stage, 27 automated tests passed, including every Python exercise against the actual bundled runtime, original lesson preservation, GUI/shell state consistency, GUI deletion and restoration across reload, process protection, all new course solutions, and object pipeline error handling. Browser walkthrough completed: the full Windows support and macOS recovery paths, invalid process-selection feedback, file copy/rename/Trash restore, shared shell verification, Orbit guidance, search, app window controls, and voice Preview/Stop controls were exercised. Desktop and 390 px phone layouts were visually reviewed; the phone page had no horizontal overflow. The browser console reported no warnings or errors in the checked session. Audibility and every installed device voice were not independently verified. QA-only path progress was reset; the original learner path was preserved. The local HTTP server responds successfully.

The build adds a content revision to local app scripts and styles so a normal refresh loads changes. Narration cancellation no longer reports a playback failure, and Orbit keeps the current goal visible during desktop actions.

These interfaces are functional teaching approximations, not pixel-identical OS replicas. Process CPU and memory readings are explicitly labeled scenario values, not host telemetry. Supported object pipelines include Select-Object, property-comparison Where-Object, single-property Sort-Object, Measure-Object -Property ... -Sum, and Export-Csv ... -NoTypeInformation. Unsupported syntax fails with a teaching message. This is not a full PowerShell engine.


## Packet Blocks — network arcade

[Open Packet Blocks](https://hotfarino.github.io/home-lab-workshop/orbit/#packet-blocks), or open **Packet Rescue → Packet Blocks practice**. This is an original block-stacking game inside the same simulated workstation and 3D studio. The laptop screen reflects the game board.

Four stages each have eight question templates (32 rounds total): Binary Bay, Address Avenue, Mask Factory, and Subnet Station. Binary/subnet numbers and answer order vary on repeat runs; initial examples remain simple. Guided mode is untimed. Arcade mode starts gravity only after a correct answer and an explicit Deploy. Every answer has a mathematical or conceptual explanation. Solve, read, deploy, stack, and clear rows.

Arrow keys, on-screen controls and sideways dragging move pieces. Up rotates, Space drops, and P pauses when the board is focused. Leaving the game, losing tab focus, or opening a dialog pauses gravity. Optional synthesized chimes require a user click. Read-aloud uses the existing device voice; no external voice provider was added.

Question history is saved separately under `orbit-packet-blocks-v1`, with a maximum of 160 sanitized records. Review shows up to 20 missed or hinted questions and can replay one question. Clearing arcade history does not alter OS lesson files or progress. The active board is in-memory only and resets on reload; game points are session-specific and are not an exam grade. Existing OS progress exports do not include arcade history.

The math uses 32-bit IPv4 values without signed overflow. Questions cover /24–/30 LAN ranges, plus mask construction for /20 and /23. Reference notes explicitly explain the /31 point-to-point and /32 exceptions. Subnet calculations go beyond basic A+ awareness; no official exam questions are copied or claimed. Microsoft network documentation and RFCs 1918, 3927 and 3021 are linked inside the reference.

Validation: 33 automated tests pass, including all 256 octet conversions, all 33 IPv4 masks, unsigned boundaries, all 32 game templates across five seeds, subnet edge cases, collision/rotation/drop/line clearing, progress sanitization and the original 27 OS-lab checks. Browser QA covered incorrect/correct answers, all eight subnet rounds, single-question replay, row clearing, keyboard movement/rotation/pause, automatic gravity, mistake-review persistence, search, and a 390 px mobile layout with no document-wide horizontal overflow.

### Orbit bit-by-bit walkthroughs

In Packet Blocks, Guided mode automatically coaches the first three Binary Bay rounds (1, 5, 13) and first three Mask Factory rounds (/24, /25, /26). Each walkthrough explains place values or the network/host boundary, asks for all eight bit decisions, and shows the worked result. A wrong decision stays on the same step. Checking is locked until the walkthrough finishes; learners can leave coaching to solve independently. Later binary and mask rounds offer an optional walkthrough. The speaker button uses the existing device voice, with speech stopped when advancing. Coached rounds are identified in the local practice notebook and do not count as unassisted first-try recall. No OS lesson progress is changed.

### Packet Rescue: play the network

[Open Packet Rescue](https://hotfarino.github.io/home-lab-workshop/orbit/#packet-rescue), or choose Packet Rescue in a workstation. It stays inside the existing 3D studio; the current game appears on the active laptop’s screen. The earlier Packet Blocks practice is reachable from the adventure home.

- **Bit Builder:** six missions (1, 5, 13, 42, 77, 192). Drag a value block into the decoder or tap it; tap lit blocks to remove them. The exact sum reconnects the device. Orbit reacts to the remaining amount and extra bits.
- **Subnet Slicer:** six conventional LAN missions. Drag a native keyboard-accessible divider or select /24–/30. The binary mask, address range, capacity and explanation update live. Send a test packet to validate the smallest subnet that fits. Larger subnets are correctly described as workable but outside this mission’s optimization goal. /31 and /32 exceptions are explained in the reference.
- **Progress:** 100 XP per unique mission, 24 total across four sectors; replay cannot inflate the total. Completed sectors offer randomized remixes. Game progress and the current mission use the separate `orbit-packet-rescue-v1` browser storage key. OS lessons and earlier arcade progress retain their existing keys.
- **Coaching:** short inline feedback, optional next-move clues, linked definitions, fuller reasoning and device-voice narration. Optional synthesized chimes, packet animation and reduced-motion support. No timers or lives interrupt beginner practice.
- **Scope:** original educational missions; no official exam-question claim. Packet movement and device recovery are visual teaching metaphors, not real network traffic.

Automated checks cover all nonzero octet targets, every LAN host requirement from 1–254, deterministic remixes, correct-only completion, duplicate credit, and malformed saved runs. Browser QA completed the initial two sectors’ 12 missions and checks dragging, keyboard controls, wrong answers, resume, game switching, search, and narrow layouts.

### Packet Delivery

Choose the **Packet Delivery** card in Packet Rescue. Six missions cover local /24 traffic, routed /24 traffic, a /26 boundary, a shared /23, the upper /25 range, and a /16 boundary. Choose a route and launch the animated data packet, or advance one step at a time. Pause freezes playback; Reset journey enables replay. Orbit explains network-ID comparison, ARP, switch forwarding, routing, new Ethernet headers and TTL. The packet/frame inspector updates at each stage.

The model assumes working Ethernet LANs, consistent masks, learned switch MAC tables, allowed traffic and valid routes. The sender has a connected and a default route; no more-specific route overrides them. ARP resolution is explained but its broadcast/reply are not animated. No NAT is used; the one-way packet retains its IP endpoints while MAC addresses change at the router. The remote LAN is not depicted as the public internet. Routing references are linked inside Explain the why.

Completion requires the correct route and final delivery stage. Playback pauses when leaving the workstation, hiding the tab or opening learning dialogs. Reload resumes at the last reached stage, paused. Existing version-1 browser progress migrates with an empty delivery sector; original lesson/game records remain intact.

Packet Delivery QA: all six missions completed through browser controls, including both wrong-route cases, manual stepping, automatic playback, pause, keyboard input, route reset, glossary/explanations, search, a paused reload, and the 3D laptop display. A 390 px viewport had no page overflow; the diagram pans to keep the moving packet visible. The full automated suite passed 47 tests.

### Network Repair

Choose **Network Repair** in Packet Rescue. Six troubleshooting missions follow **Inspect → Test → Repair → Verify**: an out-of-plan IP, an overly broad mask, a computer mistakenly used as gateway, a missing gateway, a broadcast address, and a moved computer with multiple faults. Orbit provides three progressive clues, definitions, a full explanation and optional device-voice narration. The trusted network plan remains beside the editable simulated adapter settings.

Apply settings, then probe the local computer, configured gateway or remote server. The diagram animates ARP attempts, ICMP requests and return traffic, with pause, single-hop stepping and stop controls. Test results stay tied to the applied settings. Unapplied drafts cannot earn completion. A successful gateway ping to a non-routing computer does not imply remote connectivity. Completion requires the entire configuration plan and all three round trips to pass; any unused, usable IP in the assigned LAN is accepted.

The fault model assumes two Ethernet LANs, a working router, cables, switches, return routes and allowed ICMP. Invalid, duplicate and out-of-plan source addresses stop at an explicit configuration precheck. A wrong narrower mask can still permit connectivity; the separate plan check catches it. This is simulated traffic, not a host-network diagnostic. Microsoft addressing/troubleshooting guidance is linked in the lesson. Existing progress migrates with an empty repair sector, preserving prior completions and XP.

Network Repair automated coverage adds eight model tests and a screen-transition regression test (56 total), including all 256 host-octet candidates, fault/remix correctness, gateway edge cases, wrong-mask connectivity versus configuration accuracy, malformed inputs, pending edits, forged completion, progress migration and duplicate-credit prevention.

Browser QA completed all six repairs, including partial repairs that must fail, a pingable non-routing gateway, invalid input, alternate valid IPs, slash-mask normalization, progressive hints, pause/step/stop, reset, saved drafts, reload, search and switching between Delivery and Repair. The 390 px layout has no document-wide horizontal overflow; the diagram scrolls and follows the packet. Guided playback gives extra reading time. A reset clears the current success display while preserving previously earned mission credit.
