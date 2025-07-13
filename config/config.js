// JS 파일이므로 dotenv 모듈을 사용할 수 있습니다.
require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird_production",
    host: "127.0.0.1",
    dialect: "mysql",
    // 현재 쿼리를 수행할 때마다 콘솔에 SQL문이 노출됩니다. 배포 환경에서는 어떤 쿼리가 수행되는지 숨기는 것이 좋습니다. 따라서 production일 경우에는 logging에 false를 주어 쿼리 명령어를 숨겼습니다.
    logging: false,
  },
};
