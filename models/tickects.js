const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ticketSchema = new Schema({
    content: { type: String, required: true },
    url: { type: String, default: "" },
    contentType: { type: String, enum: ['text', 'image', 'video'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    remarks: [{
        body: String,
        by: { type: Schema.Types.ObjectId, ref: 'user' },
        date: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['submitted', 'approved', 'disapproved', 'pending'], default: 'submitted' },
    currentStage: { type: String, enum: ['employee', 'manager', 'admin'], required: true },
    history: [{
        stage: String,
        action: { type: String, enum: ['submitted', 'approved', 'disapproved', 'remarked'] },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now }
    }]
});
module.exports = mongoose.model('Ticket', ticketSchema);