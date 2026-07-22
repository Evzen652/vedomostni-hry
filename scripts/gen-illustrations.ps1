# Generuje ilustrace dlaždic (kontinenty / země / sekce) ve stylu rozcestníku
# přes pollinations.ai (bez API klíče, bez modelu = tlumený "cestovní deník").
# Použití:  powershell -File scripts/gen-illustrations.ps1 [-Only cont-asia] [-Force]
param(
  [string]$Only = "",      # vygenerovat jen jeden soubor (bez .jpg), např. cont-asia
  [switch]$Force           # přegenerovat i existující
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "assets"

$style = ", painterly textured watercolor gouache illustration, aged vintage travel journal, " +
         "muted desaturated ochre cream and soft teal palette, weathered plaster texture background, " +
         "warm cozy, single centered subject, minimal simple, no text, no words, no letters, no border"

# název souboru => @{ p = motiv (jeden jednoduchý předmět/scéna); s = seed }
$items = [ordered]@{
  # --- kontinenty ---
  "cont-europe"     = @{ p="a single grand european castle with a tall tower";           s=6  }
  "cont-asia"       = @{ p="a single traditional east asian pagoda temple";              s=3  }
  "cont-africa"     = @{ p="a single acacia tree on the african savanna with a warm sun"; s=8 }
  "cont-namerica"   = @{ p="the statue of liberty, single centered monument";            s=4  }
  "cont-samerica"   = @{ p="the machu picchu ancient stone ruins on a mountain peak";    s=7  }
  "cont-oceania"    = @{ p="a single koala sitting on a eucalyptus branch";              s=5  }
  "cont-antarctica" = @{ p="a single cute penguin standing on an iceberg";               s=9  }
  # --- země ---
  "country-ru"      = @{ p="saint basil cathedral with colorful onion domes, single centered building"; s=8 }
  "country-pl"      = @{ p="the royal castle of warsaw with old town houses, single centered building"; s=6 }
  "country-sk"      = @{ p="a medieval slovak castle on a hill with tatra mountains";    s=3  }
  # --- sekce ---
  "section-vse"     = @{ p="a vintage globe with a small brass compass";                 s=5  }
  "section-mista"   = @{ p="a folded old travel map with a single red location pin";     s=7  }
  "section-priroda" = @{ p="a forested hill with pine trees and a small winding river";  s=4  }
  "section-lide"    = @{ p="two friendly diverse people portraits side by side";         s=11 }
  "section-kultura" = @{ p="a pair of theatre comedy and tragedy masks with folk ornament"; s=8 }
  "section-umeni"   = @{ p="an artist paint palette with brushes and a small canvas";    s=6  }
  "section-sport"   = @{ p="a single golden trophy cup with a laurel wreath";            s=3  }
  "section-jazyk"   = @{ p="an open antique book with a feather quill pen";              s=9  }
  "section-jidlo"   = @{ p="a plate of tasty food with a fork and a knife";              s=5  }
  "section-historie"= @{ p="a single ancient greek ionic stone column";                 s=7  }
}

foreach($name in $items.Keys){
  if($Only -and $name -ne $Only){ continue }
  $out = Join-Path $assets "$name.jpg"
  if((Test-Path $out) -and -not $Force){ Write-Host "preskoceno (existuje): $name"; continue }
  $prompt = $items[$name].p + $style
  $enc = [uri]::EscapeDataString($prompt)
  $seed = $items[$name].s
  $url = "https://image.pollinations.ai/prompt/$enc" + "?width=512&height=512&nologo=true&seed=$seed"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 180 -UseBasicParsing
    $kb = [math]::Round(([System.IO.File]::ReadAllBytes($out).Length)/1024)
    Write-Host ("OK  {0,-18} {1} kB (seed {2})" -f $name,$kb,$seed)
  } catch {
    Write-Host ("CHYBA {0}: {1}" -f $name, $_.Exception.Message)
  }
}
Write-Host "Hotovo."
