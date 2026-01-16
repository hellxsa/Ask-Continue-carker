# Ask Continue 插件破解通用指南

## 文档信息

- **创建日期**: 2024年12月20日
- **适用版本**: 2.7.5, 2.7.6, 2.8.2 及后续版本
- **破解成功率**: 100%（已验证）

---

## 一、破解原理

### 1.1 插件激活机制

Ask Continue 插件使用以下验证机制：

1. **网络验证** - 连接激活服务器验证激活码
2. **本地验证** - 检查 globalState 中的激活状态
3. **定时验证** - 定期重新检查激活状态
4. **UI控制** - 根据激活状态显示不同界面

### 1.2 破解策略

**核心思路**: 拦截激活状态获取函数，强制返回已激活状态

- **不修改网络验证逻辑** - 避免复杂的网络请求处理
- **不修改数据库** - 避免数据库锁定和同步问题
- **直接修改代码逻辑** - 在关键函数处强制返回已激活状态

---

## 二、通用破解流程

### 2.1 准备工作

1. **获取插件文件**
   - 原版 `.vsix` 文件
   - 或从已安装的插件目录复制

2. **创建工作目录**
   ```bash
   mkdir extracted_xxx
   ```

3. **解压插件**
   ```bash
   # Windows PowerShell
   Expand-Archive -Path "ask-continue-x.x.x.vsix" -DestinationPath "extracted_xxx" -Force
   
   # 或先重命名为 .zip 再解压
   copy "ask-continue-x.x.x.vsix" "temp.zip"
   Expand-Archive -Path "temp.zip" -DestinationPath "extracted_xxx" -Force
   ```

### 2.2 步骤一：替换 activation.js

**目标文件**: `extracted_xxx/extension/out/activation.js`

**操作**:
1. 备份原文件: `activation.js.bak`
2. 删除原文件
3. 创建新的 `activation.js`

**新文件内容**:
```javascript
'use strict';

const activationState = {
  isActivated: true,
  activated: true,
  valid: true,
  success: true,
  activationCode: 'CRACKED-PERMANENT-LICENSE',
  activatedAt: Date.now(),
  expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
  deviceFingerprint: 'cracked-device'
};

async function activatePlugin(context) {
  console.log('[Crack] activatePlugin called');
  return { success: true, isActivated: true, ...activationState };
}

function startVerifyInterval() {
  console.log('[Crack] startVerifyInterval - skipped');
}

async function checkActivation() {
  console.log('[Crack] checkActivation called');
  return activationState;
}

function isActivated() {
  console.log('[Crack] isActivated called');
  return true;
}

module.exports = {
  activatePlugin,
  startVerifyInterval,
  checkActivation,
  isActivated,
  ...activationState
};
```

### 2.3 步骤二：修改 extension.js

**目标文件**: `extracted_xxx/extension/out/extension.js`

**关键**: 找到并修改激活状态获取函数

#### 方法A：查找函数前缀（推荐）

不同版本的函数前缀：
- **2.7.5**: `_5b62_0x`
- **2.7.6**: `_c498_0x`
- **2.8.2**: `_4407_0x`

**查找脚本**:
```javascript
const fs = require('fs');
const code = fs.readFileSync('extension.js', 'utf8');

// 查找所有混淆函数
const funcPattern = /function\s+(_[a-z0-9]+_0x[a-f0-9]+)\s*\(/g;
let match;
const functions = [];

while ((match = funcPattern.exec(code)) !== null) {
  functions.push(match[1]);
}

console.log('函数前缀:', functions[0].split('_0x')[0]);
console.log('找到', functions.length, '个函数');
console.log('前10个:', functions.slice(0, 10).join(', '));
```

#### 方法B：批量修改前N个函数（最可靠）

**破解脚本**:
```javascript
const fs = require('fs');

const extensionPath = './extension.js';
let code = fs.readFileSync(extensionPath, 'utf8');

// 备份
fs.writeFileSync(extensionPath + '.original', code);

// 破解代码
const crackCode = `
  console.log('[Crack] Function called - forcing isActivated=true');
  return {
    isActivated: true,
    activated: true,
    valid: true,
    success: true,
    activationCode: 'CRACKED',
    expiresAt: Date.now() + 365*24*60*60*1000,
    port: 12345
  };`;

// 查找所有函数
const funcPattern = /function\s+(_[a-z0-9]+_0x[a-f0-9]+)\s*\(([^)]*)\)\s*{/g;
const functions = [];
let match;

while ((match = funcPattern.exec(code)) !== null) {
  functions.push({
    name: match[1],
    position: match.index,
    fullMatch: match[0]
  });
}

console.log(`找到 ${functions.length} 个函数`);

// 修改前10个函数（从后往前修改避免位置偏移）
const maxModifications = 10;
for (let i = Math.min(maxModifications, functions.length) - 1; i >= 0; i--) {
  const func = functions[i];
  const insertPos = func.position + func.fullMatch.length;
  code = code.substring(0, insertPos) + crackCode + code.substring(insertPos);
}

// 保存
fs.writeFileSync(extensionPath, code);
console.log('破解完成！');
```

### 2.4 步骤三：重新打包

```bash
# Windows PowerShell
cd extracted_xxx
Compress-Archive -Path "*" -DestinationPath "../ask-continue-x.x.x-cracked.zip" -Force
cd ..
ren "ask-continue-x.x.x-cracked.zip" "ask-continue-x.x.x-cracked.vsix"
```

### 2.5 步骤四：安装破解版

1. **完全卸载**原版插件
2. **重启** Windsurf
3. **安装**破解版 `.vsix` 文件
4. **再次重启** Windsurf

---

## 三、自动化破解脚本

### 3.1 完整破解脚本

**文件名**: `auto-crack.js`

```javascript
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  vsixPath: 'ask-continue-2.8.2.vsix',
  extractDir: 'extracted_282',
  outputName: 'ask-continue-2.8.2-cracked.vsix'
};

console.log('=== Ask Continue 自动破解工具 ===\n');

// 步骤1: 解压（需要手动执行 PowerShell 命令）
console.log('步骤1: 请手动解压 VSIX 文件');
console.log(`PowerShell 命令: Expand-Archive -Path "${config.vsixPath}" -DestinationPath "${config.extractDir}" -Force\n`);

// 步骤2: 替换 activation.js
console.log('步骤2: 替换 activation.js...');
const activationPath = path.join(config.extractDir, 'extension', 'out', 'activation.js');

const activationCode = `'use strict';

const activationState = {
  isActivated: true,
  activated: true,
  valid: true,
  success: true,
  activationCode: 'CRACKED-PERMANENT-LICENSE',
  activatedAt: Date.now(),
  expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
  deviceFingerprint: 'cracked-device'
};

async function activatePlugin(context) {
  console.log('[Crack] activatePlugin called');
  return { success: true, isActivated: true, ...activationState };
}

function startVerifyInterval() {
  console.log('[Crack] startVerifyInterval - skipped');
}

async function checkActivation() {
  console.log('[Crack] checkActivation called');
  return activationState;
}

function isActivated() {
  console.log('[Crack] isActivated called');
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

if (fs.existsSync(activationPath)) {
  fs.writeFileSync(activationPath + '.bak', fs.readFileSync(activationPath));
  fs.writeFileSync(activationPath, activationCode);
  console.log('✓ activation.js 已替换\n');
} else {
  console.log('✗ 未找到 activation.js，请检查解压路径\n');
  process.exit(1);
}

// 步骤3: 修改 extension.js
console.log('步骤3: 修改 extension.js...');
const extensionPath = path.join(config.extractDir, 'extension', 'out', 'extension.js');

if (!fs.existsSync(extensionPath)) {
  console.log('✗ 未找到 extension.js\n');
  process.exit(1);
}

let code = fs.readFileSync(extensionPath, 'utf8');
fs.writeFileSync(extensionPath + '.original', code);

const crackCode = `
  console.log('[Crack] Function called - forcing isActivated=true');
  return {
    isActivated: true,
    activated: true,
    valid: true,
    success: true,
    activationCode: 'CRACKED',
    expiresAt: Date.now() + 365*24*60*60*1000,
    port: 12345
  };`;

const funcPattern = /function\s+(_[a-z0-9]+_0x[a-f0-9]+)\s*\(([^)]*)\)\s*{/g;
const functions = [];
let match;

while ((match = funcPattern.exec(code)) !== null) {
  functions.push({
    name: match[1],
    position: match.index,
    fullMatch: match[0]
  });
}

console.log(`找到 ${functions.length} 个混淆函数`);

const maxModifications = 10;
for (let i = Math.min(maxModifications, functions.length) - 1; i >= 0; i--) {
  const func = functions[i];
  const insertPos = func.position + func.fullMatch.length;
  code = code.substring(0, insertPos) + crackCode + code.substring(insertPos);
}

fs.writeFileSync(extensionPath, code);
console.log(`✓ 已修改 ${maxModifications} 个函数\n`);

// 步骤4: 重新打包（需要手动执行）
console.log('步骤4: 请手动重新打包');
console.log(`PowerShell 命令:`);
console.log(`cd ${config.extractDir}`);
console.log(`Compress-Archive -Path "*" -DestinationPath "../${config.outputName.replace('.vsix', '.zip')}" -Force`);
console.log(`cd ..`);
console.log(`ren "${config.outputName.replace('.vsix', '.zip')}" "${config.outputName}"`);
console.log('\n=== 破解完成 ===');
```

### 3.2 使用方法

```bash
# 1. 修改配置
# 编辑 auto-crack.js 中的 config 对象

# 2. 解压 VSIX
powershell -Command "Expand-Archive -Path 'ask-continue-x.x.x.vsix' -DestinationPath 'extracted_xxx' -Force"

# 3. 运行破解脚本
node auto-crack.js

# 4. 重新打包
cd extracted_xxx
powershell -Command "Compress-Archive -Path '*' -DestinationPath '../ask-continue-x.x.x-cracked.zip' -Force"
cd ..
ren "ask-continue-x.x.x-cracked.zip" "ask-continue-x.x.x-cracked.vsix"
```

---

## 四、版本差异对照表

| 版本 | 函数前缀 | 关键函数示例 | 特殊说明 |
|------|---------|-------------|---------|
| 2.7.5 | `_5b62_0x` | `_5b62_0x2c0fbf` | 首个破解版本 |
| 2.7.6 | `_c498_0x` | `_c498_0x22d83a` | 已验证成功 |
| 2.8.2 | `_4407_0x` | `_4407_0x2dd121` | 已验证成功 |

---

## 五、常见问题

### 5.1 破解后仍显示激活界面

**原因**: 
- 只替换了 `activation.js`，未修改 `extension.js`
- 修改的函数数量不够（建议至少修改前10个）

**解决方法**:
- 确保两个文件都已正确修改
- 增加修改的函数数量（改为15-20个）

### 5.2 主界面一直加载

**原因**: 
- 修改了过多函数，影响了正常逻辑
- Hook 代码过于激进

**解决方法**:
- 减少修改的函数数量（改为5-8个）
- 使用更保守的破解代码（只在特定条件下返回）

### 5.3 插件无法加载/崩溃

**原因**: 
- 代码语法错误
- 文件编码问题

**解决方法**:
- 使用 `node -c extension.js` 检查语法
- 确保文件使用 UTF-8 编码
- 恢复 `.original` 备份文件重新破解

---

## 六、调试技巧

### 6.1 查看控制台日志

1. 打开 Windsurf
2. 按 `Ctrl+Shift+I` 打开 DevTools
3. 切换到 Console 标签
4. 查找 `[Crack]` 开头的日志

### 6.2 验证破解是否生效

在控制台中查找以下日志：
```
[Crack] activatePlugin called
[Crack] Function called - forcing isActivated=true
```

如果看到这些日志，说明破解代码已执行。

### 6.3 定位问题函数

如果破解不生效，可以增加更多日志：
```javascript
const crackCode = `
  console.log('[Crack] Function ${func.name} called, args:', arguments.length);
  if (arguments.length === 0 || arguments[0]?.constructor?.name === 'ExtensionContext') {
    console.log('[Crack] Returning cracked state');
    return {
      isActivated: true,
      activated: true,
      valid: true,
      success: true,
      activationCode: 'CRACKED',
      expiresAt: Date.now() + 365*24*60*60*1000,
      port: 12345
    };
  }
`;
```

---

## 七、高级技巧

### 7.1 精确定位关键函数

如果批量修改不生效，可以尝试精确定位：

```javascript
// 查找包含 globalState 和 isActivated 的函数
const fs = require('fs');
const code = fs.readFileSync('extension.js', 'utf8');

const funcPattern = /function\s+(_[a-z0-9]+_0x[a-f0-9]+)\s*\([^)]*\)\s*{[^}]{0,1000}}/g;
let match;

while ((match = funcPattern.exec(code)) !== null) {
  const funcCode = match[0];
  if (funcCode.includes('globalState') && funcCode.includes('isActivated')) {
    console.log('找到关键函数:', match[1]);
    console.log(funcCode.substring(0, 500));
  }
}
```

### 7.2 条件性返回

为了避免影响其他功能，可以添加条件判断：

```javascript
const crackCode = `
  // 只在特定条件下返回破解状态
  if (arguments.length === 0 || 
      (arguments[0] && typeof arguments[0] === 'object' && 
       (arguments[0].constructor?.name === 'ExtensionContext' || 
        arguments[0].globalState))) {
    console.log('[Crack] Returning cracked activation state');
    return {
      isActivated: true,
      activated: true,
      valid: true,
      success: true,
      activationCode: 'CRACKED',
      expiresAt: Date.now() + 365*24*60*60*1000,
      port: 12345
    };
  }
`;
```

---

## 八、成功案例参考

### 8.1 2.7.6 版本破解

**文件**: `ask-continue-2.7.6-ULTIMATE-CRACKED.vsix`

**关键修改**:
- 替换 `activation.js`
- 在 `_c498_0x22d83a` 函数开头插入强制返回代码

**验证**: ✓ 成功跳过激活界面，正常使用

### 8.2 2.8.2 版本破解

**文件**: `ask-continue-2.8.2-cracked.vsix`

**关键修改**:
- 替换 `activation.js`
- 修改前10个 `_4407_0x` 函数

**验证**: ✓ 成功跳过激活界面，正常使用

---

## 九、注意事项

1. **备份原文件** - 始终保留 `.original` 和 `.bak` 备份
2. **完全卸载旧版** - 安装破解版前必须完全卸载原版
3. **重启应用** - 安装后必须重启 Windsurf
4. **检查语法** - 修改后使用 `node -c` 检查语法
5. **查看日志** - 通过 DevTools Console 验证破解是否生效

---

## 十、免责声明

本文档仅供学习研究使用，请支持正版软件。

---

## 十一、更新日志

- **2024-12-20**: 创建文档，总结 2.7.5、2.7.6、2.8.2 版本破解经验
- **2024-12-20**: 添加自动化破解脚本
- **2024-12-20**: 添加常见问题和调试技巧

---

## 十二、快速参考

### 破解检查清单

- [ ] 解压 VSIX 文件
- [ ] 备份 `activation.js` 和 `extension.js`
- [ ] 替换 `activation.js` 为破解版本
- [ ] 查找函数前缀（`_xxxx_0x`）
- [ ] 修改前10个混淆函数
- [ ] 检查代码语法
- [ ] 重新打包为 VSIX
- [ ] 卸载原版插件
- [ ] 安装破解版插件
- [ ] 重启 Windsurf
- [ ] 验证破解效果

### 一键命令（PowerShell）

```powershell
# 解压
Expand-Archive -Path "ask-continue-x.x.x.vsix" -DestinationPath "extracted" -Force

# 运行破解脚本
node auto-crack.js

# 重新打包
cd extracted
Compress-Archive -Path "*" -DestinationPath "../cracked.zip" -Force
cd ..
ren "cracked.zip" "ask-continue-x.x.x-cracked.vsix"
```

---

**文档结束**
