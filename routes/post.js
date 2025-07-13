const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const { afterUploadImage, uploadPost } = require("../controllers/post");
const { isLoggedIn } = require("../middlewares");

const router = express.Router();

// fs 모듈은 이미지를 업로드할 uploads 폴더가 없을 때 uploads 폴더를 생성합니다.
try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

//  AWS에 관한 설정을 할 수 있습니다. 방금 전에 발급받은 액세스 키 ID와 보안 액세스 키, 리전(ap-northeast-2가 서울)을 입력했습니다.
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: "ap-northeast-2",
});

//  multer의 storage 옵션을 multerS3로 교체하였습니다. multerS3의 옵션으로 s3 객체, 버킷명(bucket), 파일명(key)을 입력했습니다.

const upload = multer({
  storage: multerS3({
    s3,
    // 버킷명은 nodebird 대신 본인의 버킷명을 사용하면 됩니다.
    bucket: "nodebook3",
    // key 옵션으로 저장할 파일명을 설정하였습니다. original 폴더 아래에 생성합니다.
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Multer 모듈에 옵션을 주어 upload 변수에 대입하였습니다. upload2는 미들웨어를 만드는 객체가 됩니다.
const upload2 = multer();

// upload 변수는 미들웨어를 만드는 여러 가지 메서드를 가지고 있습니다. 자주 쓰이는 것은 single, array, fields, none입니다.
// single은 하나의 이미지를 업로드할 때 사용하며, req.file 객체를 생성합니다. array와 fields는 여러 개의 이미지를 업로드할 때 사용하며, req.files 객체를 생성합니다. none은 이미지를 올리지 않고 데이터만 multipart 형식으로 전송했을 때 사용합니다.
// array와 fields의 차이점은 이미지를 업로드한 body 속성 개수입니다. 속성 하나에 이미지를 여러 개 업로드했다면 array를, 여러 개의 속성에 이미지를 하나씩 업로드했다면 fields를 사용합니다.

// post /post/img router
router.post("/img", isLoggedIn, upload.single("img"), afterUploadImage);

// post /post router
router.post("/", isLoggedIn, upload2.none(), uploadPost);

module.exports = router;
