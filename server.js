const app = require("./app");

// listen
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 서버 대기 중입니다!");
});
