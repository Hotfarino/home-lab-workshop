# Home Lab Workshop

An interactive 3D networking lab that runs in your browser. Build a network on the workbench, connect power and data cables, mount rack equipment, and configure the build through a simulated laptop.

**[Launch the Home Lab](https://hotfarino.github.io/home-lab-workshop/home-lab.html)** · [Report a problem](https://github.com/Hotfarino/home-lab-workshop/issues) · [Automated checks](https://github.com/Hotfarino/home-lab-workshop/actions/workflows/pages.yml)

[![Home Lab checks and deployment](https://github.com/Hotfarino/home-lab-workshop/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/Hotfarino/home-lab-workshop/actions/workflows/pages.yml)

This page documents the networking application inside the Virtual IT Lab Portfolio. Its GitHub Pages website publishes the apps and their supporting assets. No account sign-in is needed to use the lab.

## Start learning

1. Select **Start learning** and keep **Home network → rack server → VMs**.
2. Follow the current task beside the workbench. The first task adds a laptop.
3. Connect the requested sockets, switch on the equipment, and press **Continue**.
4. Use **Open laptop → Lab console** for configuration and network tests.
5. Use **Guide options** to adjust help, narration and animation.

**Equipment** opens the parts tray. **Choose lab** selects an exercise. **Save & files** saves in the current browser or exports a portable JSON build. A desktop or laptop browser with WebGL 2 is recommended.

## What the project demonstrates

- **Networking:** cabling, IPv4 addresses and masks, gateways, DHCP, DNS, Wi-Fi, routing and connection troubleshooting.
- **Infrastructure:** compatible rack mounting in an 18U rack, power distribution, RAID 0/1/5/6/10, server prerequisites and virtual-switch isolation.
- **Interactive software:** JavaScript modules, HTML/CSS, Three.js, Blender/GLB assets, responsive controls and validated save-file imports.
- **Verification:** 30 automated test suites cover the engine, guided tasks, restricted OS tools, save validation and navigation. GitHub Actions runs tests before deployment.

| Lab | Focus | Guided tasks |
| --- | --- | ---: |
| Home network from zero | Power, cabling, DHCP, rack server and first VM | 42 |
| Rack storage & RAID | Shared storage, drive failures and recovery | 35 |
| Virtualization server | Guest resources and network isolation | 48 |
| Wireless home office | Access point, security and client connection | 29 |
| Two isolated networks | Subnets, gateways and routing | 31 |
| Hybrid cloud & backup | Local infrastructure, cloud models and backup | 40 |
| Find and repair faults | Cable, DHCP and DNS diagnosis | 5 |
| Free build | Open-ended building with optional orientation | 23 |

These are 253 task occurrences, including shared foundations, rather than 253 unique skills. A validated foundation checkpoint lets returning students skip completed setup. Guided mode teaches each task; six independent challenges offer optional hints and a requirement-by-requirement results breakdown.

## Run locally

```sh
git clone https://github.com/Hotfarino/home-lab-workshop.git
cd home-lab-workshop
python3 -m http.server 8768 --bind 127.0.0.1
```

Open **http://127.0.0.1:8768/home-lab.html**. The runtime is static: no API key, backend or npm installation is needed to use it. Serve it over HTTP rather than opening the HTML as a local file.

## Test and publish

Use Node.js 24 and npm:

```sh
npm ci --ignore-scripts
npm test
npm run build
```

The combined build creates `dist/`: `index.html` is the portfolio, `home-lab.html` opens this networking lab, and `orbit/` contains OS, scripting and game experiences. It checks local links and imports and copies only approved runtime files. Tests, editable Blender sources, npm dependencies and Git metadata stay out of the website artifact.

Pushes to `main` run the [Pages workflow](.github/workflows/pages.yml). Deployment requires a passing test run and build. Pull requests run checks without deploying. The website uses GitHub Pages with GitHub Actions as its publishing source.

DOM tests use LinkeDOM and stub WebGL; they do not replace visual browser testing or prove every possible user-created layout. [Standalone release notes](CHANGELOG.md) explain the repository extraction.

## Architecture

| Files | Responsibility |
| --- | --- |
| `lab-engine.js` | Hardware, cable, power, IPv4, RAID and VM rules |
| `lab-app.js` | State changes, configuration handlers and saves |
| `lab-courses.js`, `lab-learning.js`, `lab-task-checks.js` | Guided tasks, explanations and completion validation |
| `lab-world*.js`, `lab-blender-assets.js`, `lab-model3d*.js` | 3D scene, models, wiring and connector inspection |
| `lab-desktop.js`, `lab-os*.js` | Restricted OS, applications and command simulation |
| `lab-management.js`, `lab-control-center.js` | Management access and laptop tools |
| `scripts/build-pages.mjs` | Standalone website packaging and local-reference checks |

The [Blender directory](blender/README.md) contains editable model sources. Bundled GLB assets and Three.js allow the browser app to work without a front-end compilation step.

## Simulation boundaries

This is an independent educational project covering selected CompTIA A+ networking, hardware and troubleshooting fundamentals. It is not official CompTIA material or a copy of CertMaster.

Windows, Ubuntu, Chrome, Firefox, terminals, networks and VMs are restricted teaching simulations. No real OS kernel, shell commands, packets, virtual machines or cloud resources run. Numeric readings come from the model. Animated cable pulses indicate modeled power/link readiness rather than measured data throughput.

IPv6 routing, tagged trunks, STP, dynamic routing and radio propagation are outside this model. The in-app **Lab manual** describes simplifications and links to technical references.

## Saves and privacy

Progress stays in the current browser unless you export a build. Browser saves do not transfer automatically between the previous hosting address, GitHub Pages and localhost. To move a build, export it from the old address and import the JSON file on the new one. Review device names and settings before sharing a file.

This project link grants no access to private repositories. Public repositories elsewhere on an owner's GitHub profile remain publicly viewable.

## Attribution and issues

Preserve [desktop artwork credits](lab-os-artwork-credits.txt), the [Three.js license](three-license.txt), and the bundled Ubuntu/Yaru notices. Third-party trademarks and artwork belong to their owners; no endorsement is implied.

[Report a problem](https://github.com/Hotfarino/home-lab-workshop/issues) with the lab, task, browser, expected behavior and actual result. Include a screenshot and, if appropriate, an exported build without private information.
