import zipfile
import xml.etree.ElementTree as ET

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
            shopee_products.append({
                'id': cells[0],
                'name': cells[2],
                'cat_raw': cells[3] if len(cells)>3 else ''
            })

def map_category(cat_raw, name):
    c_lower = cat_raw.lower()
    n_lower = name.lower()
    
    # 1. Denim
    if 'denim' in c_lower or 'denim' in n_lower or 'jeans' in n_lower:
        return 'Denim'
    
    # 2. Batik
    if 'batik' in c_lower or 'batik' in n_lower:
        return 'Batik'
    
    # 3. Kain / Kebaya
    if 'fabric' in c_lower or 'kain' in c_lower or 'kebaya' in c_lower or 'kebaya' in n_lower:
        return 'Kain'
        
    # 4. Bawahan Muslim Wanita
    if 'muslim' in c_lower or 'muslim' in n_lower:
        return 'Bawahan Muslim Wanita'
        
    # 5. Pakaian Tidur & Piyama
    if 'sleepwear' in c_lower or 'pajama' in c_lower or 'piyama' in n_lower or 'pajama' in n_lower or 'tidur' in n_lower:
        return 'Pakaian Tidur & Piyama'
        
    # 6. Dress
    if 'dress' in c_lower or 'gaun' in c_lower or 'dress' in n_lower:
        return 'Dress'
        
    # 7. Set
    if 'sets' in c_lower or 'set' in c_lower or 'one set' in n_lower or 'setelan' in n_lower or '3in1' in n_lower:
        return 'Set'
        
    # 8. Jaket, Mantel, & Rompi
    if 'jackets' in c_lower or 'vests' in c_lower or 'vest' in n_lower or 'jacket' in n_lower or 'jaket' in n_lower or 'rompi' in n_lower or 'mantel' in n_lower or 'cape' in n_lower:
        return 'Jaket, Mantel, & Rompi'
        
    # 9. Sweater & Cardigan
    if 'sweaters' in c_lower or 'cardigan' in c_lower or 'cardigan' in n_lower or 'sweater' in n_lower or 'rajut' in n_lower:
        return 'Sweater & Cardigan'
        
    # 10. Celana Pendek & Skort
    if 'shorts' in c_lower or 'skirt' in c_lower or 'skort' in n_lower or 'short' in n_lower or 'celana pendek' in n_lower or 'rok' in n_lower:
        return 'Celana Pendek'
        
    # 11. Celana Panjang & Legging
    if 'pants' in c_lower or 'legging' in c_lower or 'celana panjang' in n_lower or 'kulot' in n_lower or 'cutbray' in n_lower:
        return 'Celana Panjang & Legging'
        
    # 12. Atasan
    return 'Atasan'

categorized = {}
for p in shopee_products:
    mapped = map_category(p['cat_raw'], p['name'])
    p['mapped'] = mapped
    categorized[mapped] = categorized.get(mapped, []) + [p]

print("Category distribution across all 77 products:")
for cat, prods in sorted(categorized.items()):
    print(f"\n--- {cat} ({len(prods)} produk) ---")
    for prod in prods:
        print(f"  [{prod['id']}] {prod['name'][:60]}")
