# Orizne tenky papirovy lem/ramecek, ktery Gemini casto prida kolem sceny
# (i pri promptu "no borders"), a prevede na ctvercovou dlazdici 512x512
# JPG q88 jako ostatni assets/country-*.jpg.
#
# Jak to funguje: ROVNOMERNY orez o -Margin procent ze vsech ctyr stran,
# bez detekce "nejtmavsi linky" — ta se u obrazku s tmavou siluetou v horni
# casti (napr. hrad na kopci) splete a orizne i kus sceny. Zkontroluj vzdy
# vysledek; kdyz lem porad zbyva, zvys -Margin.
#
# Pouziti:
#   powershell -File scripts/crop-gemini-frame.ps1 -In "D:\weigle\stažené soubory\Gemini_....png" -Out assets/country-cz.jpg
#   powershell -File scripts/crop-gemini-frame.ps1 -In ... -Out ... -Margin 0.04
param(
  [Parameter(Mandatory=$true)][string]$In,
  [Parameter(Mandatory=$true)][string]$Out,
  [double]$Margin = 0.03, # podil sirky/vysky orezany z kazde strany (0.03 = 3 %)
  [int]$Size = 512
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
function FullPath($p){ if([System.IO.Path]::IsPathRooted($p)){ $p } else { Join-Path $root $p } }
$inPath = $In  # muze byt i mimo repo (stazene soubory), nepretahovat pres FullPath
$outPath = FullPath $Out

$src = New-Object System.Drawing.Bitmap($inPath)
$w=$src.Width; $h=$src.Height

$mx=[int]($w*$Margin); $my=[int]($h*$Margin)
$x0=$mx; $y0=$my; $x1=$w-$mx; $y1=$h-$my
$cw=$x1-$x0; $ch=$y1-$y0
$side=[Math]::Min($cw,$ch)
$cx=$x0+[int](($cw-$side)/2); $cy=$y0+[int](($ch-$side)/2)

$bmp = New-Object System.Drawing.Bitmap($Size,$Size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, (New-Object System.Drawing.Rectangle(0,0,$Size,$Size)), (New-Object System.Drawing.Rectangle($cx,$cy,$side,$side)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose(); $src.Dispose()

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$prm = New-Object System.Drawing.Imaging.EncoderParameters(1)
$prm.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 88L)
$bmp.Save($outPath,$codec,$prm); $bmp.Dispose()
Write-Host ("OK  {0}  orez ({1},{2}) {3}x{3}  -> {4} ({5} kB)" -f (Split-Path $inPath -Leaf), $cx,$cy,$side,(Split-Path $outPath -Leaf),[math]::Round((Get-Item $outPath).Length/1024))
