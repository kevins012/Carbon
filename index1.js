Bun.serve({
  static: {
    "/" : new Response(await Bun.file("./about").bytes(), {
      headers: {
        "Content-Type": "text/html",
      },
  })
  },
  fetch(req) {
    return new Response("404!");
  }
});