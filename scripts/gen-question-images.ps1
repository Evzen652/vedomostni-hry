# Ironicke ilustrace k otazkam pres Gemini API (viz CLAUDE.md, zapis 2026-08-28).
#
# Klicova vec, bez ktere to nefunguje: krome textu se posila i REFERENCNI OBRAZEK
# (assets/country-ch.jpg) jako druha "part" requestu. Popsat styl jen slovy drzi
# rukopis podstatne hur - to je duvod, proc cesta pres pollinations neuspela.
#
# Spusteni (Z KORENE REPA, ne z podslozky):
#   $env:GEMINI_API_KEY = "vas-klic"
#   powershell -ExecutionPolicy Bypass -File scripts/gen-question-images.ps1
#
# Klic: https://aistudio.google.com/apikey - POZOR, potrebuje zapnuty billing
# na Google Cloud projektu; zdarma tarif obrazkovy model nepusti vubec (429).

$ApiKey = $env:GEMINI_API_KEY
if (-not $ApiKey) {
    Write-Host "CHYBA: nastavte klic pres  `$env:GEMINI_API_KEY = 'vas-klic'"
    exit 1
}
$Model  = "gemini-2.5-flash-image"

$RefFile = "assets/country-ch.jpg"
if (-not (Test-Path $RefFile)) {
    Write-Host "CHYBA: nenasel jsem $RefFile - spoustite skript z korene repa?"
    exit 1
}
$RefBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path $RefFile)))

$OutDir = "gemini-test-3"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$Style = ", painterly textured watercolor gouache illustration, aged vintage travel journal, muted desaturated ochre cream and soft teal palette, weathered plaster texture background, warm cozy, one single continuous scene with one clear focal point, minimal simple, no text, no words, no letters, no border. Warm, affectionate irony, not cynical."

$Prefix = "Use the attached reference image ONLY as a style guide - the same painterly ink-and-watercolor travel-journal technique, brushwork and warm affectionate irony - but draw a completely different scene, not the reference subject. Depict: "

$Prompts = [ordered]@{}
$Prompts["ar-q-borges"]        = "An elegant blind writer in round dark glasses sitting proudly in a grand spiral library, endless bookshelves towering around him, a small owl wearing tiny glasses perched on a stack of books beside his walking cane"
$Prompts["at-q-schonbrunn"]    = "A small overwhelmed palace butler holding a giant ring overflowing with keys, standing before an impossibly long golden corridor of identical doors at a baroque palace, one door glimpsed slightly open onto a garden"
$Prompts["at-q-hohensalzburg"] = "A mighty medieval fortress sitting smugly on a steep hill above an old town rooftops, a tiny defeated army below packing up siege ladders, one knight scratching his head at the foot of the unclimbable rock"
$Prompts["au-q-opera"]         = "A famous white sail shaped opera house at dusk, its shells rendered as giant cracked eggshells, a tiny opera singer in dramatic pose popping out of the largest shell mid high note, a surprised seagull watching from a railing"
$Prompts["be-k-hranolky"]      = "A paper cone tightly packed with golden crispy potato fries, long thin rectangular sticks, not ice cream, not swirled, steam rising, standing upright at a cheerful street food stand, a small Belgian flag on a toothpick stuck proudly on top of the fries, a nearby French flag on its own stand hanging limp and drooped in comparison, a dollop of mayonnaise glistening on the side"

$Url = "https://generativelanguage.googleapis.com/v1beta/models/" + $Model + ":generateContent"
$Headers = @{ "x-goog-api-key" = $ApiKey }

$Results = @()

foreach ($Id in $Prompts.Keys) {

    $TextPart  = @{ text = $Prefix + $Prompts[$Id] + $Style }
    $ImagePart = @{ inlineData = @{ mimeType = "image/jpeg"; data = $RefBase64 } }

    $Payload = @{
        contents = @( @{ parts = @($TextPart, $ImagePart) } )
        generationConfig = @{
            responseModalities = @("IMAGE")
            imageConfig = @{ aspectRatio = "16:9" }
        }
    }
    $Body = $Payload | ConvertTo-Json -Depth 12

    $Done = $false

    for ($Try = 1; $Try -le 3; $Try++) {

        Write-Host ("Generuji " + $Id + " (pokus " + $Try + "/3)...")

        try {
            $Resp = Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -ContentType "application/json; charset=utf-8" -Body $Body -ErrorAction Stop

            $Part = $null
            foreach ($P in $Resp.candidates[0].content.parts) {
                if ($P.inlineData) { $Part = $P; break }
            }

            if ($Part -ne $null) {
                $Bytes = [Convert]::FromBase64String($Part.inlineData.data)
                $Ext = "jpg"
                if ($Part.inlineData.mimeType -match "png") { $Ext = "png" }
                $OutPath = Join-Path $OutDir ($Id + "." + $Ext)
                [IO.File]::WriteAllBytes((Join-Path (Get-Location) $OutPath), $Bytes)
                Write-Host ("  hotovo -> " + $OutPath)
                $Done = $true
                break
            }
            else {
                Write-Host "  odpoved neobsahuje obrazek"
                Write-Host ($Resp | ConvertTo-Json -Depth 6)
                break
            }
        }
        catch {
            Write-Host ("  chyba: " + $_.Exception.Message)

            $Detail = $null
            if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
                $Detail = $_.ErrorDetails.Message
            }
            elseif ($_.Exception.Response) {
                try {
                    $Stream = $_.Exception.Response.GetResponseStream()
                    $Reader = New-Object System.IO.StreamReader($Stream)
                    $Detail = $Reader.ReadToEnd()
                }
                catch { }
            }
            if ($Detail) {
                Write-Host "  --- detail od Google ---"
                Write-Host $Detail
                Write-Host "  ------------------------"
            }

            if ($Try -lt 3) {
                Write-Host "  cekam 10 s..."
                Start-Sleep -Seconds 10
            }
        }
    }

    $Results += New-Object PSObject -Property @{ Id = $Id; Ok = $Done }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "=== Souhrn ==="
foreach ($R in $Results) {
    $Stav = "SELHALO"
    if ($R.Ok) { $Stav = "OK" }
    Write-Host ($R.Id.PadRight(22) + $Stav)
}
Write-Host ""
Write-Host ("Obrazky jsou ve slozce: " + $OutDir)
