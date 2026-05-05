const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = adminMiddleware;
