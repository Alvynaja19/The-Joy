import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TARGET_FILES = [
  path.join(projectRoot, 'src', 'landing', 'data', 'content.json'),
  path.join(projectRoot, 'data', 'content.json'),
];

const xlsxPath = path.join(projectRoot, 'mass_update_media_info_1937886628_20261121012721.xlsx');
const pyScript = path.join(__dirname, 'parse_xlsx.py');

// Ekstrak data dari Excel
const pyResult = execSync(`python "${pyScript}" "${xlsxPath}"`, {
  encoding: 'utf-8',
  maxBuffer: 25 * 1024 * 1024,
});
const rows = JSON.parse(pyResult);

const shopeeMap = {};
for (const row of rows.slice(6)) {
  if (row.length > 4 && row[0] && /^\d+$/.test(row[0])) {
    const pid = row[0];
    const name = row[2];
    const cover = row[4];
    const color_images = {};
    for (const [optIdx, imgIdx] of [[16,17], [18,19], [20,21], [22,23], [24,25], [26,27], [28,29], [30,31], [32,33], [34,35]]) {
      if (optIdx < row.length && imgIdx < row.length) {
        const opt = String(row[optIdx] || '').trim();
        const img = String(row[imgIdx] || '').trim();
        if (opt && img.startsWith('http')) {
          color_images[opt] = img;
        }
      }
    }
    shopeeMap[pid] = { pid, name, cover, color_images };
  }
}

// Pemetaan 10 produk rak ke Shopee Product ID
const rackShopeeMap = {
  '01': '46671304148', // Able One Set
  '02': '44921265445', // Aubre Blouse Tweed
  '03': '26897039637', // Calestina Tanktop
  '04': '57121126121', // Camela Cardigan
  '05': '55121179399', // Syerli Top / Blus Wrap Krem
  '06': '45771252090', // Hosa Polo Rajut
  '07': '48821132638', // Makanzie Blouse Rajut
  '08': '51021198189', // Marceli / Polkadot Halterneck
  '09': '50471248795', // Karen Lux Top
  '10': '55571185140', // Sorin Sabrina Top
};

for (const targetPath of TARGET_FILES) {
  const data = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));

  for (let i = 0; i < 10; i++) {
    const p = data.products[i];
    if (!p) continue;
    const num = p.number;
    const pid = rackShopeeMap[num];
    const shopeeItem = shopeeMap[pid];

    // Simpan gambar gantungan baju untuk rak (hero rack)
    p.rack_img = `/images/${num}-front.png`;
    if (!p.side_img) {
      p.side_img = `/images/${num}-side.png`;
    }

    if (shopeeItem) {
      // Ubah gambar katalog dan gambar utama ke foto resmi Shopee
      p.catalog_img = shopeeItem.cover;
      p.front_img = shopeeItem.cover;
      p.shopee_url = `https://shopee.co.id/product/1937886628/${pid}`;

      // Tambahkan foto variasi warna jika ada
      if (Object.keys(shopeeItem.color_images).length > 0) {
        p.color_images = shopeeItem.color_images;
        p.colors = Object.keys(shopeeItem.color_images);
        if (p.colors.length > 0 && !p.colors.includes(p.colorway)) {
          p.colorway = p.colors[0];
        }
      }
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Updated ${targetPath}`);
}
