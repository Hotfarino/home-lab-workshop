# Curriculum references

Reviewed on October 20, 2026. Lessons and explanations are original. These sources establish concepts and behavior; they do not endorse this project.

- [CompTIA-authored A+ 220-1202 objectives, version 2.0 (ONLC-hosted copy)](https://www.onlc.com/comptia/comptia-a-220-1202-exam-objectives.pdf): operating-system tools, macOS/Linux features, troubleshooting and objective 4.8 scripting fundamentals. The public CompTIA resource endpoint redirected during research; the authored objective document was reviewed through this training-provider mirror.
- [Ubuntu command-line tutorial](https://ubuntu.com/desktop/docs/en/latest/tutorial/the-linux-command-line-for-beginners/): terminal, navigation, basic file handling and privileges.
- [Microsoft PowerShell learning path](https://learn.microsoft.com/en-us/training/paths/get-started-windows-powershell/): cmdlet structure, parameters, discovery and help.
- [PowerShell overview](https://learn.microsoft.com/en-us/powershell/scripting/overview): object pipelines and cross-platform operation.
- [About PowerShell scripts](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_scripts): .ps1 files and script invocation.
- [Apple default shell](https://support.apple.com/guide/terminal/change-the-default-shell-trml113/mac): zsh in Terminal.
- [Apple command execution](https://support.apple.com/guide/terminal/apdb66b5242-0d18-49fc-9c47-a2498b7c91d5/mac): executable paths, arguments and command history.
- [Python 3.14 introduction](https://docs.python.org/3.14/tutorial/introduction.html) and [control flow](https://docs.python.org/3.14/tutorial/controlflow.html): values, variables, lists, loops, functions and indentation.
- [Microsoft Hyper-V overview](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/overview): hosts, guests, hypervisors and virtual hardware.
- [Windows 11 requirements](https://www.microsoft.com/en-us/windows/windows-11-specifications): CPU, RAM and storage minimums; the simulation assumes compatible processor, firmware, TPM and graphics capabilities.
- [Dion A+ course catalog](https://www.diontraining.com/collections/comptia-a-1201-1202): optional further study, not a technical source for commands or a claim of endorsement.
- [Pyodide worker documentation](https://pyodide.org/en/stable/usage/webworker.html): module workers and browser Python integration.

Shell outputs and resource sizes are teaching examples. The Ubuntu guest’s 2 vCPU / 4 GB / 40 GB / NAT configuration is the exercise target, not a universal Linux requirement. VM networking choices are expressed in generic NAT/Host-only/Bridged terminology; Hyper-V has its own virtual-switch terminology and configuration steps.


## Applied and deeper practice extension

- [Microsoft File Explorer](https://support.microsoft.com/en-us/windows/experience/fileexplorer/file-explorer-in-windows): navigation and file operations.
- [Apple Activity Monitor](https://support.apple.com/guide/activity-monitor/quit-a-process-actmntr1002/mac): identify processes, quit/force quit, and possible loss of unsaved changes.
- [Python errors and exceptions](https://docs.python.org/3.14/tutorial/errors.html) and [JSON](https://docs.python.org/3.14/library/json.html): original exercises on validation, failure handling and structured reports.
- [Microsoft Where-Object](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/where-object), [Export-Csv](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/export-csv), and [Measure-Object](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/measure-object): object filtering, structured export and numeric aggregation.

The new Python projects deliberately extend beyond CompTIA A+ scripting awareness. GUI styling follows recognizable OS conventions but represents only the documented practice subset. No certification, training vendor or OS vendor endorsement is implied.


### Packet Blocks networking references

- Microsoft: https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/core-network-guide — IPv4, masks, network IDs and routing.
- RFC 1918: https://www.rfc-editor.org/rfc/rfc1918 — private IPv4 ranges.
- RFC 3927: https://www.rfc-editor.org/rfc/rfc3927 — IPv4 link-local addressing.
- RFC 3021: https://www.rfc-editor.org/rfc/rfc3021 — /31 point-to-point exceptions.

Original game questions and diagrams were written for this project. The falling blocks represent a game mechanic; they do not simulate actual packet sizes or transport. Address comparisons alone do not verify real connectivity.
