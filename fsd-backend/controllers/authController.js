const authService = require("../services/authService");
const sendEmail = require("../utils/sendEmail");
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

  const user = await authService.registerUser(name, email, password, 'ADMIN');

  res.status(201).json({
    success: true,
    message: "Admin user registered successfully",
    user,
  });
});

// FORGOT PASSWORD - generate token and send email
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const resetToken = await authService.generatePasswordResetToken(email);

  const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `<p>You requested a password reset. Click the link below to reset your password (expires in 1 hour):</p>
    <p><a href="${resetUrl}">Reset Password</a></p>`;

  await sendEmail({ to: email, subject: 'Password reset', html: message });

  res.json({ success: true, message: 'Password reset email sent if user exists' });
});

// RESET PASSWORD - verify token and set new password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    throw new AppError('Token is required', 400);
  }

  if (!password) {
    throw new AppError('New password is required', 400);
  }

  await authService.resetPassword(token, password);

  res.json({ success: true, message: 'Password has been reset successfully' });
});
