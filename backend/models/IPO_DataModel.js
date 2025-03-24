const mongoose = require('mongoose');

const ipoSchema = new mongoose.Schema({
    companyName: String,
    logoUrl: String,
    priceBand: String,
    openDate: Date,
    closedDate: Date,
    issueSize: String,
    issueType: String,
    Listingdate: Date,
    status: String,  // Upcoming, ongoing , Closed
    ipoPrince: Number,
    listingPrice: Number,
    listingGain: Number,
    cmp: Number, // Current Market Price
    currentReturn: Number,
    rhpPdfUrl: String,
    drhPdfUrl: String,


});

module.exports = mongoose.model("Ipo", ipoSchema );