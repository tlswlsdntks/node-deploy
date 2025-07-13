const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  // error, warn, info, verbose, debug, silly가 있습니다. 심각도순(error가 가장 심각)이므로 위 순서를 참고하여 기록하길 원하는 유형의 로그를 고르면 됩니다. info를 고른 경우, info보다 심각한 단계의 로그(error, warn)도 함께 기록됩니다.
  level: "info",
  // format은 로그의 형식입니다. json, label, timestamp, printf, simple, combine 등의 다양한 형식이 있습니다. 기본적으로는 JSON 형식으로 기록하지만 로그 기록 시간을 표시하려면 timestamp를 쓰는 것이 좋습니다. combine은 여러 형식을 혼합해서 사용할 때 씁니다.
  format: format.json(),
  // new transports.File은 파일로 저장한다는 뜻이고, new transports.Console은 콘솔에 출력한다는 뜻입니다. 여러 로깅 방식을 동시에 사용할 수도 있습니다. new transports.File인 경우 로그 파일의 이름인 filename도 설정할 수 있습니다.
  transports: [
    new transports.File({ filename: "combined.log" }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    // 배포 환경이 아닌 경우 파일뿐만 아니라 콘솔에도 출력하도록 되어있습니다. 이 메서드들에도 level, format 등을 설정할 수 있습니다.
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = logger;
