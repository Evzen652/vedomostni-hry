# Ověření umístění vlajky v hotové dlaždici: najde obdélník vlajky (sytá barva NEBO
# tmavá linka rámečku; nejdelší souvislý blok, aby skvrny mimo vlajku nerušily) a
# vypíše okraje L/R/T/B v pixelech. Vyvážené = |L-R| a |T-B| malé.
# Použití:
#   powershell -File scripts/verify-tile.ps1 -Files "assets/country-cz.jpg,assets/country-pl.jpg"
param([Parameter(Mandatory=$true)][string]$Files, [int]$Tol=24)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot

function Is-Content($c){
  $mx=[Math]::Max($c.R,[Math]::Max($c.G,$c.B)); $mn=[Math]::Min($c.R,[Math]::Min($c.G,$c.B))
  $sat= if($mx -eq 0){0}else{ ($mx-$mn)/$mx }
  return (($sat -gt 0.42 -and $mx -gt 90) -or $mx -lt 110 -or ($mn -gt 222 -and $sat -lt 0.12))
}
$bad=0
foreach($f in ($Files.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })){
  $path = if([System.IO.Path]::IsPathRooted($f)){$f}else{Join-Path $root $f}
  $img=[System.Drawing.Bitmap]::FromFile((Resolve-Path $path))
  $W=$img.Width;$H=$img.Height;$step=2
  $rowT=[int]($W/$step*0.30);$colT=[int]($H/$step*0.30)
  $minY=-1;$maxY=-1;$minX=-1;$maxX=-1
  for($y=0;$y -lt $H;$y+=$step){ $cnt=0; for($x=0;$x -lt $W;$x+=$step){ if(Is-Content $img.GetPixel($x,$y)){$cnt++} }; if($cnt -ge $rowT){ if($minY -lt 0){$minY=$y};$maxY=$y } }
  for($x=0;$x -lt $W;$x+=$step){ $cnt=0; for($y=0;$y -lt $H;$y+=$step){ if(Is-Content $img.GetPixel($x,$y)){$cnt++} }; if($cnt -ge $colT){ if($minX -lt 0){$minX=$x};$maxX=$x } }
  $mL=$minX;$mR=$W-1-$maxX;$mT=$minY;$mB=$H-1-$maxY
  $dH=[Math]::Abs($mL-$mR);$dV=[Math]::Abs($mT-$mB)
  $ok = ($dH -le $Tol -and $dV -le $Tol)
  if(-not $ok){$bad++}
  Write-Host ("{0}: L={1} R={2} T={3} B={4}  dHoriz={5} dVert={6}  {7}" -f (Split-Path $path -Leaf),$mL,$mR,$mT,$mB,$dH,$dV,($(if($ok){'OK'}else{'!! NEVYVAZENE'})))
  $img.Dispose()
}
if($bad -gt 0){ Write-Host "`n$bad dlaždic nevyvážených." }
