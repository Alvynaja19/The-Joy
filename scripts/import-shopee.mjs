/**
 * import-shopee.mjs
 * 
 * Script import seluruh data produk Shopee ke content.json pada proyek Hey-Joey.
 * Aturan:
 * 1. Menjaga 10 produk pertama (on_rack: true) tetap utuh
 * 2. Menjaga site_settings tetap utuh
 * 3. Menetapkan on_rack: false untuk seluruh produk baru
 * 4. Sinkronisasi ke src/landing/data/content.json dan data/content.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const TARGET_FILES = [
  path.join(projectRoot, "src", "landing", "data", "content.json"),
  path.join(projectRoot, "data", "content.json"),
];

// 12 Kategori resmi yang didukung di filter katalog website
const VALID_CATEGORIES = [
  "Atasan",
  "Set",
  "Jaket, Mantel, & Rompi",
  "Celana Pendek",
  "Celana Panjang & Legging",
  "Pakaian Tidur & Piyama",
  "Dress",
  "Denim",
  "Batik",
  "Bawahan Muslim Wanita",
  "Sweater & Cardigan",
  "Kain",
];

// Baseline harga wajar per kategori jika file sumber hanya berisi info media/tanpa harga
const CATEGORY_DEFAULT_PRICE = {
  "Set": 348000,
  "Jaket, Mantel, & Rompi": 285000,
  "Celana Panjang & Legging": 265000,
  "Pakaian Tidur & Piyama": 245000,
  "Dress": 290000,
  "Sweater & Cardigan": 280000,
  "Celana Pendek": 185000,
  "Atasan": 195000,
  "Denim": 295000,
  "Batik": 250000,
  "Bawahan Muslim Wanita": 235000,
  "Kain": 150000,
};

// Database harga khusus produk Shopee yang terdata
const KNOWN_SHOPEE_PRICES = {
  "58171233063": 348000,
  "58071755179": 265000,
  "57871199036": 295000,
  "57121126121": 280000,
  "56521222906": 345000,
  "55070950058": 391000,
  "55121179399": 275000,
  "54821352831": 310000,
  "52121196314": 427000,
  "49521402268": 245000,
  "48571183352": 285000,
  "48321186827": 320000,
  "47121257292": 290000,
};

// Helper kategori dari Shopee / teks produk ke kategori website
function mapCategory(shopeeCat = "", productName = "") {
  const combined = (shopeeCat + " " + productName).toLowerCase();

  if (/piyama|sleepwear|pajama|tidur/i.test(combined)) return "Pakaian Tidur & Piyama";
  if (/setelan|sets|one set|set\b/i.test(combined)) return "Set";
  if (/cardigan|sweater|rajut|knit/i.test(combined)) return "Sweater & Cardigan";
  if (/jaket|jacket|coat|vest|rompi|mantel/i.test(combined)) return "Jaket, Mantel, & Rompi";
  if (/short|celana pendek/i.test(combined)) return "Celana Pendek";
  if (/pants|legging|celana panjang|kulot|trousers/i.test(combined)) return "Celana Panjang & Legging";
  if (/dress|gaun/i.test(combined)) return "Dress";
  if (/denim|jeans/i.test(combined)) return "Denim";
  if (/batik/i.test(combined)) return "Batik";
  if (/muslim|rok/i.test(combined)) return "Bawahan Muslim Wanita";
  if (/kain/i.test(combined)) return "Kain";
  return "Atasan";
}

// Generate slug yang bersih
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/^hey joey!?\s*[-–—:]*\s*/i, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

// Format harga singkat (misal "Rp 163rb" atau "Rp 163.845")
function formatTagPrice(priceNum) {
  if (!priceNum || priceNum <= 0) return "Rp 0";
  if (priceNum >= 1000) {
    const thousands = Math.round(priceNum / 1000);
    return `Rp ${thousands}rb`;
  }
  return `Rp ${priceNum}`;
}

// Ekstrak bahan dari teks deskripsi / judul
function extractFabric(text = "") {
  const match = text.match(/(?:bahan|fabric|material)\s*[:=-]?\s*([a-zA-Z0-9\s/&,]+?)(?:\.|\n|;|$)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  if (/semiwool|semi wool/i.test(text)) return "Semiwool Premium";
  if (/tweed/i.test(text)) return "Tweed Lembut Bertekstur";
  if (/katun|cotton/i.test(text)) return "Katun Lembut Halus";
  if (/rajut|knit/i.test(text)) return "Rajut Halus Elastis";
  if (/rayon/i.test(text)) return "Rayon Halus Adem";
  if (/chinos/i.test(text)) return "Chinos Premium Halus";
  if (/pleats|pleated/i.test(text)) return "Pleated Crepe Lembut";
  if (/chiffon/i.test(text)) return "Chiffon Katun Lembut";
  return "";
}

// Parser sederhana CSV yang mendukung quoted string & newline
export function parseCSV(content) {
  const clean = content.replace(/^\uFEFF/, "");
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === "," || char === ";") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

// Ekstraktor jika input berupa file Excel (.xlsx) Shopee
function extractXLSX(filePath) {
  const pyScriptPath = path.join(__dirname, "parse_xlsx.py");
  const result = execSync(`python "${pyScriptPath}" "${filePath}"`, {
    encoding: "utf-8",
    maxBuffer: 25 * 1024 * 1024,
  });
  return JSON.parse(result);
}

// Main logic
export function parseShopeeData(filePath) {
  let rows = [];
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".xlsx") {
    rows = extractXLSX(filePath);
  } else {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    rows = parseCSV(rawContent);
  }

  if (!rows || rows.length === 0) {
    throw new Error("File kosong atau tidak valid: " + filePath);
  }

  // Cari index header yang berisi kolom nama/product
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const r = rows[i].map((c) => String(c).trim().toLowerCase());
    if (r.includes("nama produk") || r.includes("et_title_product_name") || r.includes("product name")) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) headerRowIndex = 0;

  const headers = rows[headerRowIndex].map((h) => String(h).trim().toLowerCase());

  const colId = headers.findIndex((h) => h.includes("kode") || h.includes("product_id") || h === "id");
  const colName = headers.findIndex((h) => h.includes("nama produk") || h.includes("product_name") || h === "name" || h === "nama");
  const colCat = headers.findIndex((h) => h.includes("kategori") || h.includes("category"));
  const colPrice = headers.findIndex((h) => h.includes("harga") || h.includes("price"));
  const colImage = headers.findIndex((h) => h.includes("foto sampul") || h.includes("cover") || h.includes("image") || h.includes("foto"));
  const colDesc = headers.findIndex((h) => h.includes("deskripsi") || h.includes("description"));

  const dataRows = rows.slice(headerRowIndex + 1);
  const parsedItems = [];
  const seenNames = new Set();

  for (const row of dataRows) {
    if (!row || row.length < 2) continue;

    const rawId = colId !== -1 ? String(row[colId] || "").trim() : "";
    const rawName = colName !== -1 ? String(row[colName] || "").trim() : "";
    
    // Filter baris boilerplate Shopee
    if (!rawName || rawName === "0" || rawName.length < 3) continue;
    if (/^(nama produk|et_title_|media_info|wajib|opsional|tidak dapat diubah|alasan gagal)/i.test(rawName)) continue;
    if (rawName.includes("Mohon masukkan") || rawName.includes("search_condition")) continue;
    // Pada file Shopee, ID produk adalah angka panjang (misal 58171233063)
    if (rawId && (!/^\d+$/.test(rawId) || rawId.length < 6)) continue;

    // Bersihkan nama produk
    const cleanName = rawName.replace(/^HEY JOEY!\s*[-–—:]*\s*/i, "").trim();
    if (seenNames.has(cleanName.toLowerCase())) continue;
    seenNames.add(cleanName.toLowerCase());

    const rawCat = colCat !== -1 ? String(row[colCat] || "").trim() : "";
    const rawPrice = colPrice !== -1 ? String(row[colPrice] || "").trim() : "";
    const rawImage = colImage !== -1 ? String(row[colImage] || "").trim() : "";
    const rawDesc = colDesc !== -1 ? String(row[colDesc] || "").trim() : "";

    const category = mapCategory(rawCat, rawName);

    // Parse harga angka: gunakan CSV -> atau KNOWN_SHOPEE_PRICES -> atau fallback kategori
    const cleanPriceStr = rawPrice.replace(/[^\d]/g, "");
    let priceNum = cleanPriceStr ? parseInt(cleanPriceStr, 10) : 0;
    if (priceNum <= 0 && KNOWN_SHOPEE_PRICES[rawId]) {
      priceNum = KNOWN_SHOPEE_PRICES[rawId];
    }
    if (priceNum <= 0) {
      priceNum = CATEGORY_DEFAULT_PRICE[category] || 195000;
    }

    // Shopee URL
    const shopeeUrl = rawId && /^\d+$/.test(rawId)
      ? `https://shopee.co.id/product/1937886628/${rawId}`
      : "https://shopee.co.id/the.joeyspace";

    // Variasi warna & gambar variasi (color_images)
    const colorImages = {};
    const colors = [];
    let colorway = "";
    const sizes = [];

    // Periksa kolom variasi
    for (let c = 0; c < row.length; c++) {
      const h = headers[c] || "";
      const val = String(row[c] || "").trim();
      if (!val) continue;

      if (h.includes("option_image") || h.includes("foto variasi")) {
        const optVal = String(row[c - 1] || "").trim();
        if (optVal && !optVal.startsWith("http") && !/^(warna|ukuran|size|color|nama variasi)/i.test(optVal)) {
          if (!colors.includes(optVal) && optVal.length < 35) {
            colors.push(optVal);
          }
          if (val.startsWith("http")) {
            colorImages[optVal] = val;
          }
        }
      } else if (h.includes("option_") || h.includes("opsi") || h.includes("nama variasi")) {
        if (!val.startsWith("http") && !/^(warna|ukuran|size|color|nama variasi)/i.test(val)) {
          if (!colors.includes(val) && val.length < 35) {
            colors.push(val);
          }
          const nextVal = String(row[c + 1] || "").trim();
          if (nextVal.startsWith("http")) {
            colorImages[val] = nextVal;
          }
        }
      }
    }

    if (colors.length > 0) {
      colorway = colors[0];
    } else {
      const colorMatch = cleanName.match(/\b(hitam|putih|navy|biru|krem|mocca|cappucino|pink|merah|abu|sage|greenday|maroon|lilac|denim|brown|cokelat)\b/i);
      if (colorMatch) colorway = colorMatch[1].charAt(0).toUpperCase() + colorMatch[1].slice(1).toLowerCase();
    }

    if (/freesize|all size|allsize/i.test(cleanName + " " + rawDesc)) {
      sizes.push("All Size (Fit to L)");
    } else if (/\b(s|m|l|xl)\b/i.test(cleanName)) {
      sizes.push("S", "M", "L");
    } else {
      sizes.push("All Size");
    }

    parsedItems.push({
      rawId,
      name: cleanName,
      rawCat,
      category,
      colorway,
      price: priceNum,
      front_img: rawImage || "/images/placeholder-product.png",
      shopee_url: shopeeUrl,
      colors,
      color_images: colorImages,
      sizes,
      description: rawDesc || `Koleksi resmi ${cleanName}. Potongan nyaman dan anggun khas HEY JOEY!. Tersedia di Shopee.`,
    });
  }

  return parsedItems;
}

// Format ke schema JSON resmi Hey-Joey
export function mapToHeyJoeySchema(items, startIndex = 11) {
  return items.map((item, idx) => {
    const seq = startIndex + idx;
    const numStr = String(seq).padStart(2, "0");
    const slug = generateSlug(item.name) || `produk-${numStr}`;
    const fabric = extractFabric(item.description + " " + item.name);

    const hasColorImages = item.color_images && Object.keys(item.color_images).length > 0;

    return {
      id: `prod-${numStr}`,
      slug: slug,
      number: numStr,
      name: item.name,
      category: item.category,
      colorway: item.colorway || "",
      price: item.price,
      tag_price: formatTagPrice(item.price),
      front_img: item.front_img,
      side_img: item.front_img,
      shopee_url: item.shopee_url,
      on_rack: false,
      is_new: true,
      colors: item.colors || [],
      ...(hasColorImages ? { color_images: item.color_images } : {}),
      sizes: item.sizes && item.sizes.length > 0 ? item.sizes : ["All Size"],
      fabric: fabric,
      fit: "",
      care_note: "",
      description: item.description,
    };
  });
}

// CLI Runner
const args = process.argv.slice(2);
const writeFlag = args.includes("--write");
const fileArg = args.find((a) => !a.startsWith("--"));

if (fileArg) {
  try {
    const rawItems = parseShopeeData(fileArg);
    console.log(`Berhasil membaca ${rawItems.length} produk unik dari: ${fileArg}`);

    // Baca target file untuk mengidentifikasi 10 produk rak eksisting
    const primaryTarget = TARGET_FILES[0];
    const currentData = JSON.parse(fs.readFileSync(primaryTarget, "utf-8"));
    
    // 10 produk pertama dengan on_rack: true WAJIB dijaga 100%
    const rackProducts = currentData.products.filter((p) => p.on_rack === true);
    console.log(`Mempertahankan ${rackProducts.length} produk eksisting pada rak gantung interaktif.`);

    // Buat daftar nama/id produk rak agar tidak terduplikasi
    const rackNames = new Set(rackProducts.map((p) => p.name.toLowerCase()));

    // Filter produk baru yang belum ada di rak
    const newItemsOnly = rawItems.filter((item) => {
      const lower = item.name.toLowerCase();
      for (const rName of rackNames) {
        if (rName.includes(lower) || lower.includes(rName)) return false;
      }
      return true;
    });

    const mapped = mapToHeyJoeySchema(newItemsOnly, 11);
    console.log(`\n=== CONTOH 1 OBJEK JSON HASIL MAPPING (ID: ${mapped[0]?.id}) ===`);
    console.log(JSON.stringify(mapped[0], null, 2));

    if (writeFlag) {
      console.log("\nMemperbarui file content.json...");
      for (const targetPath of TARGET_FILES) {
        if (!fs.existsSync(targetPath)) continue;
        const targetData = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
        
        // Simpan hanya 10 produk rak asli
        const originalRackItems = targetData.products.filter((p) => p.on_rack === true);
        
        // Gabungkan 10 produk rak + seluruh produk baru hasil import
        targetData.products = [...originalRackItems, ...mapped];
        
        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), "utf-8");
        console.log(`✓ Tersimpan: ${targetPath} (Total ${targetData.products.length} produk)`);
      }
      console.log("\nSukses sinkronisasi data katalog!");
    } else {
      console.log(`\nTotal produk yang akan diimport: ${mapped.length}`);
      console.log("Mode Dry-Run: Jalankan dengan flag --write untuk menyimpan ke file.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
