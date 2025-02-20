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
    
    
}
module.exports =new User();