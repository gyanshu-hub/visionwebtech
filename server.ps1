$port = 8080
$folder = "c:\Users\gyans\Dropbox\Desktop\New folder\vision-web-tech"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Secure server successfully running at http://localhost:$port/"
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $urlPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "index.html"
            }
            
            # Security Sanitize Path: Block Directory Traversal Attacks
            $cleanPath = $urlPath.Replace("..", "").Replace("//", "/")
            $filePath = Join-Path $folder $cleanPath
            
            # Comprehensive Hardened HTTP Security Headers
            $response.AddHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me;")
            $response.AddHeader("X-Content-Type-Options", "nosniff")
            $response.AddHeader("X-Frame-Options", "DENY")
            $response.AddHeader("X-XSS-Protection", "1; mode=block")
            $response.AddHeader("Referrer-Policy", "strict-origin-when-cross-origin")
            $response.AddHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(), usb=()")
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Accept-Ranges", "bytes")

            # Block server files (.ps1, .md, .git, .env)
            if ($cleanPath -match '\.(ps1|md|env|git)$') {
                $response.StatusCode = 403
                $err = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
                $response.OutputStream.Write($err, 0, $err.Length)
                $response.OutputStream.Close()
                continue
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".mp4"  { "video/mp4" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".png"  { "image/png" }
                    ".svg"  { "image/svg+xml" }
                    ".xml"  { "application/xml; charset=utf-8" }
                    ".txt"  { "text/plain; charset=utf-8" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $mime
                
                # Performance Caching Strategies for Static Assets
                if ($ext -match '\.(jpg|jpeg|png|svg|mp4|css|js)$') {
                    $response.AddHeader("Cache-Control", "public, max-age=2592000, immutable")
                } else {
                    $response.AddHeader("Cache-Control", "no-cache, must-revalidate")
                }
                
                $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $fileBytes.Length
                try {
                    $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
                } catch {}
            } else {
                $response.StatusCode = 404
                $response.ContentType = "text/html; charset=utf-8"
                $notFoundPath = Join-Path $folder "404.html"
                if (Test-Path $notFoundPath) {
                    $notFoundBytes = [System.IO.File]::ReadAllBytes($notFoundPath)
                    $response.ContentLength64 = $notFoundBytes.Length
                    try {
                        $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                    } catch {}
                } else {
                    $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                    try {
                        $response.OutputStream.Write($err, 0, $err.Length)
                    } catch {}
                }
            }
            try {
                $response.OutputStream.Close()
            } catch {}
        } catch {}
    }
} catch {
    Write-Error $_
} finally {
    if ($listener -ne $null -and $listener.IsListening) {
        $listener.Stop()
    }
}
