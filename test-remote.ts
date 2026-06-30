async function testUrl(url: string) {
  try {
    console.log("Testing:", url);
    const r = await fetch(url);
    console.log("Status:", r.status);
    console.log("Text:", await r.text());
  } catch (e) {
    console.error(e);
  }
}

testUrl("https://ais-dev-hpib2ffu7xj46drnvr26s7-926984790129.europe-west2.run.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_123&hub.challenge=1234");
testUrl("https://ais-pre-hpib2ffu7xj46drnvr26s7-926984790129.europe-west2.run.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_123&hub.challenge=1234");
