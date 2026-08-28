# Prevede vygenerovane ilustrace na format, ktery appka pouziva:
# 16:9 JPG, sirka 1200 px, kvalita 84 - viz CLAUDE.md, zapis 2026-07-31.
#
# Spusteni ze slozky, kde mate gemini-test-3 a gemini-test-4:
#   powershell -ExecutionPolicy Bypass -File prevod.ps1
#
# Vysledek: slozka .\hotove-jpg\  - jeji obsah pak nakopirujete do img/ v repu.

Add-Type -AssemblyName System.Drawing

$Zdroje = @("gemini-test-3", "gemini-test-4")
$Cil = "hotove-jpg"
$Sirka = 1200

New-Item -ItemType Directory -Force -Path $Cil | Out-Null

# JPEG encoder s nastavitelnou kvalitou (vychozi Save() dava mekky vysledek)
$Encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$Params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$Params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 84)

$Pocet = 0
$PredUsp = 0
$PoUsp = 0

foreach ($Zdroj in $Zdroje) {

    if (-not (Test-Path $Zdroj)) {
        Write-Host ("preskakuji " + $Zdroj + " - neexistuje")
        continue
    }

    foreach ($F in (Get-ChildItem $Zdroj -Include *.png,*.jpg -Recurse)) {

        $Obr = [System.Drawing.Image]::FromFile($F.FullName)
        $PredUsp = $PredUsp + $F.Length

        $NovaVyska = [int][math]::Round($Obr.Height * ($Sirka / $Obr.Width))

        $Novy = New-Object System.Drawing.Bitmap($Sirka, $NovaVyska)
        $G = [System.Drawing.Graphics]::FromImage($Novy)
        $G.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $G.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $G.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $G.DrawImage($Obr, 0, 0, $Sirka, $NovaVyska)

        $CilovySoubor = Join-Path (Join-Path (Get-Location) $Cil) ($F.BaseName + ".jpg")
        $Novy.Save($CilovySoubor, $Encoder, $Params)

        $G.Dispose()
        $Novy.Dispose()
        $PuvodniSirka = $Obr.Width
        $PuvodniVyska = $Obr.Height
        $Obr.Dispose()

        $Vysledny = (Get-Item $CilovySoubor).Length
        $PoUsp = $PoUsp + $Vysledny
        $Pocet = $Pocet + 1

        Write-Host ($F.BaseName.PadRight(26) + $PuvodniSirka + "x" + $PuvodniVyska + " -> " + $Sirka + "x" + $NovaVyska + "   " + [math]::Round($F.Length/1MB,2) + " MB -> " + [math]::Round($Vysledny/1KB) + " kB")
    }
}

Write-Host ""
Write-Host ("Prevedeno " + $Pocet + " obrazku do slozky " + $Cil)
Write-Host ("Celkem pred: " + [math]::Round($PredUsp/1MB,1) + " MB    po: " + [math]::Round($PoUsp/1MB,1) + " MB")
Write-Host ""
Write-Host "Kdyby se cely fond (3702 otazek) delal takhle, vyslo by to zhruba na:"
if ($Pocet -gt 0) {
    $NaObrazek = $PoUsp / $Pocet
    Write-Host ("  " + [math]::Round(($NaObrazek * 3702)/1MB) + " MB")
}
