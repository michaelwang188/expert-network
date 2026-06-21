# #212 腾讯云香港节点安全基线
## 防火墙

## SSH加固
/etc/ssh/sshd_config: PermitRootLogin prohibit-password, PasswordAuthentication no
## Fail2ban
apt install fail2ban -y && systemctl enable fail2ban
## 检查清单
- [ ] ufw active
- [ ] 仅22/80/443开放
- [ ] SSH密钥登录
- [ ] fail2ban运行
- [ ] 非root运行PM2
- [ ] /opt/prolink权限750
