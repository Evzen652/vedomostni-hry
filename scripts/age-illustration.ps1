# Sjednotí novou ilustraci se stylem starých dlaždic (viz CLAUDE.md, sekce Ilustrace).
#
# PROČ: pollinations dnes maluje jinak než v době, kdy vznikla původní sada
# (cont-*, country-pl, country-sk). Nové kresby jsou čistší a airbrushové,
# chybí jim zvětralý papír a tlumená paleta. Tenhle skript to dorovná:
# z referenční dlaždice převezme barevnou statistiku, podklad (skvrny, vinětaci)
# a zrno — referenci nejdřív rozmaže, takže z ní neprosvítají tvary budov.
#
# Použití:
#   powershell -File scripts/age-illustration.ps1 -In assets/country-at.jpg
#   powershell -File scripts/age-illustration.ps1 -In assets/country-at.jpg -Ref assets/country-sk.jpg -Texture 0.5
param(
  [Parameter(Mandatory=$true)][string]$In,          # ilustrace ke zestárnutí
  [string]$Ref = "assets/country-pl.jpg",           # referenční styl
  [string]$Out = "",                                # výstup (default: přepíše -In)
  [double]$Texture = 0.45,                          # síla podkladu (skvrny, vinětace)
  [double]$Grain   = 0.60,                          # síla zrna
  [double]$GrainClip = 8.0                          # strop zrna (vyšší = prosvítají tvary z reference)
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
function FullPath($p){ if([System.IO.Path]::IsPathRooted($p)){ $p } else { Join-Path $root $p } }
$inPath  = FullPath $In
$refPath = FullPath $Ref
$outPath = if($Out){ FullPath $Out } else { $inPath }

# --- načtení do float polí po kanálech ---
function Load-Channels($path, [ref]$w, [ref]$h){
  $bmp = New-Object System.Drawing.Bitmap($path)
  $w.Value = $bmp.Width; $h.Value = $bmp.Height
  $rect = New-Object System.Drawing.Rectangle(0,0,$bmp.Width,$bmp.Height)
  $data = $bmp.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $bytes = New-Object byte[] ($data.Stride*$bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0,$bytes,0,$bytes.Length)
  $bmp.UnlockBits($data); $stride=$data.Stride; $bmp.Dispose()
  $n = $w.Value*$h.Value
  # pozor: @( pole, pole ) PowerShell rozbali — musi se plnit po indexech
  $ch = New-Object 'object[]' 3
  $ch[0] = New-Object double[] $n; $ch[1] = New-Object double[] $n; $ch[2] = New-Object double[] $n
  for($y=0;$y -lt $h.Value;$y++){
    $row=$y*$stride; $base=$y*$w.Value
    for($x=0;$x -lt $w.Value;$x++){
      $o=$row+$x*3; $i=$base+$x
      $ch[0][$i]=$bytes[$o+2]; $ch[1][$i]=$bytes[$o+1]; $ch[2][$i]=$bytes[$o]   # R,G,B
    }
  }
  return ,$ch     # carka brani rozbaleni pole pri navratu
}

# --- separabilní box blur přes běžící součet ---
function Box-Blur([double[]]$src,[int]$w,[int]$h,[int]$r){
  $tmp = New-Object double[] ($w*$h); $dst = New-Object double[] ($w*$h)
  for($y=0;$y -lt $h;$y++){
    $base=$y*$w; $sum=0.0
    for($x=0;$x -le $r -and $x -lt $w;$x++){ $sum+=$src[$base+$x] }
    for($x=0;$x -lt $w;$x++){
      $lo=$x-$r-1; $hi=$x+$r
      if($hi -lt $w){ $sum+=$src[$base+$hi] }
      if($lo -ge 0){ $sum-=$src[$base+$lo] }
      $a=[Math]::Max(0,$x-$r); $b=[Math]::Min($w-1,$x+$r)
      $tmp[$base+$x]=$sum/($b-$a+1)
    }
  }
  for($x=0;$x -lt $w;$x++){
    $sum=0.0
    for($y=0;$y -le $r -and $y -lt $h;$y++){ $sum+=$tmp[$y*$w+$x] }
    for($y=0;$y -lt $h;$y++){
      $lo=$y-$r-1; $hi=$y+$r
      if($hi -lt $h){ $sum+=$tmp[$hi*$w+$x] }
      if($lo -ge 0){ $sum-=$tmp[$lo*$w+$x] }
      $a=[Math]::Max(0,$y-$r); $b=[Math]::Min($h-1,$y+$r)
      $dst[$y*$w+$x]=$sum/($b-$a+1)
    }
  }
  return ,$dst
}

function Stats([double[]]$a){
  $m=0.0; foreach($v in $a){ $m+=$v }; $m/=$a.Length
  $s=0.0; foreach($v in $a){ $d=$v-$m; $s+=$d*$d }; $s=[Math]::Sqrt($s/$a.Length)
  return ,@($m,$s)
}

$iw=0;$ih=0;$rw=0;$rh=0
$img = Load-Channels $inPath  ([ref]$iw) ([ref]$ih)
# POZOR: nesmi se jmenovat $ref — koliduje s parametrem [string]$Ref a PowerShell
# by pole zkonvertoval na retezec (indexovalo by se pak po znacich, ne po pixelech)
$refCh = Load-Channels $refPath ([ref]$rw) ([ref]$rh)
if($iw -ne $rw -or $ih -ne $rh){ throw "Ilustrace a reference musi mit stejny rozmer ($iw x $ih vs $rw x $rh)." }
$n = $iw*$ih

# podklad reference (rozmazany = bez tvaru budov) a jeji jemne zrno
$refBlur=@(); $refGrain=@()
for($c=0;$c -lt 3;$c++){
  $b  = Box-Blur $refCh[$c] $iw $ih 24
  $b2 = Box-Blur $refCh[$c] $iw $ih 2
  # zrno = jen jemny sum papiru; silne vychylky jsou hrany budov z reference,
  # ty se musi odriznout, jinak z ilustrace prosvitaji cizi tvary
  $g  = New-Object double[] $n
  for($i=0;$i -lt $n;$i++){
    $d = $refCh[$c][$i]-$b2[$i]
    $g[$i] = [Math]::Max(-$GrainClip,[Math]::Min($GrainClip,$d))
  }
  $refBlur += ,$b; $refGrain += ,$g
}

$outCh=@()
for($c=0;$c -lt 3;$c++){
  $si = Stats $img[$c]; $sr = Stats $refCh[$c]; $sb = Stats $refBlur[$c]
  $scale = if($si[1] -gt 0.5){ $sr[1]/$si[1] } else { 1.0 }
  $o = New-Object double[] $n
  for($i=0;$i -lt $n;$i++){
    # 1) prenos palety: srovnej prumer a rozptyl na referenci
    $v = ($img[$c][$i]-$si[0])*$scale + $sr[0]
    # 2) podklad: skvrny a vinetace z rozmazane reference
    $f = if($sb[0] -gt 0.5){ $refBlur[$c][$i]/$sb[0] } else { 1.0 }
    $v = $v*(1.0-$Texture) + ($v*$f)*$Texture
    # 3) zrno papiru
    $v += $refGrain[$c][$i]*$Grain
    $o[$i] = [Math]::Max(0.0,[Math]::Min(255.0,$v))
  }
  $outCh += ,$o
}

# --- zapis ---
$bmp = New-Object System.Drawing.Bitmap($iw,$ih,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$rect = New-Object System.Drawing.Rectangle(0,0,$iw,$ih)
$data = $bmp.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::WriteOnly,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$bytes = New-Object byte[] ($data.Stride*$ih)
for($y=0;$y -lt $ih;$y++){
  $row=$y*$data.Stride; $base=$y*$iw
  for($x=0;$x -lt $iw;$x++){
    $o=$row+$x*3; $i=$base+$x
    $bytes[$o+2]=[byte][Math]::Round($outCh[0][$i])
    $bytes[$o+1]=[byte][Math]::Round($outCh[1][$i])
    $bytes[$o]  =[byte][Math]::Round($outCh[2][$i])
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($bytes,0,$data.Scan0,$bytes.Length)
$bmp.UnlockBits($data)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$prm = New-Object System.Drawing.Imaging.EncoderParameters(1)
$prm.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 88L)
$bmp.Save($outPath,$codec,$prm); $bmp.Dispose()
Write-Host ("OK  {0}  ({1} kB, ref {2}, texture {3}, grain {4})" -f (Split-Path $outPath -Leaf), [math]::Round((Get-Item $outPath).Length/1024), (Split-Path $refPath -Leaf), $Texture, $Grain)
