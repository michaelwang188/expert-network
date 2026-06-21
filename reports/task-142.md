# #142 Next.js build产物体积回归审计
## 结论：A 级。120KB static/20 deps 极精简

| 指标 | 值 |
|------|-----|
| .next/static | 120KB |
| deps | 8 production |
| devDeps | 12 |
| polyfills | 110KB |

无冗余依赖，构建干净。✅
