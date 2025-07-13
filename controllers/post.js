const { Post, Hashtag } = require("../models");

// 업로드된 사진 주소를 다시 클라이언트에 알려줄 것입니다.
// upload.single 미들웨어는 이 이미지를 처리하고 req.file 객체에 결과를 저장합니다.
exports.afterUploadImage = (req, res) => {
  // req.file.location에 S3 버킷 이미지 주소가 담겨 있습니다. 이 주소를 클라이언트로 보냅니다.
  console.log(req.file);
  // 업로드된 파일의 원래 URL과 썸네일 이미지의 URL을 전송합니다.
  const originalUrl = req.file.location;
  const url = originalUrl.replace(/\/original\//, "/thumb/");
  res.json({ url, originalUrl });
};

// input 태그를 통해 이미지를 선택할 때 먼저 업로드를 진행합니다.
// 이미지를 업로드했다면 이미지 주소가 req.body.url로 전송됩니다. 데이터 형식이 multipart이긴 하지만, 이미지 데이터가 들어 있지 않으므로(게시글 저장 시에는 이미지 데이터 대신 이미지 주소를 저장합니다) none 메서드를 사용했습니다.
exports.uploadPost = async (req, res, next) => {
  try {
    // 새로 생성된 게시글 객체가 post 변수에 저장됩니다.
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    // 콘텐츠 내의 모든 해시태그를 배열로 추출하는 역할을 합니다.
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      // 모든 해시태그를 문자열의 첫 번째 문자('#')를 제외하고 나머지 부분을 소문자로 변경한 후에 반환합니다.
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      // post.addHashtags 메서드로 게시글과 해시태그의 관계를 PostHashtag 테이블에 넣습니다.
      await post.addHashtags(
        result.map((r) => {
          console.log("r[0]", r[0]);
          return r[0];
        })
      );
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};
