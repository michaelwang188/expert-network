// 自动部署 Webhook 服务器 — 监听 GitHub push 事件
const http = require('http');
const { exec } = require('child_process');

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Deploying...\n');
    
    exec('bash /opt/prolink/deploy.sh', (err, stdout, stderr) => {
      if (err) { res.end('FAIL: ' + stderr); return; }
      res.end('OK\n' + stdout);
    });
  } else {
    res.writeHead(200);
    res.end('ProLink Auto-Deploy Ready');
  }
}).listen(9000, () => console.log('Webhook on :9000'));

console.log('ProLink Webhook Server running on port 9000');
