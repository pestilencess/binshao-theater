# -*- coding: utf-8 -*-
"""把整个游戏打包成一个 HTML 文件（CSS/JS/全部人物照片内联），可直接发微信群"""
import base64, io, re, pathlib
from PIL import Image

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')

# 1) 内联 CSS
css = (root / 'css' / 'style.css').read_text(encoding='utf-8')
html = re.sub(r'<link rel="stylesheet"[^>]*>', '<style>\n' + css + '\n</style>', html)

# 2) 内联 JS
def inline_js(m):
    p = root / m.group(1).split('?')[0]
    return '<script>\n' + p.read_text(encoding='utf-8') + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)

# 3) 内联全部人物抠图照片（长边压到 640px，手机高清屏足够）
total = 0
for p in sorted((root / 'assets').glob('*_cut.png')):
    img = Image.open(p).convert('RGBA')
    if max(img.size) > 640:
        r = 640 / max(img.size)
        img = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, 'PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()
    n = html.count('assets/' + p.name)
    html = html.replace('assets/' + p.name, 'data:image/png;base64,' + b64)
    total += len(buf.getvalue())
    print(f'  内联 {p.name}: {len(buf.getvalue())//1024} KB (引用 {n} 处)')

out = root / '彬少剧场-单文件版.html'
out.write_text(html, encoding='utf-8')
print(f'打包完成: {out.name}  ({out.stat().st_size/1024:.0f} KB)')
