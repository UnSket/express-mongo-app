const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const leadersSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    abbr: {
        type: String
    },
    designation: {
        type: String,
    },
    description: {
        type: String,
    },
    featured: {
        type: Boolean,
        default:false
    },
}, {
    timestamps: true
});

const Leader = mongoose.model('Leader', leadersSchema);

module.exports = Leader;
