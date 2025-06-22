#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = "."

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"🌐 Servidor de teste rodando em http://localhost:{PORT}")
print("📁 Servindo arquivos de:", os.getcwd())
print("\nArquivos disponíveis:")
for item in os.listdir(".")[:10]:
    print(f"  - {item}")

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"\n✅ Servidor ativo! Acesse http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado")