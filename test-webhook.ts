async function test() {
  const url = "http://127.0.0.0:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_123&hub.challenge=1158201444";
  try {
    console.log("Fetching", url);
    const r = await fetch(url);
    console.log("Status:", r.status);
    console.log("Text:", await r.text());
  } catch (e) {
    console.error(e);
  }
}
test();
