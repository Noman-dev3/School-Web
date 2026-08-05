const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('grep -rl "revalidatePath" src/app/admin/').toString().split('\n').filter(Boolean);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it's already using useRouter
    let hasUseRouter = content.includes('useRouter');
    
    // Replace import
    if (!hasUseRouter) {
        content = content.replace(/import\s+{\s*revalidatePath\s*}\s+from\s+['"]next\/cache['"]/, 'import { useRouter } from "next/navigation"');
    } else {
        content = content.replace(/import\s+{\s*revalidatePath\s*}\s+from\s+['"]next\/cache['"]\n?/g, '');
    }
    
    // Inject const router = useRouter() if not exists
    if (!content.includes('const router = useRouter()') && !content.includes('const router = useRouter')) {
        // Find the component function declaration
        const componentRegex = /export (?:default )?(?:async )?function ([A-Za-z0-9_]+)\([^)]*\) {/g;
        content = content.replace(componentRegex, (match) => {
            return match + '\n  const router = useRouter();';
        });
    }

    // Replace revalidatePath(...) with router.refresh()
    content = content.replace(/revalidatePath\([^)]+\);?/g, 'router.refresh();');
    
    fs.writeFileSync(file, content);
}
console.log('Fixed files:', files.length);
