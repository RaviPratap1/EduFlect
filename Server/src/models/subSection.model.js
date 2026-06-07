const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true,
    },
    content: {
        type: String,
        trim: true,
    },
    videoUrl: {
        type: String,
        trim: true,
    },
    duration: {
        type: Number,
        default: 0
    }, // in minutes
    order: {
        type: Number,
        default: 0
    },
}, { timestamps: true });


module.exports = mongoose.model('SubSection', subSectionSchema);