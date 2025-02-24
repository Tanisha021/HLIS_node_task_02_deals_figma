// const { response } = require("express");
const responseCode = require("../../../../utilities/response-error-code");
const constant = require("../../../../config/constant");
const common  = require("../../../../utilities/common");
const userModel = require("../models/user-model");

class User{
    constructor(){}
    signup(req,res){
        // console.log("signup");
        var request_data = req.body;
    
                userModel.signup(request_data,(_responseData)=>{
                    common.response(res,_responseData)
                });
    }
    login(req, res) {
        var request_data = req.body;
    
        userModel.login(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
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
        const request_data = req.body;

        if (!request_data.user_id) {
            return common.response(res, { 
                code: common.response_code.OPERATION_FAILED, 
                message: "User ID is required" 
            });
        }

        userModel.updateUserProfile(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }

    forgotPassword(req, res) {
        var request_data = req.body;
    
        userModel.forgotPassword(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    resetPassword(req, res) {
        var request_data = req.body;
    
        userModel.resetPassword(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
    }
    changePassword(req, res) {
        var request_data = req.body;
    
        userModel.changePassword(request_data, (_responseData) => {
            common.response(res, _responseData);
        });
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
        const request_data = req.body;
        if (!request_data.title || !request_data.descriptions || !request_data.category_name) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "Missing required fields"
           });
        }
        userModel.create_post(request_data, request_data.user_id, (response_data) => {
            common.response(res, response_data);
        });
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
        const request_data = req.body;
        if (!request_data.title || !request_data.descriptions || !request_data.category_name) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "Missing required fields"
           });
        }
        userModel.add_deal(request_data, request_data.user_id, (response_data) => {
            common.response(res, response_data);
        });
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
    
};
module.exports =new User();