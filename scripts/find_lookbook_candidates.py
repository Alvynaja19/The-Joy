import json

with open('c:/Users/akbar/Music/Hey-Joey/src/landing/data/content.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data['products']

# Let's inspect some natural combinations:
# Look 01: Feminine Elegant (e.g., Yeona Peplum Vest / Aubre Blouse + Gebriel Long Pants or Calista Pants)
# Look 02: Casual Chic (e.g., Camela Cardigan / Sorin Sabrina + Skort Layer Jhesany or Calista Pants)
# Or Windsor Pleateds One Set (Top + Pants) or Calestina Tanktop + Short Pants Zhiva Denim / Skort Tenis Mofi

candidates = []
for p in products:
    pid = p['id']
    num = p['number']
    cat = p['category']
    name = p['name']
    price = p['price']
    cover = p['front_img']
    candidates.append({
        'id': pid,
        'number': num,
        'category': cat,
        'name': name,
        'price': price,
        'cover': cover
    })

print("Tops:")
for p in [c for c in candidates if c['category'] in ['Atasan', 'Sweater & Cardigan']][:8]:
    print(f"  [{p['id']}] #{p['number']} ({p['category']}) {p['name'][:50]} - Rp {p['price']}")
    print(f"       Cover: {p['cover']}")

print("\nBottoms:")
for p in [c for c in candidates if c['category'] in ['Celana Panjang & Legging', 'Celana Pendek', 'Denim']][:8]:
    print(f"  [{p['id']}] #{p['number']} ({p['category']}) {p['name'][:50]} - Rp {p['price']}")
    print(f"       Cover: {p['cover']}")

print("\nSets / Full Look:")
for p in [c for c in candidates if c['category'] in ['Set']][:5]:
    print(f"  [{p['id']}] #{p['number']} ({p['category']}) {p['name'][:50]} - Rp {p['price']}")
    print(f"       Cover: {p['cover']}")
