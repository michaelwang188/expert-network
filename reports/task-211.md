# #211 HTTPS证书配置验证审计
## Let's Encrypt标准方案

## 检查
curl -I https://516380.com 2>/dev/null | grep -i "HTTP/\|Strict-Transport\|server"
