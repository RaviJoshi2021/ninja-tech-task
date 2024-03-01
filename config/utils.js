const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require("path");
const nodemailer = require('nodemailer');

exports.check_request_params = (request_data_body, params_array, response) => {
    var missing_param = '';
    var is_missing = false;
    var invalid_param = '';
    var is_invalid_param = false;

    params_array.forEach(function(param) {
        if (request_data_body[param.name] == undefined) {
            missing_param = param.name;
            is_missing = true;
        } else {
            if (param.type && typeof request_data_body[param.name] !== param.type) {
                is_invalid_param = true;
                invalid_param = param.name;
            }
        }
    });
    if (is_missing) {
        console.log("missing_param: " + missing_param)
        return { success: false, error_description: `${missing_param}  parameter missing` };
    } else if (is_invalid_param) {
        console.log("invalid_param: " + invalid_param)
        return { success: false, error_description: `${invalid_param}  parameter invalid` };
    } else {
        return { success: true };
    }
}
exports.createJWTToken = (_id, role) => {
    try {
        return jwt.sign({ userId: _id, role: role }, process.env.SECRET_KEY);
    } catch (err) {
        console.log(err)
    }
}

exports.moveFile = async(oldName, newName) => {
    try {
        const checkfile = fs.readFileSync(path.join(`${__dirname}/../uploads/${oldName}`));
        if (checkfile) {
            fs.writeFileSync(`./uploads/${newName}`, checkfile)
            fs.unlinkSync(`./uploads/${oldName}`)
        } else {
            console.log(`file not exist`)
        }
    } catch (err) {
        console.log(err)
    }
}

exports.send_notification = async(ticket, user) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL, //'ravijoshi2025@gmail.com',
                pass: process.env.SMTP_PASSWORD
            }
        });
        const mailOptions = {
            from: 'ravijoshi2025@gmail.com',
            to: user.email,
            subject: `Your ticket ${ticket._id} has been updated`,
            text: `Your ticket with ID ${ticket._id} is now ${ticket.status}.`,
            html: `<p>Your ticket with ID <b>${ticket._id}</b> is now <b>${ticket.status}</b>.</p>`
        };
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

    } catch (error) {
        console.error('Error sending email: ', error);

    }

}