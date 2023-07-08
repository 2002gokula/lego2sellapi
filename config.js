exports.Config = {
  PORT: process.env.PORT || 5000,
  JWTSECRET: {
    SECRET: "TOUGHESTSECRETEVER",
  },
  responseCode: {
    success: "SUCCESS",
    error: "ERROR",
  },
};
