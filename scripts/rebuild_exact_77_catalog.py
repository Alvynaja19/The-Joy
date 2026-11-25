import zipfile
import xml.etree.ElementTree as ET
import json
import re

# 1. Read all 77 products from Excel
excel_path = 'c:/Users/akbar/Music/Hey-Joey/mass_update_media_info_1937886628_20261121012721.xlsx'
shopee_products = []

with zipfile.ZipFile(excel_path) as z:
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
                'name': cells[2].strip(),
                'cat_raw': cells[3].strip() if len(cells)>3 else '',
                'cover': cells[4].strip(),
                'color_images': color_images,
                'colors': list(color_images.keys()),
            })

print(f'Total Shopee products in Excel: {len(shopee_products)}')

# 2. Definisikan mapping 12 kategori resmi
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
    if 'dresses' in c_lower or 'dress' in c_lower or 'gaun' in c_lower or 'dress' in n_lower:
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

# 3. Urutan 10 produk rak interaktif
rack_shopee_ids = [
    '46671304148', # 01: Able One Set Piyama Renda
    '44921265445', # 02: Aubre Blouse Tweed Peplum
    '26897039637', # 03: Calestina Tanktop Polkadot
    '57121126121', # 04: Camela Cardigan Rajut
    '55121179399', # 05: Blus Wrap Krem Elegan / Syerli Top
    '45771252090', # 06: Hosa Polo Rajut Stripe
    '48821132638', # 07: Makanzie Blouse Rajut Batwing
    '51021198189', # 08: Marceli Halter Top / Polkadot Halterneck
    '50471248795', # 09: Karen Lux Top V-Neck Peplum
    '55571185140', # 10: Sorin Sabrina Top
]

# Baseline harga wajar per kategori
CATEGORY_PRICES = {
    'Set': 348000,
    'Jaket, Mantel, & Rompi': 285000,
    'Celana Panjang & Legging': 265000,
    'Pakaian Tidur & Piyama': 245000,
    'Dress': 290000,
    'Sweater & Cardigan': 280000,
    'Celana Pendek': 185000,
    'Atasan': 195000,
    'Denim': 295000,
    'Batik': 250000,
    'Bawahan Muslim Wanita': 235000,
    'Kain': 265000,
}

KNOWN_PRICES = {
    '46671304148': 189000,
    '44921265445': 175000,
    '26897039637': 145000,
    '57121126121': 165000,
    '55121179399': 169000,
    '45771252090': 179000,
    '48821132638': 159000,
    '51021198189': 155000,
    '50471248795': 169000,
    '55571185140': 175000,
    '58171233063': 348000,
    '58071755179': 265000,
    '57871199036': 295000,
    '56521222906': 345000,
    '55070950058': 391000,
    '54821352831': 310000,
    '52121196314': 427000,
    '49521402268': 245000,
    '48571183352': 285000,
    '48321186827': 320000,
    '47121257292': 290000,
}

def clean_slug(name):
    s = name.lower()
    s = re.sub(r'^hey joey!?\s*[-–—:]*\s*', '', s)
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s).strip('-')
    return s[:50]

def extract_fabric(text):
    m = re.search(r'(?:bahan|fabric|material)\s*[:=-]?\s*([a-zA-Z0-9\s/&,]+?)(?:\.|\n|;|$)', text, re.I)
    if m:
        return m.group(1).strip()
    if 'semiwool' in text.lower(): return 'Semiwool Premium'
    if 'tweed' in text.lower(): return 'Tweed Houndstooth Lembut'
    if 'chinos' in text.lower(): return 'Prime Chinos Premium'
    if 'rajut' in text.lower() or 'knit' in text.lower(): return 'Rajut Halus Lembut'
    if 'katun' in text.lower(): return 'Katun Premium Halus'
    if 'rayon' in text.lower(): return 'Rayon Halus Adem'
    if 'chiffon' in text.lower(): return 'Chiffon Ringan Halus'
    if 'pleats' in text.lower() or 'pleated' in text.lower(): return 'Pleated Crepe Halus'
    if 'twill' in text.lower(): return 'Twill Bellano Halus'
    return 'Kain Pilihan Berkualitas'

shopee_dict = {p['id']: p for p in shopee_products}

final_products = []
seq = 1

# A. Masukkan 10 produk rak terlebih dahulu
for pid in rack_shopee_ids:
    sp = shopee_dict[pid]
    num_str = f"{seq:02d}"
    cat = map_category(sp['cat_raw'], sp['name'])
    price_int = KNOWN_PRICES.get(pid, CATEGORY_PRICES.get(cat, 189000))
    tag_price = f"Rp {round(price_int / 1000)}rb"
    clean_name = re.sub(r'^HEY JOEY!\s*[-–—:]*\s*', '', sp['name']).strip()
    slug = clean_slug(clean_name)
    colorway = sp['colors'][0] if sp['colors'] else ''
    fabric = extract_fabric(clean_name)

    prod = {
        "id": str(seq),
        "slug": slug,
        "number": num_str,
        "name": clean_name,
        "category": cat,
        "colorway": colorway,
        "price": price_int,
        "tag_price": tag_price,
        "front_img": sp['cover'],
        "catalog_img": sp['cover'],
        "rack_img": f"/images/{num_str}-front.png",
        "side_img": f"/images/{num_str}-side.png",
        "shopee_url": f"https://shopee.co.id/product/1937886628/{pid}",
        "on_rack": True,
        "is_new": True,
        "colors": sp['colors'],
        "color_images": sp['color_images'],
        "sizes": ["All Size (Fit to L)"],
        "fabric": fabric,
        "fit": "Potongan feminin terstruktur khas HEY JOEY!",
        "care_note": "Cuci manual dengan air dingin, jemur di tempat teduh",
        "description": f"Koleksi unggulan {clean_name}. Desain elegan dengan bahan pilihan nyaman dipakai harian.",
    }
    if seq == 10:
        prod["sideScale"] = 0.78
        prod["frontScale"] = 0.78

    final_products.append(prod)
    seq += 1

# B. Masukkan sisa 67 produk Shopee lainnya
for sp in shopee_products:
    pid = sp['id']
    if pid in rack_shopee_ids:
        continue # Sudah dimasukkan di rak 1-10

    num_str = f"{seq:02d}"
    cat = map_category(sp['cat_raw'], sp['name'])
    price_int = KNOWN_PRICES.get(pid, CATEGORY_PRICES.get(cat, 195000))
    tag_price = f"Rp {round(price_int / 1000)}rb"
    clean_name = re.sub(r'^HEY JOEY!\s*[-–—:]*\s*', '', sp['name']).strip()
    slug = clean_slug(clean_name)
    colorway = sp['colors'][0] if sp['colors'] else ''
    fabric = extract_fabric(clean_name)

    sizes = ["All Size (Fit to L)"]
    if any(s in clean_name.lower() for s in [' s ', ' m ', ' l ', ' xl ']):
        sizes = ["S", "M", "L"]

    prod = {
        "id": f"prod-{num_str}",
        "slug": slug,
        "number": num_str,
        "name": clean_name,
        "category": cat,
        "colorway": colorway,
        "price": price_int,
        "tag_price": tag_price,
        "front_img": sp['cover'],
        "catalog_img": sp['cover'],
        "side_img": sp['cover'],
        "shopee_url": f"https://shopee.co.id/product/1937886628/{pid}",
        "on_rack": False,
        "is_new": True,
        "colors": sp['colors'],
        "color_images": sp['color_images'],
        "sizes": sizes,
        "fabric": fabric,
        "fit": "",
        "care_note": "",
        "description": f"Koleksi resmi {clean_name}. Potongan nyaman dan anggun khas HEY JOEY!. Tersedia di Shopee.",
    }

    final_products.append(prod)
    seq += 1

print(f'\nTotal final products disusun: {len(final_products)}')
print(f'Total on_rack True: {len([p for p in final_products if p["on_rack"]])}')
print(f'Total on_rack False: {len([p for p in final_products if not p["on_rack"]])}')

# Check category breakdown
cat_counts = {}
for p in final_products:
    c = p['category']
    cat_counts[c] = cat_counts.get(c, 0) + 1

print('\nDistribusi Kategori Final:')
for k, v in sorted(cat_counts.items()):
    print(f'  {k}: {v}')

# Save to content.json
for target_path in ['c:/Users/akbar/Music/Hey-Joey/src/landing/data/content.json', 'c:/Users/akbar/Music/Hey-Joey/data/content.json']:
    with open(target_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data['products'] = final_products
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'✓ Updated {target_path}')
