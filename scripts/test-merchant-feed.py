"""Run after npm run build. Validate feed against its generated product pages."""
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ns = {'g': 'http://base.google.com/ns/1.0'}
items = ET.parse('dist/google-products.xml').getroot().findall('./channel/item')
assert items, 'Feed must contain products'
ids = set()
for item in items:
    def value(key):
        return item.findtext('g:' + key, namespaces=ns)
    product_id = value('id')
    assert product_id not in ids, f'Duplicate ID: {product_id}'
    ids.add(product_id)
    assert value('availability') == 'in_stock'
    assert re.fullmatch(r'\d+\.\d{2} EUR', value('price'))
    assert value('image_link').endswith('.jpg')
    html = Path('dist/proizvodi', product_id, 'index.html').read_text()
    data = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html).group(1))
    assert data['offers']['price'] + ' EUR' == value('price')
    assert data['offers']['url'] == value('link')
    assert data['image'][0] == value('image_link')
    assert data['offers']['availability'].endswith('InStock')
    assert 'noindex' not in html
    assert 'proizvod=' + product_id in html
assert len(Path('dist/_redirects').read_text().splitlines()) == sum(not p.startswith('vg-') for p in ids)
for product_id in ids:
    if product_id.startswith('vg-'):
        assert Path('dist/merchant-images', product_id + '.jpg').read_bytes().startswith(b'\xff\xd8')
print(f'Validated {len(items)} products: XML, unique IDs, landing pages, price and availability parity, image rewrites.')
