const User = require('../controllers/user');  

const customerRoute = (app) => {
    app.post("/v1/user/signup", User.signup); 
    app.post("/v1/user/login", User.login);
    app.post("/v1/user/generate-otp", User.generateOTP);
    app.post("/v1/user/verify-otp", User.validateOTP);
    app.get("/v1/user/check-verification", User.checkUserVerification);
    app.post("/v1/user/update-profile", User.updateUserProfile);
    app.post("/v1/user/forgot-password", User.forgotPassword);
    app.post("/v1/user/reset-password", User.resetPassword);
    app.post("/v1/user/change-password", User.changePassword);

};

module.exports = customerRoute;
