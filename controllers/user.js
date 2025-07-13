const { follow } = require("../services/user");

exports.follow = async (req, res, next) => {
  try {
    const result = await follow(req.user.id, req.params.id);
    if (result === "ok") {
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};
