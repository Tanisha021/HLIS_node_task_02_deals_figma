const database = require("../config/database");

class common{
    generateOTP(){
        return Math.floor(1000 + Math.random() * 9000);
    }
    generateToken(length){
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    response(res, message){
        // res.status(statusCode);
       return res.json(message);
    }

    async getUserDetail(user_id, callback) {
        const selectUserQuery = "SELECT * FROM tbl_user WHERE user_id = ?";
        
        try {
            const [user] = await database.query(selectUserQuery, [user_id]);
                    console.log(user);
                    
            if (user.length > 0) {
                callback(null, user[0]); 
            } else {
                callback("User not found", null); 
            }
        } catch (error) {
            callback(error.message, null); 
        }
    }
    
    async updateUserInfo(user_id, user_data, callback) {
        const updateQuery = "UPDATE tbl_user SET ? WHERE user_id = ?";
        
        try {
            const [result] = await database.query(updateQuery, [user_data, user_id]);
            
            if (result.affectedRows === 0) {
                throw new Error("User not found or no changes made");
            }
    
            const selectUserQuery = "SELECT user_id, user_name, fname, lname, about, followers_count, following_count, steps_ FROM tbl_user WHERE user_id = ?";
            const [updatedUser] = await database.query(selectUserQuery, [user_id]);
    
            if (updatedUser.length > 0) {
                return updatedUser[0];
            } else {
                throw new Error("User details not found after update");
            }
        } catch (error) {
            throw error;
        }
    }
    


    // encrypt(data){
    //     return cryptolib.encrypt(JSON.stringify(data));
    // }
}
module.exports = new common;