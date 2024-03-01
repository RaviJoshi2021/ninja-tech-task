var Users = require('../models/userModel');
var utils = require('../config/utils');
var md5 = require('md5');
var validator = require("email-validator");

exports.login = async(req, res) => {
    try {
        const request_params = [{ name: 'email', type: 'string' }, { name: 'password', type: 'string' }]
        const response = utils.check_request_params(req.body, request_params);
        if (response.success) {
            let { email, password } = req.body;
            const is_valid = await validator.validate(email);
            console.log(is_valid)
            if (!is_valid) {
                return res.status(400).send({
                    sucess: false,
                    message: "Invalid email. Please enter valid email"
                })
            }
            const user = await Users.findOne({ email: email });
            if (user) {
                password = md5(password);
                if (user.password == password) {
                    const token = utils.createJWTToken(user._id, user.role);
                    res.setHeader('Authorization', token);
                    res.header('Authorization', token);
                    return res.status(200).send({
                        success: true,
                        message: `Login Success`,
                        data: user
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        message: `Invalid password`
                    });
                }
            } else {
                return res.status(400).send({
                    success: false,
                    message: `Email not register`
                });
            }
        } else {
            return res.status(400).send(response)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: "Ooop's Server Internal error!!!"
        });

    }
}

exports.signUp = async(req, res) => {
    try {
        console.log(req.body)
        const request_params = [
            { name: 'first_name', type: 'string' },
            { name: 'last_name', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'password', type: 'string' },
            { name: 'role', type: 'string' }
        ];
        const response = utils.check_request_params(req.body, request_params);
        console.log(response)
        if (response.success) {
            let { first_name, last_name, email, password, role } = req.body;
            const is_valid = await validator.validate(email);
            console.log(is_valid)
            if (is_valid == null) {
                return res.status(400).send({
                    sucess: false,
                    message: "Invalid email"
                })
            }
            const user = await Users.findOne({ email: email });
            console.log(user)
            if (user) {
                return res.status(400).send({
                    success: false,
                    message: `SignUp Failed because email already register`,
                });
            }
            password = md5(password)
            var new_user = new Users({
                first_name,
                last_name,
                email,
                password,
                role
            });
            await new_user.save()
            return res.status(200).send({
                success: true,
                data: {
                    first_name,
                    last_name,
                    email,
                    password
                }
            })
        } else {
            return res.status(400).send(response)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: "Ooop's Server Internal error!!!"
        });
    }
}