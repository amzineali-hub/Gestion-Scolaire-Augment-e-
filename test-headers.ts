async function testUrl(url: string) {
  try {
    const r = await fetch(url);
    console.log("Status:", r.status);
    console.log("Headers:");
    r.headers.forEach((v, k) => console.log(k, v));
    console.log("Text:", await r.text());
  } catch (e) {
    console.error(e);
  }
}

testUrl("https://gestion-scolaire-augment-e-4311175589.europe-west2.run.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_123&hub.challenge=1234");
