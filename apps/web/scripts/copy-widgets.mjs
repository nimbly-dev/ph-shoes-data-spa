import { promises as fs } from 'fs';
import path from 'path';

// When run from workspace root, cwd is /repo, when run from apps/web, cwd is /repo/apps/web
const isWorkspaceRoot = process.cwd().endsWith('/repo') || !process.cwd().includes('/apps/');
const projectRoot = isWorkspaceRoot ? process.cwd() : path.resolve(process.cwd(), '../..');
const widgetsDir = path.resolve(projectRoot, 'packages', 'widgets');
const distWidgetsDir = isWorkspaceRoot 
  ? path.resolve(projectRoot, 'apps', 'web', 'dist', 'widgets')
  : path.resolve(process.cwd(), 'dist', 'widgets');

async function fileExists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}

async function copyWidgets() {
  await fs.mkdir(distWidgetsDir, { recursive: true });
  const entries = await fs.readdir(widgetsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const widgetDist = path.join(widgetsDir, entry.name, 'dist');
    if (!(await fileExists(widgetDist))) continue;
    const files = await fs.readdir(widgetDist);
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      const src = path.join(widgetDist, file);
      const dest = path.join(distWidgetsDir, file);
      await fs.copyFile(src, dest);
    }
  }
}

try {
  await copyWidgets();
  console.log('Copied widget bundles into dist/widgets');
} catch (err) {
  console.warn('Failed to copy widget bundles', err);
}
