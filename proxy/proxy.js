const WebSocket = require('ws');
const net = require('net');

const WS_PORT = process.env.WS_PORT || 8080;
const TCP_HOST = process.env.TCP_HOST || '127.0.0.1';
const TCP_PORT = process.env.TCP_PORT || 5000;

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
    console.log(`=====================================================`);
    console.log(`  WEBSOCKET <-> TCP PROXY RUNNING`);
    console.log(`  WebSocket URL : ws://localhost:${WS_PORT}`);
    console.log(`  Bridge to TCP : ${TCP_HOST}:${TCP_PORT}`);
    console.log(`=====================================================`);
});

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[PROXY] Client WebSocket ket noi tu: ${clientIp}`);

    // Moi client WS ket noi se tao 1 ket noi TCP den C Server
    const tcpSocket = new net.Socket();
    let tcpBuffer = Buffer.alloc(0);

    tcpSocket.connect(TCP_PORT, TCP_HOST, () => {
        console.log(`[PROXY] Da noi thong TCP Socket toi C Server (${TCP_HOST}:${TCP_PORT}) cho client ${clientIp}`);
    });

    // 1. Nhan du lieu tu Web Client (WebSocket) -> Dong goi 4-byte length -> Gui sang C Server (TCP)
    ws.on('message', (message) => {
        const payloadStr = message.toString();
        const payloadBuf = Buffer.from(payloadStr, 'utf-8');

        // Tao 4 bytes header chua do dai payload (Big-Endian)
        const headerBuf = Buffer.alloc(4);
        headerBuf.writeUInt32BE(payloadBuf.length, 0);

        // Gui ca header + payload sang C Server
        tcpSocket.write(Buffer.concat([headerBuf, payloadBuf]));
        console.log(`[WS -> TCP] Sent ${payloadBuf.length} bytes to C Server: ${payloadStr.slice(0, 80)}...`);
    });

    // 2. Nhan du lieu tu C Server (TCP Stream) -> Giai ma 4-byte length -> Gui ve Web Client (WebSocket)
    tcpSocket.on('data', (chunk) => {
        tcpBuffer = Buffer.concat([tcpBuffer, chunk]);

        // Xu ly truyen dong: Kiem tra xem da nhan du frame chua
        while (tcpBuffer.length >= 4) {
            const msgLen = tcpBuffer.readUInt32BE(0);

            if (tcpBuffer.length < 4 + msgLen) {
                // Chua nhan du payload, doi chunk tiep theo
                break;
            }

            // Da nhan du 1 message hoan chinh
            const jsonBuf = tcpBuffer.subarray(4, 4 + msgLen);
            const jsonStr = jsonBuf.toString('utf-8');

            // Cat bo message da xu ly khoi buffer
            tcpBuffer = tcpBuffer.subarray(4 + msgLen);

            // Day chuoi JSON ve Web Client qua WebSocket
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(jsonStr);
                console.log(`[TCP -> WS] Pushed to browser: ${jsonStr.slice(0, 80)}...`);
            }
        }
    });

    // Xu ly ngat ket noi
    ws.on('close', () => {
        console.log(`[PROXY] WebSocket client disconnected -> closing TCP socket`);
        tcpSocket.end();
    });

    tcpSocket.on('close', () => {
        console.log(`[PROXY] TCP socket closed`);
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });

    tcpSocket.on('error', (err) => {
        console.error(`[PROXY ERROR] TCP Socket error:`, err.message);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                action: 'ERROR',
                status: 'FAIL',
                message: `Khong the ket noi toi C Server (${TCP_HOST}:${TCP_PORT}). Hay dam bao C Server dang chay!`
            }));
            ws.close();
        }
    });

    ws.on('error', (err) => {
        console.error(`[PROXY ERROR] WebSocket error:`, err.message);
    });
});
