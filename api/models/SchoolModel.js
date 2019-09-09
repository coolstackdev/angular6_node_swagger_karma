const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    number: {
        type: Number
    },
    country: {
        type: String,
        required: true,
        default: "pays"
    },
    city: {
        type: String,
        required: true,
        default: "ville"
    },
    address: {
        type: String,
        required: true,
        default: "adresse"
    },
    contactName: {
        type: String,
        required: true,
        default: "personne référence"
    },
    contactPosition: {
        type: String,
        required: true,
        default: "position"
    },
    contactPhone: {
        type: String,
        required: true,
        default: "numéro de téléphone"
    },
    contactEmail: {
        type: String,
        required: true,
        default: "e-mail"
    },
        translation:[]
    },
    {timestamps: true});

module.exports = mongoose.model('School', SchoolSchema);
