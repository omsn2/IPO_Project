const express = require('express')
const Ipo = require("../models/IPO_DataModel");
const ensureAuthenticated = require("../middleware/auth");
const subscription = require('../models/subscriptionModel');

const router = express.Router();



// USER APPLIES FOR IPO
router.post("/subscribe", ensureAuthenticated, async (req, res) => {
    try {
        const { companyName, shareApplied } = req.body;

        const userId = req.user._id;

        //  Find IPO by company name
        const ipo = await Ipo.findOne({ companyName });
        if (!ipo) {
            return res.status(404).json({ message: "IPO not found" });
        }

        //  Check if the user already subscribed
        const existingSubscription = await subscription.findOne({ userId, ipoId: ipo._id });

        if (existingSubscription) {
            return res.status(400).json({ message: "You have already applied for this IPO" });
        }

        //  Create new Subscription
        const newSubscription = new subscription({
            userId,
            ipoId: ipo._id,
            shareApplied
        });

        await newSubscription.save();
        res.status(201).json({ message: `IPO subscription for ${companyName} submitted successfully!` });

    } catch (error) {
        res.status(500).json({ message: "Error subscribing to IPO", error });
    }
});



// filter 
// IPO Filtering
router.get("/filter",ensureAuthenticated ,async (req, res) => {
    try {
        const { status, openDate, closedDate, companyName } = req.query;

        //extract user
        const user = req.user;

        let query = {};

        if (status) query.status = status;
        if (openDate) query.openDate = { $gte: new Date(openDate) };
        if (closedDate) query.closedDate = { $lte: new Date(closedDate) };
        
        //Allow partial match for companyName (case- insensitive)
        if (companyName) query.companyName = new RegExp(companyName , "i");
        
        // Debugging: Check query
        console.log("Query being used:", query); 


          //  Admin can see ALL filtered IPOs
          if (user.isAdmin === true) {
            console.log("Admin Access Granted");
            const ipos = await Ipo.find(query);
            return res.status(200).json(ipos);
        }

        const ipos = await Ipo.find(query);
        res.status(200).json(ipos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching IPOs", error });
    }
});


// PUBLIC: Get all IPOs
router.get("/", async (req, res) => {
   try {
        const ipos = await Ipo.find();
        res.status(200).json(ipos);
   } catch (error) {
        res.status(500).json({ message: "Error fetching IPOs", error });
   }
});

// PUBLIC: Get IPO by ID
router.get("/:id",ensureAuthenticated , async (req, res) => {
    try {
        const ipo = await Ipo.findById(req.params.id);
        if (!ipo) return res.status(404).json({ message: "IPO not found" });
        res.status(200).json(ipo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching IPO", error });
    }
});




module.exports = router;