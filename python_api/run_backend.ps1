param(
  [string]$BindHost = "127.0.0.1",
  [int]$Port = 8000,
  [switch]$NoReload
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$venvPython = Join-Path $repoRoot ".venv38\Scripts\python.exe"

if (Test-Path $venvPython) {
  $python = $venvPython
} else {
  $python = "python"
}

$uvicornArgs = @("-m", "uvicorn", "app.main:app", "--host", $BindHost, "--port", "$Port")
if (-not $NoReload) {
  $uvicornArgs += "--reload"
}

Push-Location $PSScriptRoot
try {
  & $python @uvicornArgs
} finally {
  Pop-Location
}
