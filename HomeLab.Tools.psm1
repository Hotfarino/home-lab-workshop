# Read-only Windows lab helpers. No network settings or virtual machines are changed.
# Import-Module .\HomeLab.Tools.psm1
# Get-HomeLabNetwork
# Test-HomeLabService -ComputerName example.com -Port 443
# Get-HomeLabVM
function Get-HomeLabNetwork {
    [CmdletBinding()]
    param()
    if (-not (Get-Command Get-NetIPConfiguration -ErrorAction SilentlyContinue)) {
        throw 'Windows NetTCPIP module is required.'
    }
    Get-NetIPConfiguration -All
}
function Test-HomeLabService {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$ComputerName,
        [ValidateRange(1,65535)][int]$Port = 443
    )
    if (-not (Get-Command Test-NetConnection -ErrorAction SilentlyContinue)) {
        throw 'Windows NetTCPIP module is required.'
    }
    Test-NetConnection -ComputerName $ComputerName -Port $Port -InformationLevel Detailed
    # TCP reachability does not verify TLS, application health or data freshness.
}
function Get-HomeLabVM {
    [CmdletBinding()]
    param()
    if (-not (Get-Command Get-VM -ErrorAction SilentlyContinue)) {
        throw 'The Windows Hyper-V PowerShell module and appropriate host access are required.'
    }
    Get-VM
}
Export-ModuleMember -Function Get-HomeLabNetwork,Test-HomeLabService,Get-HomeLabVM
