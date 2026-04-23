const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// @route   POST /api/items
// @desc    Add a new item
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { itemName, description, type, location, date, contactInfo } = req.body;
        const newItem = new Item({
            itemName,
            description,
            type,
            location,
            date,
            contactInfo,
            user: req.user.id
        });
        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/items
// @desc    Get all items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/items/search
// @desc    Search items by name or category (type)
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        let query = {};
        if (name) {
            query.itemName = { $regex: name, $options: 'i' };
        }
        const items = await Item.find(query).sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user', 'name email');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check if user owns item
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        item = await Item.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Check if user owns item
        if (item.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
