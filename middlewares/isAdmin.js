module.exports = (req, res, next) => {
  if (!req.user.is_admin) {
    req.status = 403;
    return next(new Error('You do not have the required, level of clearance'));
  }

  return next();
};
