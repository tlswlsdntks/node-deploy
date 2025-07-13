const Sequelize = require("sequelize");
const User = require("./user");
const config = require("../config/config.json")["test"];
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

describe("User 모델", () => {
  test("static init 메서드 호출", () => {
    // User.initiate(sequelize)가 호출된 후 반환값이 undefined인 지 검증합니다.
    expect(User.initiate(sequelize)).toBe(undefined);
  });

  test("static associate 메서드 호출", () => {
    const db = {
      User: {
        hasMany: jest.fn(),
        belongsToMany: jest.fn(),
      },
      Post: {},
    };
    User.associate(db);
    // db.User.hasMany 함수가 db.Post 라는 인수와 함께 호출되었는 지 검증합니다.
    expect(db.User.hasMany).toHaveBeenCalledWith(db.Post);
    // db.User.belongsToMany 함수가 호출된 횟수가 2번인 지 검증합니다.
    expect(db.User.belongsToMany).toHaveBeenCalledTimes(2);
  });
});
