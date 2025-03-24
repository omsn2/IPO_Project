const express = require("express");
const Ipo = require("../models/IPO_DataModel"); 
const ensureAdmin = require("../middleware/adminAuth");
const ensureAuthenticated = require("../middleware/auth");

const router = express.Router();



// ADMIN ONLY: Create IPO
router.post("/", ensureAdmin, async (req, res) => {
    try {
        const newIpo = new Ipo(req.body);
        await newIpo.save();
        res.status(201).json({ message: "IPO created successfully", newIpo });
    } catch (error) {
        res.status(500).json({ message: "Error adding IPO", error });
    }
});

// ADMIN ONLY: Update IPO
router.put("/:id", ensureAdmin, async (req, res) => {
    try {
        const updatedIpo = await Ipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedIpo) return res.status(404).json({ message: "IPO not found" });
        res.status(200).json({ message: "IPO updated successfully", updatedIpo });
    } catch (error) {
        res.status(500).json({ message: "Error updating IPO", error });
    }
});

// ADMIN ONLY: Delete IPO
router.delete("/:id", ensureAdmin, async (req, res) => {
    try {
        const deletedIpo = await Ipo.findByIdAndDelete(req.params.id);
        if (!deletedIpo) return res.status(404).json({ message: "IPO not found" });
        res.status(200).json({ message: "IPO deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting IPO", error });
    }
});



module.exports = router;
