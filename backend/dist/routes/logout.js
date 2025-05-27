"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//ścieżka do wylogowania użytkownika
const router = (0, express_1.Router)();
router.post('/', (req, res) => {
    res.clearCookie('token', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // change to true if production and HTTPS
    });
    res.status(200).json({ message: 'Logged out successfully' });
});
exports.default = router;
