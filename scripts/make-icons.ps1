# Gera os ícones PWA do Guia Peru: silhueta de Machu Picchu (montanha de pedra + Huayna Picchu)
# e um sol dourado, sobre terracota andino. Rode com Windows PowerShell:
#   powershell.exe -NoProfile -File scripts/make-icons.ps1
Add-Type -AssemblyName System.Drawing
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) "static"

$TERRA  = [System.Drawing.Color]::FromArgb(255, 181, 69, 31)    # #B5451F fundo terracota
$SUN    = [System.Drawing.Color]::FromArgb(255, 252, 191, 73)   # #FCBF49 sol
$STONE  = [System.Drawing.Color]::FromArgb(255, 232, 220, 200)  # #E8DCC8 montanha da frente
$STONE2 = [System.Drawing.Color]::FromArgb(255, 184, 161, 132)  # #B8A184 pico de trás (Huayna Picchu)

function New-Icon([int]$size, [string]$file, [double]$scale) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear($TERRA)

  function P([double]$x, [double]$y) {
    $sx = 0.5 + ($x - 0.5) * $scale
    $sy = 0.5 + ($y - 0.5) * $scale
    New-Object System.Drawing.PointF ([single]($sx * $size)), ([single]($sy * $size))
  }

  $bSun    = New-Object System.Drawing.SolidBrush $SUN
  $bStone  = New-Object System.Drawing.SolidBrush $STONE
  $bStone2 = New-Object System.Drawing.SolidBrush $STONE2
  $bTerra  = New-Object System.Drawing.SolidBrush $TERRA

  # Sol
  $r = 0.11 * $scale
  $c = P 0.69 0.31
  $g.FillEllipse($bSun, ($c.X - $r * $size), ($c.Y - $r * $size), ($r * 2 * $size), ($r * 2 * $size))

  # Pico de trás (Huayna Picchu, mais fino e alto)
  $back = [System.Drawing.PointF[]]@((P 0.625 0.27), (P 0.47 0.76), (P 0.81 0.76))
  $g.FillPolygon($bStone2, $back)

  # Montanha da frente (larga)
  $front = [System.Drawing.PointF[]]@((P 0.41 0.33), (P 0.125 0.79), (P 0.72 0.79))
  $g.FillPolygon($bStone, $front)

  # Terraços (linhas de terracota cortando a montanha da frente)
  foreach ($band in @(@(0.655, 0.22, 0.625), @(0.715, 0.19, 0.655))) {
    $y = $band[0]; $x1 = $band[1]; $x2 = $band[2]
    $tl = P $x1 $y; $br = P $x2 ($y + 0.022)
    $g.FillRectangle($bTerra, $tl.X, $tl.Y, ($br.X - $tl.X), ($br.Y - $tl.Y))
  }

  $bSun.Dispose(); $bStone.Dispose(); $bStone2.Dispose(); $bTerra.Dispose(); $g.Dispose()
  $bmp.Save((Join-Path $dir $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "  OK $file"
}

New-Icon 512 "icon-512.png" 1.0
New-Icon 192 "icon-192.png" 1.0
New-Icon 512 "icon-512-maskable.png" 0.70
Write-Host "Icons done."
