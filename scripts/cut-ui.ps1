# Vyřízne jednotlivé UI kusy (tlačítka / boxy) z mřížky 3x2 na plochém pozadí,
# každý natěsno k jeho obrysu, uloží jako PNG do assets/ui/{Prefix}-{label}.png.
# Použití:
#   powershell -File scripts/cut-ui.ps1 -In "...\sheet.png" -Prefix btn -Labels "coral,teal,ochre,green,cream,blue"
param(
  [Parameter(Mandatory=$true)][string]$In,
  [Parameter(Mandatory=$true)][string]$Prefix,
  [Parameter(Mandatory=$true)][string]$Labels,   # 6 názvů po řádcích (TL,TM,TR,BL,BM,BR)
  [int]$Cols = 3, [int]$Rows = 2, [int]$Pad = 3,
  [switch]$ByAlpha   # detekce obsahu podle alfa kanálu (průhledné pozadí) místo barvy
)
$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Drawing
$lab = $Labels.Split(',') | %{ $_.Trim() }
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'assets\ui'
if(-not (Test-Path $outDir)){ New-Item -ItemType Directory -Path $outDir | Out-Null }
$src=[System.Drawing.Bitmap]::FromFile((Resolve-Path $In))
$W=$src.Width;$H=$src.Height;$cw=[int]($W/$Cols);$ch=[int]($H/$Rows);$step=3
# pozadí = průměr rohu
$bg=$src.GetPixel(4,4)
function ColDiff($c,$b){ [Math]::Abs($c.R-$b.R)+[Math]::Abs($c.G-$b.G)+[Math]::Abs($c.B-$b.B) }
$idx=0
for($r=0;$r -lt $Rows;$r++){ for($c=0;$c -lt $Cols;$c++){
  $x0=$c*$cw;$y0=$r*$ch
  $minX=-1;$maxX=-1;$minY=-1;$maxY=-1
  for($y=$y0;$y -lt ($y0+$ch);$y+=$step){ for($x=$x0;$x -lt ($x0+$cw);$x+=$step){
    $px=$src.GetPixel($x,$y)
    $isC = if($ByAlpha){ $px.A -gt 40 } else { (ColDiff $px $bg) -gt 40 }
    if($isC){
      if($minX -lt 0 -or $x -lt $minX){$minX=$x}; if($x -gt $maxX){$maxX=$x}
      if($minY -lt 0 -or $y -lt $minY){$minY=$y}; if($y -gt $maxY){$maxY=$y}
    }
  } }
  $bx=[Math]::Max(0,$minX-$Pad);$by=[Math]::Max(0,$minY-$Pad)
  $bw=[Math]::Min($W-$bx,($maxX-$minX)+2*$Pad);$bh=[Math]::Min($H-$by,($maxY-$minY)+2*$Pad)
  $bmp=New-Object System.Drawing.Bitmap($bw,$bh)
  $g=[System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src,(New-Object System.Drawing.Rectangle(0,0,$bw,$bh)),(New-Object System.Drawing.Rectangle($bx,$by,$bw,$bh)),[System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $out=Join-Path $outDir ("{0}-{1}.png" -f $Prefix,$lab[$idx])
  $bmp.Save($out,[System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
  Write-Host ("assets/ui/{0}-{1}.png  ({2}x{3})" -f $Prefix,$lab[$idx],$bw,$bh)
  $idx++
} }
$src.Dispose()
