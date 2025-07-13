// ../models/user 모듈을 목(mock)으로 대체하여 실제 데이터베이스 호출을 방지합니다.
jest.mock("../models/user");
// 목으로 대체된 User 모델을 불러옵니다.
const User = require("../models/user");
const { follow } = require("./user");

describe("follow", () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  const next = jest.fn();

  test("사용자를 찾아 팔로잉을 추가하고 sucess를 응답해야함", async () => {
    // User.findOne이 호출되면 팔로잉 성공 시 resolve(true)를 반환하는 mock 함수입니다.
    User.findOne.mockReturnValue({
      addFollowing(id) {
        return Promise.resolve(true);
      },
    });

    await follow(req, res, next);
    expect(res.send).toHaveBeenCalledWith("success");
  });

  test("사용자를 못 찾으면 res.status(404).send('no user')를 호출함", async () => {
    User.findOne.mockReturnValue(null);

    await follow(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("no user");
  });

  test("DB에서 에러가 발생하면 next(error)를 호출함", async () => {
    const message = "에러 메세지";
    User.findOne.mockReturnValue(Promise.reject(message));
    await follow(req, res, next);
    expect(next).toHaveBeenCalledWith(message);
  });
});
