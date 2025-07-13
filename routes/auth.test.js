const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

// 모든 테스트가 실행되기 전에 한 번 호출되는 훅입니다.
beforeAll(async () => {
  await sequelize.sync();
});

describe("POST /join", () => {
  test("로그인 안 했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "zerohch0@gmail.com",
        nick: "zerocho",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});

describe("POST /join", () => {
  // request.agent(app)는 app에 대한 요청 에이전트를 만듭니다. 이 에이전트는 쿠키와 세션 정보를 유지하며, 여러 요청 간에 상태를 공유할 수 있습니다.
  const agent = request.agent(app);
  // 각 테스트 케이스 실행 전에 호출되는 훅입니다.
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      // 요청이 끝나면 done()을 호출하여 테스트 프레임워크에 비동기 작업이 완료되었음을 알립니다.
      .end(done);
  });

  test("이미 로그인했으면 redirect /", (done) => {
    const message = encodeURIComponent("로그인한 상태입니다.");
    agent
      .post("/auth/join")
      .send({
        email: "zerohch0@gmail.com",
        nick: "zerocho",
        password: "nodejsbook",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  test("가입되지 않은 회원", (done) => {
    const message = encodeURIComponent("가입되지 않은 회원입니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch1@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("비밀번호 틀림", (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "wrong",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인 되어있지 않으면 403", (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .end(done);
  });

  test("로그아웃 수행", (done) => {
    agent.get("/auth/logout").expect("Location", `/`).expect(302, done);
  });
});

afterAll(async () => {
  // force: true로 설정하면, 기존 테이블이 삭제되고 새로 생성되기 때문에 데이터가 모두 사라질 수 있습니다.
  await sequelize.sync({ force: true });
});
