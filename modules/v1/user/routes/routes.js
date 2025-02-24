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

    //figma deals on demand routes
    app.get("/v1/user/category-list", User.categoryList);
    app.get("/v1/user/deals-list", User.availableDealsList);
    app.get("/v1/user/deals-details/:deal_id", User.dealsDetailsPage);
    app.get("/v1/user/all_category_deal_cnt", User.categoryDealCount);
    app.get("/v1/user/deals_for_u/:category_name", User.deals4u);
    app.get("/v1/user/deals-details/:deal_id/comments", User.dealComment);
    app.get("/v1/user/profile/:user_id", User.user_profile);

    app.post("/v1/user/create-deal", User.add_deal);
    app.post("/v1/user/create-post", User.create_post);
    app.post("/v1/user/edit_profile", User.edit_profile);

    app.post("/v1/user/get_followers", User.get_followers);
    app.post("/v1/user/get_following", User.get_following);

};

module.exports = customerRoute;
