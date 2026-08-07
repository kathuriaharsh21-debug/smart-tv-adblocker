const net = require('net');

/**
 * Layer 4 SNI (Server Name Indication) Inspection Engine
 * Inspects plaintext TLS ClientHello packet SNI hostnames on TCP 443
 * Drops ad-serving subdomains (Hotstar, SonyLIV SSAI) without SSL decryption.
 */

const SSAI_AD_DOMAINS = [
  'ad-akamaized.net',
  'ssai-ads.hotstar.com',
  'ads.hotstar.com',
  'dai-sonyliv.com',
  'ssai-vizio.sonyliv.com',
  'pubads.g.doubleclick.net'
];

function extractSNI(buffer) {
  if (buffer.length < 5 || buffer[0] !== 0x16) return null; // Not TLS Handshake
  let pos = 43; // Skip TLS Record & ClientHello fixed fields
  if (pos >= buffer.length) return null;

  const sessionIDLen = buffer[pos];
  pos += 1 + sessionIDLen;
  if (pos + 2 >= buffer.length) return null;

  const cipherSuitesLen = buffer.readUInt16BE(pos);
  pos += 2 + cipherSuitesLen;
  if (pos >= buffer.length) return null;

  const compMethodsLen = buffer[pos];
  pos += 1 + compMethodsLen;
  if (pos + 2 >= buffer.length) return null;

  const extensionsLen = buffer.readUInt16BE(pos);
  pos += 2;
  const extensionsEnd = pos + extensionsLen;

  while (pos + 4 <= extensionsEnd && pos + 4 <= buffer.length) {
    const extType = buffer.readUInt16BE(pos);
    const extLen = buffer.readUInt16BE(pos + 2);
    pos += 4;

    if (extType === 0) { // SNI Extension
      if (pos + 5 <= buffer.length) {
        const nameLen = buffer.readUInt16BE(pos + 3);
        return buffer.toString('utf8', pos + 5, pos + 5 + nameLen);
      }
    }
    pos += extLen;
  }
  return null;
}

function startSNIFilterServer(port = 8443) {
  const server = net.createServer(socket => {
    socket.once('data', buffer => {
      const hostname = extractSNI(buffer);
      if (hostname) {
        const isAdDomain = SSAI_AD_DOMAINS.some(ad => hostname.includes(ad));
        if (isAdDomain) {
          console.log(`[Layer-4 SNI Filter] 🛑 DROPPED TLS Connection to SSAI Ad Host: ${hostname}`);
          socket.destroy(); // Drop TCP connection instantly
          return;
        }
        console.log(`[Layer-4 SNI Filter] 🟢 PASSED Content Stream TLS Connection: ${hostname}`);
      }
      socket.resume();
    });
  });

  server.listen(port, () => {
    console.log(`[Firewall-Manager] Layer 4 SNI SSAI Filter Active on TCP port ${port}`);
  });
}

module.exports = { startSNIFilterServer, extractSNI };
if (require.main === module) {
  startSNIFilterServer();
}
