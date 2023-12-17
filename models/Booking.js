const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var bookingSchemaful = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    workshop: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    cardnumber: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
var Booking = mongoose.model('booking', bookingSchemaful);

module.exports = Booking;