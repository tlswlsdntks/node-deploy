const { User, Post, Hashtag } = require("../models");

exports.renderProfile = (req, res) => {
  res.render("profile", { title: "내정보 - NodeBird" });
};

exports.renderJoin = (req, res) => {
  res.render("join", { title: "회원가입 - NodeBird" });
};

exports.renderMain = async (req, res, next) => {
  try {
    // 데이터베이스에서 게시글을 조회한 뒤 결과를 twits에 넣어 렌더링합니다. 조회할 때 게시글 작성자의 아이디와 닉네임을 JOIN해서 제공하고, 게시글의 순서는 최신순으로 정렬하였습니다.
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("main", { title: "NodeBird", twits: posts });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderHashtag = async (req, res, next) => {
  // 쿼리스트링으로 해시태그 이름을 받고 해시태그가 빈 문자열인 경우 메인페이지로 돌려보냅니다.
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    // 데이터베이스에서 해당 해시태그가 존재하는지 검색합니다.
    const hashtag = await Hashtag.findOne({
      where: { title: query },
    });
    // 해시태그 존재한다면 시퀄라이즈에서 제공하는 getPosts 메서드로 모든 게시글을 가져옵니다. 가져올 때는 작성자 정보를 JOIN합니다.
    let posts = [];
    if (hashtag) {
      // hashtag.getPosts() 와 같은 관계 메서드에 include 옵션을 사용할 때는 일반적으로 include를 배열로 전달하는 것이 Sequelize의 표준 방식입니다.
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    // 조회 후 메인 페이지를 렌더링하면서 전체 게시글 대신 조회된 게시글만 twits에 넣어 렌더링합니다.
    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (err) {
    console.error;
    next(err);
  }
};
