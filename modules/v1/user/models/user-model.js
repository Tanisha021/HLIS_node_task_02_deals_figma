const common = require("../../../../utilities/common");
const database = require("../../../../config/database");
const response_code = require("../../../../utilities/response-error-code");
const md5 = require("md5");

class UserModel {
    
    async signup(request_data, callback) {
        // Prepare user data object
        const user_data = {
            user_name: request_data.user_name,
            // fname: request_data.fname,
            // lname: request_data.lname,
            email_id: request_data.email_id || null,
            phone_number: request_data.phone_number || null,
            passwords: request_data.passwords ? md5(request_data.passwords) : null,
            steps_: 1
        };
        // Insert new user if no existing record found
        try {
            const insertUserQuery = "INSERT INTO tbl_user SET ?";

            // Insert user into the database
            const [result] = await database.query(insertUserQuery, user_data);

            if (!result.insertId) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "User registration failed"
                }, null);
            } else {
                callback({
                    code: response_code.SUCCESS,
                    message: "User registered, please verify OTP",
                    user_id: result.insertId
                });
            }

        } catch (error) {
            callback({
                code: response_code.OPERATION_FAILED,
                message: "Signup error: "
            }, null);
        }

    }

    // verify OTP
    async verifyOTP(request_data, callback) {
        try {
            const generated_otp = common.generateOTP();
            console.log("Generated OTP:", generated_otp);
            const otp_data = {
                user_id: request_data.user_id,
                action: "signup",
                verify_with: request_data.email_id ? "email" : "phone",
                verify: 0,  // Not verified yet
                otp: generated_otp,
                created_at: new Date()
            };
            const insertOTPQuery = "INSERT INTO tbl_otp SET ?";
            console.log("Executing query:", insertOTPQuery, otp_data);

            const [result] = await database.query(insertOTPQuery, otp_data);

            console.log("Database Insert Result:", result);

            return callback({
                code: response_code.SUCCESS,
                message: "OTP sent successfully"
            }
            )
        } catch {
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "OTP generation error: "
            }, null);
        }
    };

    // OTP validation
    async validateOTP(request_data, callback) {
        try {
            const getOtpQuery = "SELECT otp FROM tbl_otp WHERE user_id = ?";
            const [otpResult] = await database.query(getOtpQuery, [request_data.user_id]);
            console.log("OTP Result:", otpResult);

            if (!otpResult || otpResult.length === 0) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "OTP not found"
                });
            }
            const storedOTP = otpResult[0].otp; // Extracting OTP value
            // Check if OTP matches
            if (storedOTP != request_data.otp) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "OTP incorrect"
                });
            }
            // mark OTP as verified
            const updateOtpQuery = "UPDATE tbl_otp SET verify = 1 WHERE user_id = ? and otp = ?";
            console.log("Executing Query:", updateOtpQuery);
            const [updateResult] = await database.query(updateOtpQuery, [request_data.user_id, request_data.otp]);
            console.log("Update Query Result:", updateResult);

            // Check if any row was affected
            if (updateResult.affectedRows === 0) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Failed to update OTP verification"
                });
            }
            callback({
                code: response_code.SUCCESS,
                message: "OTP verified successfully"
            });
        }
        catch {
            callback({
                code: response_code.OPERATION_FAILED,
                message: "OTP validation error: "
            }, null);
        }
    };

    async checkUserVerification(request_data, callback) {
        try {
            const checkQuery = "SELECT verify FROM tbl_otp WHERE user_id = ?";
            const [otpResult] = await database.query(checkQuery, [request_data.user_id]);
            console.log("OTP Result:", otpResult);
            if (!otpResult || otpResult[0].verify != 1) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "User not verified"
                }, null);
            }
            const updateUserQuery = "UPDATE tbl_user SET steps_ = 2 WHERE user_id = ?";
            const [result] = await database.query(updateUserQuery, [request_data.user_id]);
            console.log("Update Query Result:", result);
            callback({
                code: response_code.SUCCESS,
                message: "User is verified and can proceed"
            });
        } catch (error) {  // Fix: Added 'error' parameter
            console.error("Verification check failed:", error.message);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Verification check failed: " + error.message
            });
        }

    };

    async updateUserProfile(request_data, callback) {
        // Insert new user if no existing record found
        try {
            const user_data = {
                user_name: request_data.user_name,
                fname: request_data.fname,
                lname: request_data.lname,
                about: request_data.about,
                steps_: 3
            };

            const updatedUser = await common.updateUserInfo(request_data.user_id, user_data);

            if (userResult[0].steps_ != 2) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Please verify your OTP before updating your profile"
                });
            } 

            callback({
                code: response_code.SUCCESS,
                message: "Profile updated successfully",
                user: updatedUser
            });



        } catch (error) {
            callback({
                code: response_code.OPERATION_FAILED,
                message: "Profile update failed"
            }, null);
        }
    }

    //forget password
    async forgotPassword(request_data, callback) {
        try {
            let field, email;

            // Determine whether to use email or phone number
            if (request_data.email_id) {
                field = 'email_id';
                email = request_data.email_id;
            } else if (request_data.phone_number) {
                field = 'phone_number';
                email = request_data.phone_number;
            } else {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Email or phone number is required"
                });
            }

            const selectQuery = `SELECT user_id, email_id, phone_number FROM tbl_user WHERE ${field} = ?`;
            // console.log("Executing Query:", selectQuery);
            // Execute the query
            const [result] = await database.query(selectQuery, [email]);
            console.log("Query Result:", result);
            const user = result[0];
            // Check if OTP matches
            // Verify email/phone matches the request
            if (field === 'email_id' && user.email_id !== request_data.email_id) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Email does not exist"
                });
            } else {
                callback({
                    code: response_code.SUCCESS,
                    message: "User registered, please verify OTP",
                    user_id: user.user_id
                });
            }

        } catch (error) {
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    // reset Password - updated the tbl_user table with new password
    async resetPassword(request_data, callback) {
        try {
            if (!request_data.passwords) {
                return callback({
                    code: 400,
                    message: "Password is required"
                });
            }                                         
            const passwordHash = md5(request_data.passwords || ""); // Hash the password
            const updateQuery = "UPDATE tbl_user SET passwords = ? WHERE user_id = ?";
            const [result] = await database.query(updateQuery, [passwordHash, request_data.user_id]);
            console.log("Update Query Result:", result);

            if (result.affectedRows === 0) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Failed to update password"
                });
            }
            callback({
                code: response_code.SUCCESS,
                message: "Password updated successfully"
            });
        } catch (error) {
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    async changePassword(request_data, callback) {
        try {
            let oldPassword = request_data.old_password; // Old password from user input
            let newPassword = request_data.new_password; // New password from user input

            // Hash the passwords
            const oldPasswordHash = md5(oldPassword || "");
            const newPasswordHash = md5(newPassword || "");

            const selectQuery = `SELECT passwords FROM tbl_user WHERE user_id = ?`;
            const [result] = await database.query(selectQuery, [request_data.user_id]);

            if (result[0].passwords !== oldPasswordHash) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Old password is incorrect"
                });
            }
            if (oldPasswordHash === newPasswordHash) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Old password and new password should not be same"
                });
            }
            const updateQuery = "UPDATE tbl_user SET passwords = ? WHERE user_id = ?";
            const [updateResult] = await database.query(updateQuery, [newPasswordHash, request_data.user_id]);
            // Check if the update was successful
            if (updateResult.affectedRows === 0) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Failed to update password"
                });
            }
            callback({
                code: response_code.SUCCESS,
                message: "Password updated successfully"
            });


        } catch (error) {
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    // login
    async login(request_data, callback) {
        try {
            let field = 'email_id';
            let email = request_data.email_id;

            if (!email) {
                field = 'phone_number';
                email = request_data.phone_number;
            }

            const passwordHash = md5(request_data.passwords || ""); // Hash the password

            const selectQuery = `SELECT *, user_id FROM tbl_user WHERE ${field} = ? AND passwords = ?`;
            const condition = [email, passwordHash];

            console.log("Executing Query:", selectQuery);
            console.log("Query Parameters:", condition);

            // Execute the query
            const [result] = await database.query(selectQuery, condition);

            console.log("Query Result:", result);

            if (result.length > 0) {
                let user = result[0];

                if (user.is_active == 1) {
                    return callback({
                        code: response_code.SUCCESS,
                        message: "Login successful",
                        data: user
                    });
                } else {
                    return callback({
                        code: response_code.ACCOUNT_INACTIVE,
                        message: "Account is inactive"
                    });
                }
            } else {
                return callback({
                    code: response_code.INVALID_CREDENTIALS,
                    message: "Invalid email or password"
                });
            }
        } catch (error) {
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    // deals on demands apis
    //category list
    async categoryList(request_data, callback) {
        try{
            const selectQuery = `select c.category_id,c.category_name,i.image_name from tbl_category c 
            left join tbl_image i on c.category_id = i.image_id
            where c.is_active = 1  and c.is_deleted = 0`;
            const [result] = await database.query(selectQuery);
            console.log("Query Result:", result);
            if(result.length>0){
                return callback({
                    code: response_code.SUCCESS,
                    message: "Category list",
                    data: result
                })
            }
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Category not found"
            });
        }catch (error) {
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    //avalaible deals list based on distance
    async availableDealsList(request_data, callback) {
        try{
            const selectQuery = `select concat(u.fname, ' ', u.lname) as user_name,i.image_name as post_image,
                                p.title as post_title, date_format(p.created_at, '%d %b, %Y at %h:%i %p') as formatted_date, 
                                p.latitude , p.longitude,
                                p.comment_cnt as total_comments
                                from tbl_deal p inner join tbl_user u on p.user_id = u.user_id
                                left join tbl_image i on p.image_id = i.image_id
                                where  p.is_active = 1  and p.is_deleted = 0`;
            const [result] = await database.query(selectQuery);
            if(result.length>0){
                return callback({
                    code: response_code.SUCCESS,
                    message: "Available deals list",
                    data: result
                })
            }
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Deals not found"
            });
        }catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    //deals_detials_page
    async dealsDetailsPage(request_data, callback) {
        try{
            const selectQuery = `SELECT 
                                                    i.image_name AS post_image,
                                                    c.category_name, 
                                                    p.title, 
                                                    p.descriptions, 
                                                    p.comment_cnt AS total_comments,
                                                    CONCAT(u.fname, ' ', u.lname) AS posted_by_name, 
                                                    DATE_FORMAT(p.created_at, '%d %b, %Y at %h:%i %p') AS formatted_date,
                                                    CONCAT(p.latitude, ', ', p.longitude) AS location, 
                                                    GROUP_CONCAT(t.tags SEPARATOR ', ') AS deal_tags
                                                FROM tbl_deal p
                                                INNER JOIN tbl_user u ON p.user_id = u.user_id
                                                INNER JOIN tbl_category c ON p.category_id = c.category_id
                                                LEFT JOIN tbl_image i ON p.image_id = i.image_id
                                                LEFT JOIN tbl_deal_tag pt ON p.deal_id = pt.deal_id
                                                LEFT JOIN tbl_tags t ON pt.tag_id = t.tag_id
                                                WHERE p.deal_id = ? AND p.is_active = 1 AND p.is_deleted = 0
                                                GROUP BY p.deal_id;`;
        const dealId = request_data.deal_id;
        
        const [result] = await database.query(selectQuery, [dealId]);
        if(result.length>0){
            return callback({
                code: response_code.SUCCESS,
                message: "Deals details",
                data: result
            })
        }
        return callback({
            code: response_code.OPERATION_FAILED,
            message: "Deals details not found"
        });
        }
        catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
    }

    //category deal_count
    async categoryDealCount(request_data, callback) {
        try{
            const selectQuery = `SELECT c.category_id, c.category_name, i.image_name, COUNT(d.deal_id) AS deal_count
                                    FROM tbl_category c
                                    LEFT JOIN tbl_image i ON c.category_id = i.image_id
                                    LEFT JOIN tbl_deal d ON c.category_id = d.category_id
                                    WHERE c.is_active = 1  
                                    AND c.is_deleted = 0 
                                    GROUP BY c.category_id, c.category_name, i.image_name;`;
       
        const [result] = await database.query(selectQuery);
        if(result.length>0){
            
            return callback({
                code: response_code.SUCCESS,
                message: "Category wise deals count",
                data: result
            })
        }
        return callback({
            code: response_code.OPERATION_FAILED,
            message: "Category wise deals count not found"
        });
        }
        catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
     }

    async deals4u(request_data, callback) {
        try{
            const selectQuery = `SELECT c.category_id,c.category_name,u.user_id,i.image_name AS category_image,
            CONCAT(u.fname, ' ', u.lname) AS user_name,ui.image_name AS user_image,pi.image_name AS post_image,p.title AS post_title,
            DATE_FORMAT(p.created_at, '%d %b, %Y at %h:%i %p') AS formatted_date,p.latitude,p.longitude,p.comment_cnt AS total_comments
                                                            FROM tbl_category c
                                                            INNER JOIN tbl_image i ON c.category_id = i.image_id
                                                            INNER JOIN tbl_deal p ON c.category_id = p.category_id
                                                            INNER JOIN tbl_user u ON p.user_id = u.user_id
                                                            LEFT JOIN tbl_image ui ON u.profile_pic = ui.image_id
                                                            LEFT JOIN tbl_image pi ON p.image_id = pi.image_id
                                                            WHERE c.category_name = ?
                                                            AND p.is_active = 1 
                                                            AND p.is_deleted = 0;`;
                                                        
            
        const [result] = await database.query(selectQuery, [request_data.category_name]);
        if(result.length>0){
            
            return callback({
                code: response_code.SUCCESS,
                message: "deals for u",
                data: result
            })
        }
        return callback({
            code: response_code.OPERATION_FAILED,
            message: "no deals for u found"
        });
        }
        catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
     }

    //deals comment with details
    async dealComment(request_data, callback) {
        try{
            const selectQuery = `SELECT 
                                                            p.title AS deal_title,
                                                            CONCAT(u.fname, ' ', u.lname) AS posted_by_user,
                                                            DATE_FORMAT(p.created_at, '%d %b, %Y at %h:%i %p') AS deal_posted_date,
                                                            c.comment_text AS comment,
                                                            CONCAT(cu.fname, ' ', cu.lname) AS commenter_name,
                                                            DATE_FORMAT(c.created_at, '%d %b, %Y at %h:%i %p') AS comment_date,
                                                            i.image_name AS commenter_image 
                                                        FROM tbl_deal p
                                                        INNER JOIN tbl_user u ON p.user_id = u.user_id
                                                        INNER JOIN tbl_comment_deal c ON p.deal_id = c.deal_id
                                                        INNER JOIN tbl_user cu ON c.user_id = cu.user_id
                                                        INNER JOIN tbl_image_deal_relation r ON p.deal_id = r.deal_id
                                                        INNER JOIN tbl_image i ON i.image_id = r.image_id
                                                        WHERE p.deal_id = ?
                                                        AND c.is_active = 1 
                                                        AND c.is_deleted = 0
                                                        ORDER BY c.created_at DESC;`;
                                                        
        const [result] = await database.query(selectQuery, [request_data.deal_id]);
        if(result.length>0){
            
            return callback({
                code: response_code.SUCCESS,
                message: "deals comments",
                data: result
            })
        }
        return callback({
            code: response_code.OPERATION_FAILED,
            message: "comments not found"
        });
        }
        catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
     }

     //user profile
     async user_profile(request_data,callback){
        try{
            const selectQuery= `SELECT CONCAT(u.fname, ' ', u.lname) AS user_name, 
                                            b.business_name, 
                                            u.followers_count, 
                                            u.following_count, 
                                            u.post_cnt AS total_posts,
                                            u.about AS about_me, 
                                            GROUP_CONCAT(DISTINCT i.image_name) AS post_images
                                        FROM tbl_user u
                                        LEFT JOIN tbl_business b ON u.user_id = b.user_id
                                        LEFT JOIN tbl_post p ON u.user_id = p.user_id
                                        LEFT JOIN tbl_image_post_relation ipr ON p.post_id = ipr.post_id  -- Linking posts to images
                                        LEFT JOIN tbl_image i ON ipr.image_id = i.image_id  -- Fetching image names
                                        WHERE u.user_id = ?
                                        AND u.is_active = 1
                                        AND u.is_deleted = 0
                                        GROUP BY u.user_id, u.fname, u.lname,b.business_name, 
                                                u.followers_count, u.following_count, u.post_cnt, u.about;`
            const [result] = await database.query(selectQuery, [request_data.user_id]);
            if(result.length>0){
                
                return callback({
                    code: response_code.SUCCESS,
                    message: "user profile",
                    data: result
                })
            }
                            
        }catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
        }
     }

    async add_deal(request_data, user_id, callback){
        try {
            if (!user_id) {
                throw new Error("User ID is required");
            }
    
            let image_id = null;
            let category_id = null;
            try {
                
                if (request_data.image_name ) {
                    const [imageResult] = await database.query(
                        "INSERT INTO tbl_image (image_name) VALUES (?)",
                        [request_data.image_name]
                    );
                    image_id = imageResult.insertId;
                }
                if (request_data.category_name) {
                    const [existingCategory] = await database.query(
                        "SELECT category_id FROM tbl_category WHERE category_name = ?",
                        [request_data.category_name]
                    );
    
                    if (existingCategory.length > 0) {
                        category_id = existingCategory[0].category_id;
                    }
                    // } else {
                    //     const [categoryResult] = await database.query(
                    //         "INSERT INTO tbl_category (category_name, image_id) VALUES (?, ?)",
                    //         [request_data.category_name, image_id]
                    //     );
                    //     category_id = categoryResult.insertId;
                    // }
                }
    
                const dealQuery = `
                    INSERT INTO tbl_deal 
                    (user_id, title, descriptions, website_url, category_id, latitude, longitude, image_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const dealParams = [
                    user_id,
                    request_data.title,
                    request_data.descriptions,
                    request_data.website_url || null,
                    category_id,
                    request_data.latitude || null,
                    request_data.longitude || null,
                    image_id
                ];
    
                const [dealResult] = await database.query(dealQuery, dealParams);
                const deal_id = dealResult.insertId;
    
                if (request_data.tags && Array.isArray(request_data.tags) && request_data.tags.length > 0) {
                    for (const tag of request_data.tags) {
                        if (typeof tag !== 'string') continue;
                        
                        const [existingTags] = await database.query(
                            "SELECT tag_id FROM tbl_tags WHERE tags = ?",
                            [tag.trim()]
                        );
    
                        let tag_id;
                        if (existingTags.length > 0) {
                            tag_id = existingTags[0].tag_id;
                            await database.query(
                                "UPDATE tbl_tags SET tags_cnt = tags_cnt + 1 WHERE tag_id = ?",
                                [tag_id]
                            );
                        } else {
                            const [newTag] = await database.query(
                                "INSERT INTO tbl_tags (tags, tags_cnt) VALUES (?, 1)",
                                [tag.trim()]
                            );
                            tag_id = newTag.insertId;
                        }
    
                        // Link tag to deal
                        await database.query(
                            "INSERT INTO tbl_deal_tag (deal_id, tag_id) VALUES (?, ?)",
                            [deal_id, tag_id]
                        );
                    }
                }
    
                
                const [dealData] = await database.query(
                    `SELECT d.*, GROUP_CONCAT(t.tags) as tags 
                     FROM tbl_deal d 
                     LEFT JOIN tbl_deal_tag dt ON d.deal_id = dt.deal_id 
                     LEFT JOIN tbl_tags t ON dt.tag_id = t.tag_id 
                     WHERE d.deal_id = ?
                     GROUP BY d.deal_id`,
                    [deal_id]
                );
    
                return callback({
                    code: response_code.SUCCESS,
                    message: "Deal Added Successfully",
                    data: dealData[0]
                });
    
            } catch (error) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: error
                });
            }
    
        } catch (error) {
            console.error('Error in add_deal:', error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: error.message || "Failed to add deal"
            });
        }
    }

    async create_post(request_data,user_id,callback) {
        try{
            if (!user_id) {
                throw new Error("User ID is required");
            }
            let category_id=null;
            if(request_data.category_name){
                const [existingCategory]=await database.query(
                    "select category_id from tbl_category where category_name = ?",
                    [request_data.category_name]
                );
                if(existingCategory.length>0){
                    category_id=existingCategory[0].category_id;
                }
            }
            const postQuery=`INSERT INTO tbl_post 
            (user_id, title, descriptions, latitude, longitude, category_id, comment_cnt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`

            const postParams=[
                user_id,
                request_data.title,
                request_data.descriptions || null,
                request_data.latitude || null,
                request_data.longitude || null,
                category_id,
                0
            ]
            const [postResult] = await database.query(postQuery,postParams);
            const post_id = postResult.insertId;
            const [postData]= await database.query(
                `SELECT * FROM tbl_post WHERE post_id = ?`, [post_id]
            );

            return callback({
                code: response_code.SUCCESS,
                message: "Post Created Successfully",
                data: postData[0]
            });

        }catch(error){
            console.error("Database Error:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Database error occurred: " + (error.sqlMessage || error.message)
            });
    }


     
    }

    async edit_profile(request_data, user_id, callback) {
        try {
            if (!user_id) {
                return callback({
                    code: response_code.BAD_REQUEST,
                    message: "User ID is required"
                });
            }
    
            const allowedFields = ["user_name", "fname", "lname", "about", "profile_pic"];
            let updateFields = [];
            let values = [];
    
            for (let key of allowedFields) {
                if (request_data[key] !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(request_data[key]);
                }
            }
    
            if (updateFields.length === 0) {
                return callback({
                    code: response_code.NO_CHANGE,
                    message: "No valid fields provided for update"
                });
            }

            updateFields.push("updated_at = CURRENT_TIMESTAMP()");
            values.push(user_id);
    
            const updateQuery = `
                UPDATE tbl_user 
                SET ${updateFields.join(", ")}
                WHERE user_id = ? AND is_active = 1 AND is_deleted = 0
            `;
    
            const [result] = await database.query(updateQuery, values);
    
            if (result.affectedRows > 0) {
                return callback({
                    code: response_code.SUCCESS,
                    message: "Profile updated successfully"
                });
            } else {
                return callback({
                    code: response_code.NOT_FOUND,
                    message: "User not found or no changes applied"
                });
            }
    
        } catch (error) {
            console.log(error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Error updating profile"
            });
        }
    }

    async get_followers(user_id, callback) {
        try {

            var select_user_query = "SELECT * FROM tbl_user WHERE user_id = ?";
            const [info] = await database.query(select_user_query, [user_id]);

            if (!info.length ) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Login required"
                });
            }

            if (!user_id) {
                return callback({
                    code: response_code.BAD_REQUEST,
                    message: "User ID is required"
                });
            }

            const query = `
                SELECT 
                    u.user_id, 
                    u.user_name, 
                    u.profile_pic AS profile_image
                FROM tbl_follow f
                JOIN tbl_user u ON f.user_id = u.user_id
                WHERE f.follow_id = ? AND f.is_active = 1 AND f.is_deleted = 0;
            `;

            const [results] = await database.query(query, [user_id]);

            return callback({
                code: response_code.SUCCESS,
                message: "Followers fetched successfully",
                data: results
            });

        } catch (error) {
            console.log(error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Error fetching followers"
            });
        }
    }

    async get_following(user_id, callback) {
        try {
            var select_user_query = "SELECT * FROM tbl_user WHERE user_id = ?";
            const [info] = await database.query(select_user_query, [user_id]);

            // Check if user is logged in
            if (!info.length || info[0].is_login === 0) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Login required"
                });
            }

            if (!user_id) {
                return callback({
                    code: response_code.BAD_REQUEST,
                    message: "User ID is required"
                });
            }

            const query = `
                SELECT 
                    u.user_id, 
                    u.user_name, 
                    u.profile_pic AS profile_image
                FROM tbl_follow f
                JOIN tbl_user u ON f.follow_id = u.user_id
                WHERE f.user_id = ? AND f.is_active = 1 AND f.is_deleted = 0;
            `;

            const [results] = await database.query(query, [user_id]);

            return callback({
                code: response_code.SUCCESS,
                message: "Following fetched successfully",
                data: results
            });

        } catch (error) {
            console.log(error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Error fetching following"
            });
        }
    }
    // async get_following(user_id, callback) {
    //     try {
    //         var select_user_query = "SELECT * FROM tbl_user WHERE user_id = ?";
    //         const [info] = await database.query(select_user_query, [user_id]);

    //         // Check if user is logged in
    //         if (!info.length || info[0].is_login === 0) {
    //             return callback({
    //                 code: response_code.OPERATION_FAILED,
    //                 message: "Login required"
    //             });
    //         }

    //         if (!user_id) {
    //             return callback({
    //                 code: response_code.BAD_REQUEST,
    //                 message: "User ID is required"
    //             });
    //         }

    //         const query = `
    //             SELECT 
    //                 u.user_id, 
    //                 u.user_name, 
    //                 u.profile_pic AS profile_image
    //             FROM tbl_follow f
    //             JOIN tbl_user u ON f.follow_id = u.user_id
    //             WHERE f.user_id = ? AND f.is_active = 1 AND f.is_deleted = 0;
    //         `;

    //         const [results] = await database.query(query, [user_id]);

    //         return callback({
    //             code: response_code.SUCCESS,
    //             message: "Following fetched successfully",
    //             data: results
    //         });

    //     } catch (error) {
    //         console.log(error);
    //         return callback({
    //             code: response_code.OPERATION_FAILED,
    //             message: "Error fetching following"
    //         });
    //     }
    // }

    async contact_us(request_data, user_id, callback) {
        try {

            if (!request_data.title || !request_data.email_id || !request_data.message) {
                return callback({
                    code: response_code.BAD_REQUEST,
                    message: "Title, Email ID, and Message are required"
                });
            }
    
            const contact_us = {
                title: request_data.title,
                email_id: request_data.email_id,
                message: request_data.message,
                user_id: user_id
            };
    
            const insertQuery = "INSERT INTO tbl_contact_us SET ?";
    
            const [result] = await database.query(insertQuery, [contact_us]);
    
            if (result.affectedRows > 0) {
                return callback({
                    code: response_code.SUCCESS,
                    message: "Contact request submitted successfully",
                    data: { contact_id: result.insertId }
                });
            } else {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Failed to submit contact request"
                });
            }
    
        } catch (error) {
            console.error("Error in contact_us:", error);
            return callback({
                code: response_code.OPERATION_FAILED,
                message: "Error submitting contact request"
            });
        }
    }  
    async delete_account(request_data, user_id, callback) {
        try {

            var select_user_query = "SELECT * FROM tbl_user WHERE user_id = ?";
            const [info] = await database.query(select_user_query, [user_id]);

            // Check if user is logged in
            if (!info.length || info[0].is_login === 0) {
                return callback({
                    code: response_code.OPERATION_FAILED,
                    message: "Login required"
                });
            }
            
            const selectUserQuery = "SELECT * FROM tbl_user WHERE user_id = ? AND is_deleted = 0";
            const [user] = await database.query(selectUserQuery, [user_id]);
    
            if (!user.length) {
                return callback({
                    code: response_code.NOT_FOUND,
                    message: "User not found or already deleted"
                });
            }
    
            const deleteUserQuery = "UPDATE tbl_user SET is_deleted = 1, is_active = 0, is_login = 0 WHERE user_id = ?";
            await database.query(deleteUserQuery, [user_id]);
    
            const deleteDealsQuery = "UPDATE tbl_deal SET is_deleted = 1, is_active=0 WHERE user_id = ?";
            await database.query(deleteDealsQuery, [user_id]);
    
            const deleteCommentsQuery = "UPDATE tbl_comment_deal SET is_deleted = 1 WHERE user_id = ?";
            await database.query(deleteCommentsQuery, [user_id]);
    
            const deleteFollowQuery = "UPDATE tbl_follow SET is_deleted = 1 WHERE user_id = ? OR follow_id = ?";
            await database.query(deleteFollowQuery, [user_id, user_id]);
    
            return callback({
                code: response_code.SUCCESS,
                message: "User account deleted successfully"
            });
    
        } catch (error) {
            return callback({
                code: response_code.OPERATION_FAILED,
                message: error.sqlMessage || "Error deleting account"
            });
        }
    }
}

module.exports = new UserModel();
