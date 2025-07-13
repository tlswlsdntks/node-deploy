// import
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
const redis = require("redis");
// connect-redis는 express-session에 의존성이 있습니다.
const RedisStore = require("connect-redis").default;

// config
dotenv.config();
// RedisStore의 옵션으로 .env에 저장했던 값들을 사용합니다. host, port, pass를 차례대로 넣어주면 됩니다.
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});
redisClient.connect().catch(console.error);
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const { sequelize } = require("./models");
const passportConfig = require("./passport");
const logger = require("./logger");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

// common middleware
// helmet, hpp은 서버의 각종 취약점을 보완해주는 패키지들입니다. 이 패키지를 사용한다고 해서 모든 취약점을 방어해주는 것은 아니므로 서버를 운영할 때는 주기적으로 취약점을 점검해야 합니다.
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(
    helmet({
      // Content Security Policy(콘텐츠 보안 정책)를 비활성화합니다.
      // 이 설정은 브라우저가 어떤 콘텐츠를 허용할지 결정하는 정책을 무시하게 만듭니다.
      contentSecurityPolicy: false,

      // Cross-Origin Embedder Policy(교차 출처 임베더 정책)를 비활성화합니다.
      // 이 정책은 크로스 오리진 리소스 임베딩을 제어하는데, false로 설정하면 관련 제한이 해제됩니다.
      crossOriginEmbedderPolicy: false,

      // Cross-Origin Resource Policy(교차 출처 리소스 정책)를 비활성화합니다.
      // 이 정책은 리소스의 교차 출처 접근을 제어하는데, false로 설정하면 제한이 제거됩니다.
      crossOriginResourcePolicy: false,
    })
  );
  app.use(hpp());
} else {
  app.use(morgan("dev"));
}
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  // express-session 미들웨어에 store 옵션을 추가합니다. 기본적으로는 메모리에 세션을 저장하지만, 이제는 RedisStore에 저장합니다.
  // 이제 세션 정보가 메모리 대신 레디스에 저장됩니다. 따라서 로그인 후 서버를 껐다 켜도 로그인이 유지됩니다. 실제 서비스에서 서버 업데이트 시 로그인이 풀리는 현상을 막을 수 있습니다.
  store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === "production") {
  // 이 코드를 무조건 적용해야 하는 것은 아닙니다. https를 적용할 경우에만 사용하면 됩니다. proxy를 true로 적용해야 하는 경우는 https 적용을 위해 노드 서버 앞에 다른 서버를 두었을 때입니다. cookie.secure 또한 https 적용이나 로드밸런싱(요청 부하 분산) 등을 위해 true로 바꿔줍니다.
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

// router
app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

// 404 not handler
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.info("hello");
  logger.error(error.message);
  next(error);
});

// error middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500).render("error");
});

module.exports = app;
