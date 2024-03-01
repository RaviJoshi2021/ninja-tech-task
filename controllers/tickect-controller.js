const utils = require('../config/utils');
const Ticket = require("../models/tickects");
var Users = require('../models/userModel');

//function for create ticket
exports.createTicket = async(req, res) => {
    try {
        const request_params = [
            { name: 'title', type: 'string' }, { name: 'contentType', type: 'string' }
        ];
        const response = utils.check_request_params(req.body, request_params);
        if (response.success) {
            const { title, contentType } = req.body;
            let url = '';
            if (req.file) {
                utils.moveFile(req.file.filename, `${req.file.originalname}`)
                url = `${process.env.DOMAIN}/uploads/${req.file.originalname}`
            }
            const newTicket = new Ticket({
                content: title,
                url: url,
                contentType: contentType,
                createdBy: req.user.userId,
                currentStage: 'employee' // First stage of the process
            });
            await newTicket.save();
            return res.status(200).send({
                success: true,
                message: "Ticket successfull created",
                data: newTicket
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

//function for take review
exports.remarks = async(req, res) => {
    try {
        const request_params = [
            { name: 'remark', type: 'string' }
        ];
        const response = utils.check_request_params(req.body, request_params);
        if (response.success) {
            const { id } = req.params;
            const { remark } = req.body;
            const ticket = await Ticket.findById(id);
            if (!ticket) {
                return res.status(400).send({
                    success: false,
                    message: `No ticket`
                })
            }
            if (ticket.currentStage !== req.user.role) {
                return res.status(403).send('Not authorized to add remarks at this stage');
            }
            ticket.remarks.push({ body: remark, by: req.user.id });
            await ticket.save();
            return res.status(200).send({
                success: true,
                message: `Remark successfully`,
                data: ticket
            });
        } else {
            return res.status(400).send(response)
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            success: false,
            message: "Ooop's Server Internal error!!!"
        });
    }
}

//function for update status
exports.statusChange = async(req, res) => {
    try {
        const request_params = [
            { name: 'status', type: 'string' } // "approved" or "disapproved"
        ];
        const response = utils.check_request_params(req.body, request_params);
        if (response.success) {
            const { id } = req.params;
            const { status } = req.body;
            const ticket = await Ticket.findById(id);
            if (!ticket) {
                return res.status(400).send({
                    success: false,
                    message: `No data ticket`
                });
            }
            if (ticket.currentStage === 'admin' && req.user.role !== 'admin') {
                return res.status(403).send('Only admins can approve at this stage');
            }
            ticket.status = status;
            ticket.history.push({
                stage: ticket.currentStage,
                action: status,
                by: req.user.id
            });
            if (status === 'approved') {
                if (ticket.currentStage === 'manager') {
                    ticket.currentStage = 'admin';
                } else if (ticket.currentStage === 'admin') {
                    // Notify client of approval
                }
            }
            await ticket.save();

            const userInfo = await Users.findOne({ role: req.user.role == 'admin' ? 'client' : 'admin' });
            utils.send_notification(ticket, userInfo)
            return res.status(200).send({
                success: true,
                message: `Status updated successfully`,
                data: ticket
            });
        } else {
            return res.status(400).send(response)
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            success: false,
            message: "Ooop's Server Internal error!!!"
        });
    }
}

//function for ticket detail
exports.ticketDetail = async(req, res) => {
    try {
        let ticket;
        if (req.user.role == 'admin' || req.user.role == 'client') {
            ticket = await Ticket.findById(req.params.id).populate('remarks.by', 'username');
        } else if (req.user.role == 'employee') {
            ticket = await Ticket.findById(req.params.id);
        }
        if (!ticket) {
            return res.status(404).send({ success: false, message: 'Ticket not found' });
        }
        return res.status(200).send({
            succuess: true,
            message: `ticket detail`,
            data: ticket
        });
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            success: false,
            message: "Ooop's Server Internal error!!!"
        });
    }
}

//function for ticket list
exports.list = async(req, res) => {
    try {
        let tickets;
        console.log(req.user.role)
        if (req.user.role == 'employee') {
            tickets = await Ticket.find({
                $or: [
                    { status: 'submitted', currentStage: 'employee' },
                    { status: 'pending', currentStage: 'employee' }
                ]
            });
        } else if (req.user.role == 'employee') {
            tickets = await Ticket.find({
                createdBy: req.user._id,
                status: { $ne: 'approved' } // Not fully approved
            });
        } else if (req.user.role == 'admin') {
            tickets = await Ticket.find();
        }
        return res.status(200).send({
            sucess: true,
            message: `Ticket list`,
            data: tickets
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            success: false,
            message: "Ooop's Server Internal error!!!"
        });
    }
}