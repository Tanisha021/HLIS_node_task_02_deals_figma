// const { response } = require("express");
const responseCode = require("../../../../utilities/response-error-code");
const constant = require("../../../../config/constant");
const common  = require("../../../../utilities/common");
const userModel = require("../models/user-model");
const {default: localizify} = require('localizify');
const validationRules  = require('../../../validation_rules');
const middleware = require("../../../../middleware/validators");
const { t } = require("localizify");

class User{
    constructor(){}
    signup(req,res){
        try{
            var request_data = req.body;

            const rules = validationRules.signup

            let message={
                required:req.language.required,
                email:t('email'),
                'mobile_number.min': t('mobile_number_min'),
                'mobile_number.regex': t('mobile_number_numeric'),
                'passwords.min': t('passwords_min')  
            }

            let keywords={
                'password': t('rest_keywords_password'),
                'email_id': t('email')
            }

            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
    
        if (valid) {
            userModel.signup(request_data, (_responseData) => {
                common.response(res, _responseData);
            });
        }
        }catch(error){
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + sql.message
            });
        }
        // var request_data = req.body;
    
        //         userModel.signup(request_data,(_responseData)=>{
        //             common.response(res,_responseData)
        //         });
    }
    login(req, res) {
        try{
            var request_data = req.body;

            const rules = validationRules.login; 
    
            let message={
                required: req.language.required,
                email_id: t('email'),
                'passwords.min': t('passwords_min')
            }
    
            let keywords={
                'email_id': t('rest_keywords_email_id'),
                'passwords':t('rest_keywords_password')
            }
            const valid = middleware.checkValidationRules(req,res,request_data,rules,message, keywords)
            if(valid){
                userModel.login(request_data, (_responseData) => {
                    common.response(res, _responseData);
                });
            }
        }catch(error){
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong')
            });

        }
        // var request_data = req.body;
    
        // userModel.login(request_data, (_responseData) => {
        //     common.response(res, _responseData);
        // });
    }
     // generate OTP Function
    generateOTP(req, res) {
        var request_data = req.body;
        userModel.verifyOTP(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
   
    validateOTP(req, res) {
        var request_data = req.body;
        userModel.validateOTP(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }

    // checkVerification status
    checkUserVerification(req, res) {
        var request_data = req.body;
        userModel.checkUserVerification(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    // update user profile
    updateUserProfile(req, res) {
        try{        
            const request_data = req.body;
            const rules = validationRules.updateUserProfile; 

        let message={
            required: req.language.required
        }

        let keywords={
            'user_name': t('rest_keywords_username'),
            'fname': t('rest_keywords_fname'),
            'lname': t('rest_keywords_lname'),
            'about': t('rest_keywords_about'),
        }
        const valid = middleware.checkValidationRules(req,res,request_data,rules,message, keywords)
        if(valid){
            userModel.updateUserProfile(request_data, (_responseData) => {
                common.response(res, _responseData);
            });
        }

        }catch(error){
            console.error("Error in complete_profile:", error);
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong')
            });
        }
        // const request_data = req.body;

        // if (!request_data.user_id) {
        //     return common.response(res, { 
        //         code: common.response_code.OPERATION_FAILED, 
        //         message: "User ID is required" 
        //     });
        // }

        // userModel.updateUserProfile(request_data, (_responseData) => {
        //     common.response(res, _responseData);
        // });
    }

    forgotPassword(req, res) {
        try{
            var request_data = req.body;

            const rules = validationRules.forgotPassword;
            // let message = req.language.required;
            let message = {
                required: req.language.required,
                email: t('email'),
            };
        
            let keywords = {
                'email_id': t('rest_keywords_email_id')
            };
    
            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
        
            if (valid) {
                userModel.forgotPassword(request_data, (_responseData) => {
                    common.response(res, _responseData);
                });
            }
            // userModel.forgotPassword(request_data, (_responseData) => {
            //     common.response(res, _responseData);
            // });
        }catch(error){
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong')
            });
        }
        // var request_data = req.body;
    
        // userModel.forgotPassword(request_data, (_responseData) => {
        //     common.response(res, _responseData);
        // });
    }
    resetPassword(req, res) {
        try{
            var request_data = req.body;

            const rules = validationRules.resetPassword;
            // let message = req.language.required;
            let message = {
                required: req.language.required,
                email: t('email'),
                'passwords.min': t('passwords_min'),
            };
        
            let keywords = {
                'email_id': t('rest_keywords_email_id')
            };
    
            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
        
            if (valid) {
                userModel.resetPassword(request_data, (_responseData) => {
                    common.response(res, _responseData);
                });
            }
            // userModel.forgotPassword(request_data, (_responseData) => {
            //     common.response(res, _responseData);
            // });
        }catch(error){
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong')
            });
        }
        // var request_data = req.body;
    
        // userModel.resetPassword(request_data, (_responseData) => {
        //     common.response(res, _responseData);
        // });
    }
    changePassword(req, res) {
        try{
            var request_data = req.body;

            const rules = validationRules.changePassword

            let message={
                required:req.language.required,
                required: t('required'),
                'old_password.min': t('passwords_min'),
                'new_password.min': t('passwords_min')
            }

            let keywords={
                'new_password': t('rest_keywords_password'),
                'old_password': t('rest_keywords_password')
            }

            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
    
        if (valid) {
            userModel.changePassword(request_data, (_responseData) => {
                common.response(res, _responseData);
            });
        }
        }catch(error){
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong')
            });
        }
        // var request_data = req.body;
    
        // userModel.changePassword(request_data, (_responseData) => {
        //     common.response(res, _responseData);
        // });
    }
    categoryList(req, res) {
        var request_data = req.body;
    
        userModel.categoryList(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    availableDealsList(req, res) {
        var request_data = req.body;
    
        userModel.availableDealsList(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    dealsDetailsPage(req, res) {
        var request_data = req.params;
    
        userModel.dealsDetailsPage(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    categoryDealCount(req, res) {
        var request_data = req.body;
    
        userModel.categoryDealCount(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    // add_deal(req, res) {
    //     var request_data = req.body;
    
    //     userModel.add_deal(request_data, (_responseData) => {
    //         common.response(res, _responseData);
    //     });
    // }
   
    deals4u(req, res) {
        var request_data = req.params;
    
        userModel.deals4u(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    dealComment(req, res) {
        var request_data = req.params;
    
        userModel.dealComment(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }   
    user_profile(req, res) {
        var request_data = req.params;
    
        userModel.user_profile(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }   

    create_post(req,res){
        try{
            var request_data = req.body;

            const rules = validationRules.create_post

            let message={
                required:req.language.required
            }

            let keywords={
                'descriptions': t('rest_keywords_descriptions'),
                'user_id': t('rest_keywords_user_id')
            }

            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
    
        if (valid) {
            userModel.create_post(request_data, (_responseData) => {
                common.response(res, _responseData);
            });
        }
        }catch(error){
            return common.response(res, {
                code: response_code.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + sql.message
            });
        }
        // const request_data = req.body;
        // if (!request_data.title || !request_data.descriptions || !request_data.category_name) {
        //     return common.response(res, {
        //         code: responseCode.OPERATION_FAILED,
        //         message: "Missing required fields"
        //    });
        // }
        // userModel.create_post(request_data, request_data.user_id, (response_data) => {
        //     common.response(res, response_data);
        // });
    }
    edit_profile(req,res){
        const request_data = req.body;
        if (!request_data.title || !request_data.descriptions || !request_data.category_name) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "Missing required fields"
           });
        }
        userModel.edit_profile(request_data, request_data.user_id, (response_data) => {
            common.response(res, response_data);
        });
    }
    add_deal(req,res){
        try{
            var request_data = req.body;

            const rules = validationRules.add_deal
            console.log(rules);

            let message={
                required:req.language.required
            }

            let keywords={
                'descriptions': t('rest_keywords_descriptions')
            }

            const valid = middleware.checkValidationRules(req, res, request_data, rules, message, keywords);
    
        if (valid) {
            userModel.add_deal(request_data,request_data.user_id, (_responseData) => {
                common.response(res, _responseData);
            });
        }
        }catch(error){
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: t('rest_keywords_something_went_wrong') + sql.message
            });
        }
        // const request_data = req.body;
        // if (!request_data.title || !request_data.descriptions || !request_data.category_name) {
        //     return common.response(res, {
        //         code: responseCode.OPERATION_FAILED,
        //         message: "Missing required fields"
        //    });
        // }
        // userModel.add_deal(request_data, request_data.user_id, (response_data) => {
        //     common.response(res, response_data);
        // });
    }

    get_followers(req,res){
        const request_data = req.body;
        userModel.get_followers(request_data.user_id, (response) => {
        common.response(res, response);
    });
    }
    get_following(req,res)   {
        const request_data = req.body;
        userModel.get_following(request_data.user_id, (response) => {
        common.response(res, response);
    });
}
    account_delete(req,res){
        const request_data = req.body;
        userModel.delete_account(request_data, request_data.user_id, (response) => {
        common.response(res, response);
    });
    }
    
    contact_us(req,res){
        const request_data = req.body;
        userModel.contact_us(request_data, request_data.user_id, (response) => {
        common.response(res, response);
    });
}
};
module.exports =new User();