# Mageos Hyva AI eCommerce 项目结构分析

## 📋 项目概览

**项目名称**: Mage-OS + Hyvä 开发环境 (带AI功能)  
**平台版本**: Mage-OS 3.0 / Magento 2.4.9  
**主题**: Hyvä  
**开发环境**: GitHub Codespaces  
**技术栈**: PHP 8.5-FPM + Nginx + MariaDB 11.4 + OpenSearch 2.19.2 + Valkey 8

---

## 🏗️ 完整项目结构

```
mageos-hyva-ai-ecommerce/
├── 📁 app/                          # 应用程序核心代码
│   ├── autoload.php                 # 自动加载配置
│   ├── bootstrap.php                # 应用启动引导
│   ├── design/                      # 设计文件
│   │   ├── adminhtml/               # 后台管理主题
│   │   └── frontend/                # 前台主题（包括Hyvä）
│   └── etc/                         # 配置文件
│       ├── db_schema.xml            # 数据库架构定义
│       ├── di.xml                   # 依赖注入配置
│       ├── NonComposerComponentRegistration.php
│       ├── registration_globlist.php
│       └── vendor_path.php
│
├── 📁 bin/                          # 可执行脚本
│   └── magento                      # Magento CLI命令入口
│
├── 📁 dev/                          # 开发工具和测试
│   ├── tests/                       # 测试套件
│   │   ├── acceptance/              # 验收测试
│   │   ├── api-functional/          # API功能测试
│   │   ├── integration/             # 集成测试
│   │   ├── unit/                    # 单元测试
│   │   ├── js/                      # JavaScript测试
│   │   ├── setup-integration/       # 设置集成测试
│   │   ├── static/                  # 静态测试
│   │   ├── varnish/                 # Varnish缓存测试
│   │   └── utils/                   # 测试工具函数
│   └── tools/                       # 开发工具
│       ├── bootstrap.php
│       ├── dynamicReturnTypeMeta.json
│       └── grunt/                   # Grunt自动化工具配置
│
├── 📁 generated/                    # 生成的代码（自动生成，不提交）
│   └── （由系统自动生成）
│
├── 📁 lib/                          # 库文件
│   ├── internal/                    # 内部库
│   │   ├── GnuFreeFont/            # 字体库
│   │   └── ...                      # 其他内部库
│   └── web/                         # Web库
│
├── 📁 pub/                          # 公共入口点
│   ├── index.php                    # 前台应用入口
│   ├── static.php                   # 静态文件处理
│   ├── get.php                      # 获取资源文件
│   ├── cron.php                     # 定时任务入口
│   ├── health_check.php             # 健康检查
│   ├── media/                       # 媒体文件目录
│   ├── static/                      # 静态资源（CSS、JS、图片）
│   ├── opt/                         # 优化资源
│   └── errors/                      # 错误页面
│
├── 📁 setup/                        # 设置和安装脚本
│   ├── index.php                    # 设置向导入口
│   ├── phpunit.xml                  # PHPUnit配置
│   ├── config/                      # 设置配置
│   ├── performance-toolkit/         # 性能测试工具
│   ├── pub/                         # 设置公共文件
│   ├── src/                         # 设置源代码
│   ├── tests/                       # 设置测试
│   └── view/                        # 设置向导模板
│
├── 📁 var/                          # 可变数据目录（不提交）
│   └── （缓存、日志、会话等动态数据）
│
├── 📁 vendor/                       # Composer依赖
│   ├── autoload.php                 # Composer自动加载
│   ├── mage-os/                     # Mage-OS官方模块
│   ├── symfony/                     # Symfony组件
│   ├── laravel/                     # Laravel工具
│   ├── google-gemini-php/           # Google Gemini AI
│   ├── openai-php/                  # OpenAI SDK
│   └── ...                          # 其他第三方库
│
├── 📁 phpserver/                    # PHP内置服务器
│   ├── README.md
│   └── router.php                   # 路由配置
│
├── 📁 .devcontainer/                # GitHub Codespaces配置
│   └── scripts/                     # 启动脚本
│
├── 🔧 配置文件
│   ├── composer.json                # PHP依赖配置
│   ├── composer.lock                # 依赖锁定文件
│   ├── package.json.sample          # Node.js依赖示例
│   ├── package.json                 # Node.js依赖（实际）
│   ├── Gruntfile.js.sample          # Grunt配置示例
│   ├── grunt-config.json.sample     # Grunt详细配置示例
│   ├── nginx.conf.sample            # Nginx配置示例
│   ├── auth.json.sample             # Composer认证示例
│   ├── .php-cs-fixer.dist.php       # PHP代码风格配置
│   ├── .htaccess.sample             # Apache配置示例
│   └── .htaccess                    # Apache配置
│
└── 📄 文档文件
    ├── README.md                    # 项目说明
    ├── CHANGELOG.md                 # 变更日志
    ├── SECURITY.md                  # 安全政策
    ├── LICENSE.txt                  # OSL 3.0 许可证
    ├── LICENSE_AFL.txt              # AFL 3.0 许可证
    ├── COPYING.txt                  # 版权说明
    └── .editorconfig                # 编辑器配置
```

---

## 📦 核心技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| **PHP** | 8.5-FPM | 编程语言运行环境 |
| **Web服务器** | Nginx | 高性能Web服务器 |
| **数据库** | MariaDB 11.4 | 开源数据库 |
| **搜索引擎** | OpenSearch 2.19.2 | Elasticsearch替代方案 |
| **缓存/会话** | Valkey 8 | Redis兼容的内存数据库 |
| **Node.js** | 20.x | JavaScript运行环境 |
| **前端主题** | Hyvä | 现代PWA主题 |
| **邮件测试** | Mailpit | 本地邮件测试工具 |
| **数据库管理** | phpMyAdmin | 数据库管理界面 |

---

## 🎯 项目依赖关键模块

### 核心Mage-OS模块 (composer.json)
```
- mage-os/product-community-edition: 3.0.0
- mage-os/module-*-sample-data: ^3.0 (各类示例数据)
```

### 开发工具
```
- friendsofphp/php-cs-fixer: ^3.22 (PHP代码格式化)
- mage-os/magento-coding-standard: 3.0.0 (编码标准)
- mage-os/magento2-functional-testing-framework: 3.0.0 (测试框架)
- phpunit: 测试框架
```

### AI集成模块
```
- google-gemini-php: Google Gemini AI集成
- openai-php: OpenAI API集成
- Magento Claude Agents (预装)
```

---

## 📂 关键目录说明

### `/app/` - 应用核心
- **应用入口**: 包含自动加载和启动引导
- **设计层**: 分离前台和后台主题
- **配置**: 数据库架构、依赖注入、模块注册

### `/pub/` - 公共访问点
- **index.php**: 前台应用入口
- **static/**: CSS、JavaScript、图片等静态资源
- **media/**: 用户上传的媒体文件

### `/setup/` - 安装和配置
- 提供Web向导进行系统安装
- 性能测试和基准工具

### `/dev/` - 开发和测试
- 单元测试、集成测试、验收测试
- API功能测试
- 测试工具和配置

### `/var/` - 动态数据（.gitignore）
- 缓存文件
- 日志文件
- 会话数据
- 临时文件

---

## 🚀 启动流程

1. **Codespaces启动** → `.devcontainer/scripts/start.sh`
2. **环境配置** → 检查 `PLATFORM_NAME` 和 `INSTALL_SAMPLE_DATA`
3. **Composer安装** → 安装PHP依赖
4. **数据库初始化** → MariaDB数据库创建和迁移
5. **Magento安装** → 运行安装脚本
6. **主题构建** → Hyvä主题编译
7. **服务启动** → Nginx、PHP-FPM、MariaDB、OpenSearch、Valkey等

---

## 🔐 配置要求

### 必需的环境变量/Secrets
- `HYVA_LICENCE_KEY`: Hyvä主题许可证
- `HYVA_PROJECT_NAME`: Hyvä Packagist仓库项目名

### 可选配置 (仅当 `PLATFORM_NAME=magento`)
- `MAGENTO_COMPOSER_AUTH_USER`: Adobe Commerce账户
- `MAGENTO_COMPOSER_AUTH_PASS`: Adobe Commerce密码

---

## 📝 开发文件示例

项目包含多个`.sample`配置文件供参考：
- `auth.json.sample`: Composer认证配置
- `nginx.conf.sample`: Nginx服务器配置
- `package.json.sample`: Node.js包管理
- `Gruntfile.js.sample`: 任务自动化配置
- `grunt-config.json.sample`: Grunt详细配置

---

## 🎨 Hyvä主题集成

- **位置**: `app/design/frontend/`
- **特性**: 现代PWA主题，优化性能
- **构建**: Grunt自动化编译
- **支持**: 内置AI助手集成

---

## ✅ 主要特性

✨ **开箱即用的开发环境**  
🐳 **Docker支持** (Docker-in-Docker)  
🤖 **AI集成** (Gemini、OpenAI、Claude)  
🧪 **完整测试套件** (单元、集成、验收测试)  
🎯 **Hyvä主题** (现代前端框架)  
🔧 **开发工具** (n98-magerun2、Xdebug)  
📊 **搜索引擎** (OpenSearch)  
⚡ **缓存系统** (Valkey)  
📧 **邮件测试** (Mailpit)

---

## 📊 项目规模

- **PHP模块**: 100+ Mage-OS官方模块
- **依赖库**: vendor/目录包含250+第三方库
- **代码行数**: 约500K+行（包含依赖）
- **测试**: 完整的单元、集成和验收测试套件

---

## 🔗 关键路由

| 路径 | 说明 |
|------|------|
| `/` | 前台店铺主页 |
| `/admin/` | 后台管理界面 |
| `/pub/media/` | 媒体文件访问 |
| `/pub/static/` | 静态资源访问 |
| `/setup/` | 安装向导 (仅初始化时) |

---

**生成日期**: 2026-06-16  
**环境**: Linux (Debian GNU/Linux 12 - Bookworm)  
**PHP版本**: 8.5  
**Magento版本**: 2.4.9 (Mage-OS 3.0)
