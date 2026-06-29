import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', function(filepath) {
    if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
        let content = fs.readFileSync(filepath, 'utf8');
        let newContent = content.replace(/text-slate-[3456]00/g, 'text-black')
                               .replace(/text-gray-[3456]00/g, 'text-black');
        if (content !== newContent) {
            fs.writeFileSync(filepath, newContent, 'utf8');
            console.log(`Updated ${filepath}`);
        }
    }
});
