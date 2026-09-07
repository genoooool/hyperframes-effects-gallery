"""Static gallery server with byte ranges for native video seeking."""
import argparse
import http.server
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]


class GalleryHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        self.range_remaining = None
        path = pathlib.Path(self.translate_path(self.path))
        if path.suffix.lower() != '.mp4' or not path.is_file():
            return super().send_head()
        size = path.stat().st_size
        start, end = 0, size - 1
        requested = self.headers.get('Range')
        if requested:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested.strip())
            if not match or not any(match.groups()):
                return self.invalid_range(size)
            first, last = match.groups()
            if first:
                start = int(first)
                end = min(int(last), end) if last else end
            else:
                start = max(0, size - int(last))
            if start > end or start >= size:
                return self.invalid_range(size)
        stream = path.open('rb')
        stream.seek(start)
        self.range_remaining = end - start + 1
        self.send_response(206 if requested else 200)
        self.send_header('Content-Type', 'video/mp4')
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(self.range_remaining))
        self.send_header('Last-Modified', self.date_time_string(path.stat().st_mtime))
        if requested:
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.end_headers()
        return stream

    def invalid_range(self, size):
        self.send_response(416)
        self.send_header('Content-Range', f'bytes */{size}')
        self.send_header('Content-Length', '0')
        self.end_headers()
        return None

    def copyfile(self, source, outputfile):
        try:
            if self.range_remaining is None:
                return super().copyfile(source, outputfile)
            remaining = self.range_remaining
            while remaining:
                chunk = source.read(min(65536, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Moving off a card intentionally aborts its media transfer.


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    server = http.server.ThreadingHTTPServer(('127.0.0.1', args.port), GalleryHandler)
    print(f'Gallery: http://127.0.0.1:{args.port}/#library', flush=True)
    server.serve_forever()
