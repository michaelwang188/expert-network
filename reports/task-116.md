# #116 API Key/Token硬编码扫描

## 结论：B 级。源码干净 ✅，但历史文件遗留 3 个 GitHub Token 🔴。

## 源码扫描（✅ 干净）

| 检查项 | 结果 |
|--------|------|
| src/ 中 `sk-` / `apiKey` | 0 ✅ |
| src/ 中 `Bearer` / `Authorization` | 0 ✅ |
| `.env` `NEXTAUTH_SECRET` | 已 gitignore ✅ |
| `.env.local` Neon 密码 | 已 gitignore ✅ |
| next.config.js | 无密钥 ✅ |

## 🔴 历史泄露

| 文件 | 内容 | 状态 |
|------|------|------|
| `COLLABORATION_HANDOFF.md:225-227` | 3 个 `ghp_*` GitHub Token（标注"已公开"） | ⚠️ 文件存在但 gitignored |
| `.backups/2026-06-19-*/COLLABORATION_HANDOFF.md` | 同上 | ⚠️ 目录 gitignored ✅ |
| `.backups/` 目录 | 已 gitignore ✅ | - |

## 🟡 警告项

| 项 | 位置 | 风险 |
|-----|------|------|
| `Neon` 密码 | `.env.local:9` PGPASSWORD | 已 gitignore，但本地明文 |
| `NEXTAUTH_SECRET` | `.env:2` 硬编码值 | 仅本地 dev |

## 修复建议

1. **删除历史 Token 文件**:
```bash
rm COLLABORATION_HANDOFF.md SESSION_HANDOFF.md
rm -rf .backups/
```
2. **GitHub 吊销已泄露 Token**（标注"已公开"的 3 个 `ghp_*`）
3. **确认 `.gitignore` 覆盖**: `.env*` 已排除 `.env.local` ✅

工时：5min（删除文件 + 吊销 Token 需手动）
