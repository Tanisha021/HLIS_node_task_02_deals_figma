const { rest_keywords_password } = require("../language/en");

const checkValidatorRules = {

    login: {
        email_id: "required|email",
        passwords: "required|min:8"
    },
    signup: {
        email_id: "required|email",
        user_name: "required",
        phone_number: "string|min:10|regex:/^[0-9]+$/",
        passwords: "required|min:8"
    },
    forgotPassword:{
        email_id: "required|email"
    },
    verifyOTP: {
        email_id: 'required',
        otp: 'required'
    },
    updateUserProfile:{
        fname: 'required|string',
        lname: 'required|string',
        about:'required|string',
        user_name:'required|string',
    },
    resetPassword:{
        email_id: "required|email",
        // reset_token: "required|min:40|max:40",
        passwords: "required|min:8"
    },
    create_post:{
        descriptions: "required",
        expire_timer: "required",
        post_type: "required",
        category_id: "required",
        user_id: "required"
    },
    changePassword:{
        user_id: "required",
        old_password: "required|min:8",
        new_password: "required|min:8"
    },
    add_deal:{
        descriptions: "required",
        title: "required",
        website_url: "required",
        category_name: "required",
        image_name: "required"
    }
};

module.exports = checkValidatorRules;

