import zipfile
import xml.etree.ElementTree as ET
import json

# 1. Read all 77 products from Excel
shopee_products = []
with zipfile.ZipFile('c:/Users/akbar/Music/Hey-Joey/mass_update_media_info_1937886628_20261121012721.xlsx') as z:
    sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
    strings = [(elem.text or '') for elem in sst.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
    sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    all_rows = list(sheet.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'))
    
    for r in all_rows[6:]:
        cells = []
        for c in r.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
            v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
            t = c.get('t')
            val = ''
            if v is not None and v.text is not None:
                if t == 's':
                    val = strings[int(v.text)] if int(v.text) < len(strings) else ''
                else:
                    val = v.text
            cells.append(val)
        if len(cells) > 4 and cells[0] and cells[0].isdigit():
            color_images = {}
            for opt_idx, img_idx in [(16,17), (18,19), (20,21), (22,23), (24,25), (26,27), (28,29), (30,31), (32,33), (34,35)]:
                if opt_idx < len(cells) and img_idx < len(cells):
                    opt = cells[opt_idx].strip()
                    img = cells[img_idx].strip()
                    if opt and img.startswith('http'):
                        color_images[opt] = img
            shopee_products.append({
                'id': cells[0],
                'sku': cells[1] if len(cells)>1 else '',
                'name': cells[2],
                'category': cells[3] if len(cells)>3 else '',
                'cover': cells[4],
                'color_images': color_images,
                'colors': list(color_images.keys()),
            })

print(f'Total Shopee products in Excel: {len(shopee_products)}')

# 2. Read current content.json products
with open('c:/Users/akbar/Music/Hey-Joey/src/landing/data/content.json', 'r', encoding='utf-8') as f:
    current_data = json.load(f)
current_products = current_data['products']
print(f'Total current products in content.json: {len(current_products)}')

# 3. Check Shopee IDs in current_products
id_counts = {}
for p in current_products:
    url = p.get('shopee_url', '')
    parts = url.strip('/').split('/')
    last = parts[-1]
    if last.isdigit():
        id_counts[last] = id_counts.get(last, []) + [p['number'] + ': ' + p['name'][:40]]

duplicates = {k: v for k, v in id_counts.items() if len(v) > 1}
print(f'\nDuplicate products in content.json ({len(duplicates)} items duplicated):')
for k, v in duplicates.items():
    print(f'  ID {k}: {v}')

shopee_ids_set = set(p['id'] for p in shopee_products)
current_ids_set = set(id_counts.keys())

missing_in_current = shopee_ids_set - current_ids_set
print(f'\nShopee products missing in content.json ({len(missing_in_current)} items):')
for mid in missing_in_current:
    sp = next(p for p in shopee_products if p['id'] == mid)
    print(f'  MISSING: {mid} - {sp["name"][:60]} ({sp["category"]})')

# 4. Check category mapping accuracy
print('\nCategory breakdown comparison:')
cat_counts_current = {}
for p in current_products:
    cat = p.get('category', 'Uncategorized')
    cat_counts_current[cat] = cat_counts_current.get(cat, 0) + 1

for k, v in sorted(cat_counts_current.items()):
    print(f'  Current {k}: {v}')
