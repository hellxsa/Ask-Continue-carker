const fs = require('fs');
const path = require('path');

console.log('=== Ask Continue 2.9.1 增强破解工具 ===\n');

// 配置
const VERSION = '2.9.1';
const EXTRACT_DIR = 'extracted_291';
const ACTIVATION_YEARS = 100;

// 要尝试的函数位置（基于经验）
const FUNCTION_INDICES = [7, 8, 9, 10, 11]; // 第8、9、10、11、12个函数

// 步骤1: 读取 extension.js
console.log('步骤1: 读取 extension.js...');
const extensionPath = path.join(EXTRACT_DIR, 'extension', 'out', 'extension.js');
let code = fs.readFileSync(extensionPath, 'utf8');

// 步骤2: 识别函数前缀
console.log('\n步骤2: 识别函数前缀...');
const prefixMatch = code.match(/function\s+(_[a-z0-9]+_0x)[a-f0-9]+/);
if (!prefixMatch) {
  console.log('❌ 未找到函数前缀');
  process.exit(1);
}
const prefix = prefixMatch[1];
console.log(`函数前缀: ${prefix}`);

// 步骤3: 查找所有函数
console.log('\n步骤3: 查找所有混淆函数...');
const funcPattern = new RegExp(`function\\s+(${prefix}[a-f0-9]+)\\s*\\([^)]*\\)\\s*{`, 'g');
const functions = [];
let match;
while ((match = funcPattern.exec(code)) !== null) {
  functions.push(match[1]);
}
console.log(`找到 ${functions.length} 个函数`);

// 步骤4: 修改多个关键函数
console.log('\n步骤4: 修改关键函数...');
let modifiedCount = 0;
for (const index of FUNCTION_INDICES) {
  if (index < functions.length) {
    const funcName = functions[index];
    console.log(`  修改第${index + 1}个函数: ${funcName}`);
    
    const crackCode = `
  console.log('[Crack] ${funcName} called - forcing isActivated=true');
  return {
    isActivated: true,
    activated: true,
    valid: true,
    success: true,
    activationCode: 'CRACKED-${ACTIVATION_YEARS}YEARS',
    expiresAt: Date.now() + ${ACTIVATION_YEARS}*365*24*60*60*1000
  };`;
    
    const pattern = new RegExp(`(function\\s+${funcName}\\s*\\([^)]*\\)\\s*{)`, 'g');
    code = code.replace(pattern, `$1${crackCode}`);
    modifiedCount++;
  }
}

fs.writeFileSync(extensionPath, code);
console.log(`✅ 已修改 ${modifiedCount} 个函数`);

// 步骤5: 替换 activation.js
console.log('\n步骤5: 替换 activation.js...');
const activationPath = path.join(EXTRACT_DIR, 'extension', 'out', 'activation.js');
const newActivationCode = `'use strict';

const activationState = {
  isActivated: true,
  activated: true,
  valid: true,
  success: true,
  activationCode: 'CRACKED-PERMANENT-LICENSE-${ACTIVATION_YEARS}YEARS',
  activatedAt: Date.now(),
  expiresAt: Date.now() + ${ACTIVATION_YEARS} * 365 * 24 * 60 * 60 * 1000,
  deviceFingerprint: 'cracked-device'
};

async function activatePlugin(context) {
  console.log('[Crack] activatePlugin called - ${ACTIVATION_YEARS} years license');
  return { success: true, isActivated: true, ...activationState };
}

function startVerifyInterval() {
  console.log('[Crack] startVerifyInterval - skipped');
}

async function checkActivation() {
  console.log('[Crack] checkActivation called - ${ACTIVATION_YEARS} years license');
  return activationState;
}

function isActivated() {
  console.log('[Crack] isActivated called - ${ACTIVATION_YEARS} years license');
  return true;
}

module.exports = {
  activatePlugin,
  startVerifyInterval,
  checkActivation,
  isActivated,
  ...activationState
};
`;

fs.writeFileSync(activationPath, newActivationCode);
console.log('✅ activation.js 已替换');

// 步骤6: 验证语法
console.log('\n步骤6: 验证语法...');
try {
  const { execSync } = require('child_process');
  execSync(`node -c "${extensionPath}"`, { stdio: 'pipe' });
  execSync(`node -c "${activationPath}"`, { stdio: 'pipe' });
  console.log('✅ 语法验证通过');
} catch (e) {
  console.log('❌ 语法错误');
  process.exit(1);
}

console.log('\n✅ 增强破解完成！');
console.log('\n下一步:');
console.log('1. 重新打包为 VSIX');
console.log('2. 卸载旧版插件');
console.log('3. 重启 Windsurf');
console.log('4. 安装破解版');
console.log('5. 再次重启 Windsurf');
console.log('\n修改的函数位置:', FUNCTION_INDICES.map(i => `第${i+1}个`).join(', '));
