import fs from 'fs';
import path from 'path';

const dir = path.resolve('src/i18n/messages');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

// ---------------- 键命名嵌套的冲突检查 ----------------

// 加载文件并提取键
function loadKeys(file) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  try {
    const obj = JSON.parse(content);
    return Object.keys(obj);
  } catch (e) {
    console.error(`解析失败 ${file}:`, e.message);
    return [];
  }
}

// 加载所有文件的键
const all = {};
for (const f of files) {
  all[f] = loadKeys(f);
}

// 查找冲突的键
function findConflicts(keys) {
  const conflicts = [];
  for (const k of keys) {
    // 检查是否有其他键以该键作为前缀加上 '.'
    const prefix = k + '.';
    for (const other of keys) {
      if (other !== k && other.startsWith(prefix)) {
        conflicts.push({ parent: k, child: other });
      }
    }
  }
  return conflicts;
}

console.log('\n---------------- 键命名嵌套的冲突检查 ----------------');

// 输出冲突
let any = false;
for (const file of Object.keys(all)) {
  const keys = all[file];
  const conflicts = findConflicts(keys);
  if (conflicts.length) {
    any = true;
    console.log(`该文件有冲突： ${file}:`);
    for (const c of conflicts) {
      console.log(`  ${c.parent}  -- 有嵌套子集 -->  ${c.child}`);
    }
    console.log('');
  }
}

if (!any) {
  console.log('未发现冲突。');
}

// ---------------- 中英文配对检查 ----------------

// 如果同时存在中英文文件，检查两者键是否配对
const enFile = 'en.json';
const zhFile = 'zh.json';
if (all[enFile] && all[zhFile]) {
  const enKeys = new Set(all[enFile]);
  const zhKeys = new Set(all[zhFile]);
  const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k));
  const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k));

  console.log('\n---------------- 中英文配对检查 ----------------');
  if (missingInEn.length || missingInZh.length) {
    any = true;
    console.log('有不匹配的键：');
    if (missingInEn.length) {
      console.log(`  存在 ${zhFile} 但不存在 ${enFile}:`);
      for (const k of missingInEn) console.log(`    ${k}`);
    }
    if (missingInZh.length) {
      console.log(`  存在 ${enFile} 但不存在 ${zhFile}:`);
      for (const k of missingInZh) console.log(`    ${k}`);
    }
    console.log('');
  } else {
    console.log('比对完成，key都是配对的。');
  }
} else {
  // 如果没有同时存在，则跳过配对检查
  console.log('没找到en.json 或 zh.json，跳过配对检查。');
}



// ---------------- 未使用的 key 检测 ----------------
// 简单策略：遍历 src 目录的代码文件，排除 i18n/messages，自然字符串包含即视为使用。
// 若未来需要提升准确度，可改为解析 AST，匹配 t('xxx') 或 useTranslations().

// const enableUnused = process.argv.includes('--unused');
const SRC_ROOT = path.resolve('src');
  const EXCLUDE_DIRS = new Set([
    path.join(SRC_ROOT, 'i18n', 'messages'), // 排除翻译源文件避免误判
  ]);
  const VALID_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.md']);

  function collectFiles(dirPath) {
    let results = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dirPath, ent.name);
      if (ent.isDirectory()) {
        if (EXCLUDE_DIRS.has(full) || ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
        results = results.concat(collectFiles(full));
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name);
        if (VALID_EXT.has(ext)) results.push(full);
      }
    }
    return results;
  }

  function buildContentIndex(files) {
    const idx = [];
    for (const f of files) {
      try {
        const text = fs.readFileSync(f, 'utf8');
        idx.push({ file: f, text });
      } catch (e) {
        console.warn('读取失败:', f, e.message);
      }
    }
    return idx;
  }

  // 合并所有语言的 key（已有缺失比对，故这里做并集）
  const allKeys = Array.from(new Set(Object.values(all).flat()));
  const sourceFiles = collectFiles(SRC_ROOT);
  const contentIndex = buildContentIndex(sourceFiles);

  const used = new Set();
  // 记录数字后缀子项分组: root -> [children]
  const numericGroups = new Map();
  for (const k of allKeys) {
    // 简单包含匹配；考虑到 key 中有点号，误报概率较低。
    const needle = k;
    let found = false;
    for (const { text } of contentIndex) {
      if (text.includes(needle)) {
        found = true;
        break;
      }
    }
    if (found) used.add(k);

    // 如果最后一段是纯数字，则加入分组，稍后根据前缀整体使用情况兜底
    const parts = k.split('.');
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      const root = parts.slice(0, -1).join('.');
      if (!numericGroups.has(root)) numericGroups.set(root, []);
      numericGroups.get(root).push(k);
    }
  }

  // 前缀兜底策略：如果某个 root 存在于源码文本（比如通过数组映射动态拼接 root + index），则认为其全部数字后缀子项已使用
  if (numericGroups.size) {
    for (const [root, children] of numericGroups.entries()) {
      // 查找 "root." 出现即可（避免匹配单词内，通过直接包含）
      const pattern = root + '.'; // 动态使用通常会出现 root + '.' + idx
      let rootFound = false;
      for (const { text } of contentIndex) {
        if (text.includes(pattern) || text.includes(root)) { // second condition宽松，可按需收紧
          rootFound = true;
          break;
        }
      }
      if (rootFound) {
        for (const child of children) used.add(child);
      }
    }
  }

  const unused = allKeys.filter((k) => !used.has(k));
  console.log('\n---------------- 未使用的 i18n key 检测 ----------------');
  console.log(`扫描文件数: ${sourceFiles.length}，总 key 数: ${allKeys.length}`);
  if (unused.length === 0) {
    console.log('所有 key 均被引用。');
  } else {
    console.log(`未使用的 key (${unused.length}):`);
    for (const k of unused) console.log('  ' + k);
  }
  console.log('---------------------------------------------------------');
