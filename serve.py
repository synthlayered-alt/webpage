#!/usr/bin/env python3
"""
Custom HTTP server that sends the correct Referrer-Policy header
to allow YouTube embeds to work without Error 153.
"""
import http.server
import socketserver
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8092

class ReferrerFriendlyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Send Referrer-Policy that allows cross-origin referrers
        # This is the key fix for YouTube embed Error 153 on localhost
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        # Allow cross-origin resource loading
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[SERVER] {self.address_string()} - {format % args}")

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), ReferrerFriendlyHandler) as httpd:
    print(f"[SERVER] Serving at http://localhost:{PORT}")
    print(f"[SERVER] Referrer-Policy: strict-origin-when-cross-origin")
    print(f"[SERVER] Portfolio: http://localhost:{PORT}/index.html")
    print(f"[SERVER] Admin:     http://localhost:{PORT}/admin.html")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[SERVER] Shutting down.")
