# Rozřeže čtvercovou 2x2 mřížku vlajek (PNG z Gemini) na čtyři dlaždice
# assets/country-{cc}.jpg (JPG). Nevrhne slepě na půlky — v každém kvadrantu
# najde vlajku projekčním profilem (počet sytých pixelů v řádku/sloupci; izolované
# hnědé skvrny neprojdou) a vyřízne kolem jejího STŘEDU stejně velký čtverec, takže
# všechny dlaždice mají vlajku vycentrovanou se stejným okrajem.
#
# Pořadí kódů: levý-horní, pravý-horní, levý-dolní, pravý-dolní.
# Použití:
#   powershell -File scripts/split-flag-grid.ps1 -In "C:\...\grid.png" -Codes it,ch,es,at
param(
  [Parameter(Mandatory=$true)][string]$In,
  [Parameter(Mandatory=$true)][string]$Codes,   # "TL,TR,BL,BR" oddělené čárkou
  [int]$Crop = 440,      # velikost výřezu ve zdroji (px), vycentrovaného na vlajku
                         # (menší = vlajka vyplní víc dlaždice a dělící linky mřížky vypadnou ven)
  [int]$Out  = 512,      # výsledná velikost dlaždice
  [int]$Quality = 88,
  [switch]$Exact,        # full-bleed mřížka: buňky vyplňují celé pole -> řež přesně
  [int]$Inset = 0,       # (jen -Exact) ořízne N px ze VŠECH stran každé buňky (rámeček + šev)
  [double]$Fill = 0,     # (jen -Exact) 0 = celá buňka; jinak vyřízne vycentrovaný čtverec
                         # o straně Fill*výška_buňky (ořízne krémový okraj kolem vycentrované ilustrace)
  [string]$Prefix = 'country-'  # prefix výstupních souborů (country- pro vlajky, cont- pro kontinenty)
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
# @(...) je nutné: pipeline s JEDNÍM výsledkem se v PowerShellu "rozbalí" na holý
# řetězec, a $cc4[0] by pak indexoval ZNAKY řetězce ("all"[0] = 'a'), ne prvky pole.
$cc4 = @($Codes.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
if ($cc4.Count -notin @(1,2,3,4)) { throw "Codes musí mít 1 (celý obrázek), 2/3 (vedle sebe) nebo 4 (mřížka 2x2) kódy; dostal jsem $($cc4.Count)." }
if ($cc4.Count -ne 4 -and -not $Exact) { throw "Režim $($cc4.Count) kódů (vedle sebe / samostatný) funguje jen s -Exact." }

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'assets'
$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $In))
try {
  $W = $src.Width; $H = $src.Height
  $halfW = [int]($W/2); $halfH = [int]($H/2)
  $step = 2

  function Is-Content($c){
    $mx=[Math]::Max($c.R,[Math]::Max($c.G,$c.B)); $mn=[Math]::Min($c.R,[Math]::Min($c.G,$c.B))
    $sat= if($mx -eq 0){0}else{ ($mx-$mn)/$mx }
    # sytá barva | tmavá linka/rámeček | neutrální bílá (bílý pruh vlajky; krémový
    # papír má tlumenější okrový modrý kanál, proto $mn > 222 odliší bílou od papíru)
    return (($sat -gt 0.42 -and $mx -gt 90) -or $mx -lt 110 -or ($mn -gt 222 -and $sat -lt 0.12))
  }
  # Práh 0.30 z šířky/výšky kvadrantu: řádek/sloupec se počítá jen když obsah zabírá
  # aspoň 30 % (souvislý pruh vlajky projde, ojedinělá skvrna ne). První/poslední
  # takový řádek/sloupec = hranice vlajky — přemostí i nesytý bílý prostřední pruh,
  # protože bere krajní barevné pruhy / rámeček.
  function Get-FlagCenter($x0, $y0) {
    $rowT = [int]($halfW/$step*0.30); $colT = [int]($halfH/$step*0.30)
    $minY=-1;$maxY=-1;$minX=-1;$maxX=-1
    for($y=$y0; $y -lt ($y0+$halfH); $y+=$step){
      $cnt=0
      for($x=$x0; $x -lt ($x0+$halfW); $x+=$step){ if(Is-Content $src.GetPixel($x,$y)){$cnt++} }
      if($cnt -ge $rowT){ if($minY -lt 0){$minY=$y}; $maxY=$y }
    }
    for($x=$x0; $x -lt ($x0+$halfW); $x+=$step){
      $cnt=0
      for($y=$y0; $y -lt ($y0+$halfH); $y+=$step){ if(Is-Content $src.GetPixel($x,$y)){$cnt++} }
      if($cnt -ge $colT){ if($minX -lt 0){$minX=$x}; $maxX=$x }
    }
    return @{ cx=[int](($minX+$maxX)/2); cy=[int](($minY+$maxY)/2) }
  }

  # rozvržení: 2/3 kódy = vedle sebe (Nx1), 4 kódy = mřížka 2x2
  $cols = if($cc4.Count -eq 4){2}else{$cc4.Count}; $rows = if($cc4.Count -eq 4){2}else{1}   # 1 kód = 1x1 (celý obrázek jako jedna buňka)
  $cellW = [int]($W/$cols); $cellH = [int]($H/$rows)
  $quads = @()
  for($r=0; $r -lt $rows; $r++){ for($c=0; $c -lt $cols; $c++){
    $quads += @{ x0=$c*$cellW; y0=$r*$cellH; cw=$cellW; ch=$cellH; cc=$cc4[$r*$cols+$c] }
  } }

  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $half = [int]($Crop/2)

  foreach($q in $quads){
    if($Exact){
      if($Fill -gt 0){
        # vycentrovaný čtverec o straně Fill*výška buňky (ilustrace vyplní dlaždici, okraj se ořízne)
        $side = [int]($q.ch * $Fill)
        $sx = $q.x0 + [int](($q.cw-$side)/2); $sy = $q.y0 + [int](($q.ch-$side)/2)
        $cw = $side; $ch = $side; $note = "stred, cverec $side"
      } else {
        # full-bleed: buňka minus -Inset ze všech stran (ořízne rámeček i šev)
        $sx = $q.x0 + $Inset; $sy = $q.y0 + $Inset
        $cw = $q.cw - 2*$Inset; $ch = $q.ch - 2*$Inset; $note = "bunka (inset $Inset)"
      }
    } else {
      $ctr = Get-FlagCenter $q.x0 $q.y0
      # výřez vycentrovaný na vlajku, přišpendlený do obrázku
      $sx = [Math]::Max(0, [Math]::Min($W-$Crop, $ctr.cx-$half))
      $sy = [Math]::Max(0, [Math]::Min($H-$Crop, $ctr.cy-$half))
      $cw = $Crop; $ch = $Crop; $note = "stred ($($ctr.cx),$($ctr.cy))"
    }
    $bmp = New-Object System.Drawing.Bitmap($Out, $Out)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,$Out,$Out)), (New-Object System.Drawing.Rectangle($sx,$sy,$cw,$ch)), [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $dst = Join-Path $outDir ("{0}{1}.jpg" -f $Prefix,$q.cc)
    $bmp.Save($dst, $enc, $ep); $bmp.Dispose()
    Write-Host ("assets/{0}{1}.jpg  <- {2}" -f $Prefix,$q.cc,$note)
  }
} finally { $src.Dispose() }
