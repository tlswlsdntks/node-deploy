const express = require("express");
const passport = require("passport");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { join, login, logout } = require("../controllers/auth");

const router = express.Router();

// post /auth/join router
router.post("/join", isNotLoggedIn, join);

// post /auth/login router
router.post("/login", isNotLoggedIn, login);

// post /auth/logout router
router.get("/logout", isLoggedIn, logout);

// get /auth/kakao router
router.get("/kakao", passport.authenticate("kakao"));

// get /auth/kakao/callback router
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/?error=카카오로그인 실패",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
