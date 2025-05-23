import xml.etree.ElementTree as ET
from math import ceil

# Configuration
INPUT_FILE = 'mfsitemap.xml'       # Your input sitemap file
OUTPUT_PREFIX = 'mfsitemap-'  # Output file prefix
URLS_PER_FILE = 10000            # Max URLs per sitemap file

# Namespace for sitemap schema
NAMESPACE = {
    'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9',
    'xsi': 'http://www.w3.org/2001/XMLSchema-instance'
}

# Register namespace for pretty writing
ET.register_namespace('', NAMESPACE['sm'])
ET.register_namespace('xsi', NAMESPACE['xsi'])

# Parse the original sitemap
tree = ET.parse(INPUT_FILE)
root = tree.getroot()

urls = root.findall('sm:url', NAMESPACE)

print(f"Found {len(urls)} URLs in the sitemap.")

# Fix URLs: replace & with &amp;
for url in urls:
    loc = url.find('sm:loc', NAMESPACE)
    # if loc is not None and '&' in loc.text and '&amp;' not in loc.text:
    #     loc.text = loc.text.replace('&', '&amp;')

# Split into chunks of URLS_PER_FILE
total_files = ceil(len(urls) / URLS_PER_FILE)

for i in range(total_files):
    start_index = i * URLS_PER_FILE
    end_index = min((i + 1) * URLS_PER_FILE, len(urls))

    new_root = ET.Element(root.tag, root.attrib)
    new_root.extend(urls[start_index:end_index])

    new_tree = ET.ElementTree(new_root)

    output_file = f"{OUTPUT_PREFIX}{i+1}.xml"
    new_tree.write(output_file, encoding='utf-8', xml_declaration=True, method='xml')
    print(f"Wrote {end_index - start_index} URLs to {output_file}")