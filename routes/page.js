const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  renderProfile,
  renderJoin,
  renderMain,
  renderHashtag,
} = require("../controllers/page");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  // req.user 객체의 Followers 와 Followings 배열을 참조하여 팔로워 수, 팔로잉 수, 팔로잉 목록을 각각 계산하고 있습니다.
  // req.user 또는 그 속성들이 undefined 또는 null 이면, 안전하게 undefined를 반환하고, 기본값으로 0 또는 빈 배열을 할당합니다.
  res.locals.followerCount = req.user?.Followers?.length || 0;
  res.locals.followingCount = req.user?.Followings?.length || 0;
  res.locals.followingIdList = req.user?.Followings?.map((f) => f.id) || [];
  next();
});

// get /profile router
router.get("/profile", isLoggedIn, renderProfile);

// get /join router
router.get("/join", isNotLoggedIn, renderJoin);

// get / router
router.get("/", renderMain);

// get /hashtag router
router.get("/hashtag", renderHashtag);

module.exports = router;
