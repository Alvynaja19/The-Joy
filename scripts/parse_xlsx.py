import zipfile
import xml.etree.ElementTree as ET
import json
import sys

def main():
    if len(sys.argv) < 2:
        print("[]")
        return
    xlsx_path = sys.argv[1]
    with zipfile.ZipFile(xlsx_path) as z:
        sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
        strings = [(elem.text or '') for elem in sst.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')]
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for r in sheet.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            cells = []
            for c in r.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                t = c.get('t')
                val = ''
                if v is not None and v.text is not None:
                    if t == 's':
                        idx = int(v.text)
                        val = strings[idx] if idx < len(strings) else ''
                    else:
                        val = v.text
                cells.append(val)
            rows.append(cells)
        print(json.dumps(rows))

if __name__ == '__main__':
    main()
