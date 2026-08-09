# Generuje fotorealistické obrázky k otázkám (img/{id}.jpg) přes pollinations.ai.
# Na rozdíl od dlaždic (watercolor) tyto míří na FOTOREALISTICKÝ styl, 16:9 (rám je široký).
# Jednorázově vygeneruje a nabaká do img/ → za běhu appka nic nevolá (offline-only).
# Použití:  powershell -File scripts/gen-question-photos.ps1 [-Only ru-q-elbrus] [-Force]
param(
  [string]$Only = "",      # vygenerovat jen jeden id (bez .jpg), např. ru-q-elbrus
  [switch]$Force           # přegenerovat i existující
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$img = Join-Path $root "img"

$style = ", photorealistic photograph, natural lighting, high detail, cinematic, " +
         "no text, no words, no letters, no watermark, no people in foreground"

# id => @{ p = anglický fotografický motiv; s = seed }
$items = [ordered]@{
  "ru-q-hlavni-mesto"  = @{ p="panorama of Moscow at dusk seen across the river, illuminated historic towered skyline in the distance"; s=21 }
  "ru-q-pasma"         = @{ p="sunrise over snowy Siberian taiga forest, long tree shadows, cold morning haze";                        s=22 }
  "ru-q-bajkal-nej"    = @{ p="Lake Baikal in winter, transparent blue ice with cracks, snowy mountains on the horizon";              s=23 }
  "ru-q-elbrus"        = @{ p="snow-capped twin-peaked Mount Elbrus massif in the Caucasus at clear morning, green alpine meadows in foreground"; s=24 }
  "ru-q-transsib-cil"  = @{ p="long-distance passenger train passing through autumn Siberian taiga, golden larch trees, mist over the landscape"; s=25 }
  "ru-q-kaliningrad"   = @{ p="Baltic sea coast with sand dunes and calm sea at soft evening light, pieces of amber on the sand";      s=26 }
  "ru-q-volha"         = @{ p="aerial view of a wide majestic river winding through a flat summer landscape with forests and sandbanks"; s=27 }
  "ru-q-pelmene"       = @{ p="a bowl of steaming pelmeni dumplings with sour cream and fresh dill on a rustic wooden table, warm soft light"; s=28 }
  "ru-q-metro"         = @{ p="an ornate Moscow metro underground hall with marble columns, mosaics and grand chandeliers, warm light"; s=29 }
  "ru-q-bajkal-hloubka"= @{ p="view from a rocky cliff over the deep dark-blue surface of an enormous lake stretching beyond the horizon"; s=30 }
}

if(-not (Test-Path $img)){ New-Item -ItemType Directory -Path $img | Out-Null }

foreach($id in $items.Keys){
  if($Only -and $id -ne $Only){ continue }
  $out = Join-Path $img "$id.jpg"
  if((Test-Path $out) -and -not $Force){ Write-Host "preskoceno (existuje): $id"; continue }
  $prompt = $items[$id].p + $style
  $enc = [uri]::EscapeDataString($prompt)
  $seed = $items[$id].s
  $url = "https://image.pollinations.ai/prompt/$enc" + "?width=768&height=432&nologo=true&seed=$seed"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 180 -UseBasicParsing
    $kb = [math]::Round(([System.IO.File]::ReadAllBytes($out).Length)/1024)
    Write-Host ("OK  {0,-20} {1} kB (seed {2})" -f $id,$kb,$seed)
  } catch {
    Write-Host ("CHYBA {0}: {1}" -f $id, $_.Exception.Message)
  }
}
Write-Host "Hotovo."
