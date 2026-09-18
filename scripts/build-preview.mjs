import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
let html=await readFile(path.join(root,'index.html'),'utf8');
const style=await readFile(path.join(root,'css/style.css'),'utf8');
html=html.replace('<link rel="stylesheet" href="css/style.css">',()=>`<style>\n${style}\n</style>`);
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)];
for(const match of scripts){const js=await readFile(path.join(root,match[1]),'utf8');html=html.replace(match[0],()=>`<script>\n${js.replace(/<\/script/gi,'<\\/script')}\n</script>`);}
const destination=process.argv[2]||path.join(root,'82-WISHES-preview.html');
await writeFile(destination,html);
console.log(destination);
