const { isLoggedIn, isNotLoggedIn } = require(".");

describe("isLoggedIn", () => {
  const res = {
    // 체이닝을 위해 this를 반환하는 mock 함수합니다.
    status: jest.fn().mockReturnThis(),
    // 응답 메시지 전송을 위한 mock 함수입니다.
    send: jest.fn(),
  };
  // 다음 미들웨어 호출을 위한 mock 함수입니다.
  const next = jest.fn();
  test("로그인 되어있으면 isLoggedIn이 next를 호출해야 함", () => {
    const req = {
      // 로그인 상태를 true로 반환하는 mock 함수입니다.
      isAuthenticated: jest.fn().mockReturnValue(true),
    };
    // 미들웨어를 호출합니다.
    isLoggedIn(req, res, next);
    // next가 호출되었는 지 여부를 검증할 때 사용됩니다.
    // expect.toHaveBeenCalled();
    // next가 한 번 호출되었는지 검증합니다.
    expect(next).toHaveBeenCalledTimes(1);
  });
  test("로그인 되어있지 않으면 isLoggedIn이 에러를 응답해야 함", () => {
    const req = {
      // 로그인 상태를 false로 반환하는 mock 함수입니다.
      isAuthenticated: jest.fn().mockReturnValue(false),
    };
    isLoggedIn(req, res, next);

    // res.status 함수가 403 이라는 인수와 함께 호출되었는 지 검증합니다.
    expect(res.status).toHaveBeenCalledWith(403);
    // res.send 함수가 "로그인 필요" 라는 인수와 함께 호출되었는 지 검증합니다.
    expect(res.send).toHaveBeenCalledWith("로그인 필요");
  });
});

describe("isNotLoggedIn", () => {
  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();
  test("로그인 되어있으면 isNotLoggedIn이 에러를 응답해야 함", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(true),
    };
    isNotLoggedIn(req, res, next);
    const message = encodeURIComponent("로그인한 상태입니다.");
    // res.redirect 함수가 `/?error=${message}` 라는 인수와 함께 호출되었는 지 검증합니다.
    expect(res.redirect).toHaveBeenCalledWith(`/?error=${message}`);
  });
  test("로그인 되어있지 않으면 isNotLoggedIn이 next를 호출해야 함", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(false),
    };
    isNotLoggedIn(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
