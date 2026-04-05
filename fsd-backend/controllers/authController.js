const authService = require("../services/authService");
const { asyncHandler, AppError } = require("../utils/errorHandler");

// REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await authService.registerUser(name, email, password, 'USER');

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});

// LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: "Login successful",
    accessToken: result.accessToken,
    user: result.user,
  });
});

// REFRESH TOKEN
exports.refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    message: "Token refreshed successfully",
    accessToken: result.accessToken,
  });
});

// GET CURRENT USER
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  res.json({
    success: true,
    user,
  });
});

// LOGOUT
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// REGISTER ADMIN
exports.registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if admin secret key is provided
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    throw new AppError("Invalid admin credentials", 403);
  }

  const user = await authService.registerUser(name, email, password, 'ADMIN');

  res.status(201).json({
    success: true,
    message: "Admin user registered successfully",
    user,
  });
});