const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('[TEST] Da ket noi toi WebSocket Proxy ws://localhost:8080');
    console.log('[TEST] Gui goi tin PING: {"action":"PING"}');
    ws.send(JSON.stringify({ action: 'PING' }));
});

ws.on('message', (data) => {
    console.log('[TEST] Nhan phan hoi tu C Server:', data.toString());
    const resp = JSON.parse(data.toString());
    if (resp.action === 'PONG' && resp.status === 'OK') {
        console.log('===> THONG MACH THANH CONG: REACT WS <-> PROXY <-> C SERVER (SELECT + STREAM)! <===');
    }
    ws.close();
    process.exit(0);
});

ws.on('error', (err) => {
    console.error('[TEST ERROR]', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('[TEST TIMEOUT] Khong nhan duoc phan hoi sau 5s');
    process.exit(1);
}, 5000);
