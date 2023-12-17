const express = require('express');
const router = express.Router();
const bookings = require('../models/Booking');
const User = require('../models/User');

// Route for displaying the booking form
router.get('/submit', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.errorMessage = 'Please Login to Create Bookings';
            return res.redirect('/user/login');
        }

        res.render('booking', { userEmail: user.email });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

// handles booking count for workshop schedule
router.get('/schedule', async (req, res) => {
    try {
        const photographyBookingCount = await bookings.countDocuments({ workshop: 'Photography Workshop' });
        const codingBookingCount = await bookings.countDocuments({ workshop: 'Coding Workshop' });
        const cookingBookingCount = await bookings.countDocuments({ workshop: 'Cooking Workshop' });

        res.render('workshopschedule', {
            PhotographyWorkshop: photographyBookingCount,
            CodingWorkshop: codingBookingCount,
            CookingWorkshop: cookingBookingCount
        });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

// handling booking form submission
router.post('/submit', (req, res, next) => {
    if (!req.session.userId) {
        req.session.errorMessage = 'Please Login to Create Bookings';
        return res.redirect('/user/login');
    }
    bookings.create(req.body)
        .then((bookingscreated) => {
            res.render('success', { message: 'Booking successful' });
        })
        .catch((error) => {
            next(error);
        });
});

// displaying a list of all bookings
router.get('/bookings', (req, res, next) => {
    // Retrieve all booking documents using the Booking model
    bookings.find()
        .then((bookings) => {
            res.render('bookings-list', { bookings });
        })
        .catch((error) => {
            next(error);
        });
});

//displaying user bookings list
router.get('/userbookings', async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) {
        req.session.errorMessage = 'Please Login to View User Bookings';
        return res.redirect('/user/login');
    }

    try {
        const userbookings = await bookings.find({ email: user.email });
        res.render('userbookings-list', { userbookings }); 
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

// updateing bookings
router.post('/update/:bookingId', async (req, res) => {
    try {
        if (!req.session.userId) {
            req.session.errorMessage = 'Please Login to Update Bookings';
            return res.redirect('/user/login');
        }
        const bookingId = req.params.bookingId;
        const booking = await bookings.findById(bookingId);
        if (!booking) {
            return res.status(404).send('Booking not found.');
        }
        res.render('bookingUpdate', { booking });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

router.post('/updateform/:bookingId', async (req, res) => {
    try {
        if (!req.session.userId) {
            req.session.errorMessage = 'Please Login to Update Bookings';
            return res.redirect('/user/login');
        }
        const bookingId = req.params.bookingId;
        const updatedBookingData = req.body;

        const updatedBooking = await bookings.findByIdAndUpdate(
            bookingId,
            updatedBookingData,
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).send('Booking not found.');
        }

        res.render('updatesuccess', { message: 'Update Booking successful' });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

//delete bookings
router.post('/delete/:bookingId', async (req, res) => {
    if (!req.session.userId) {
        req.session.errorMessage = 'Please Login to Delete Bookings';
        return res.redirect('/user/login');
    }

    try {
        const bookingId = req.params.bookingId;

        // Find the booking
        const user = await User.findById(req.session.userId);
        const booking = await bookings.findById(bookingId);

        if (!booking) {
            return res.status(404).send('Booking not found.');
        }

        // Check if the booking belongs to the logged-in user
        if (booking.email !== user.email) {
            return res.status(403).send('Unauthorized: Cannot delete this booking.');
        }

        // Delete the booking
        await bookings.deleteOne({ _id: bookingId });
        res.redirect('/booking/userbookings'); // Redirect to the booking list page
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});


// find bookings
router.get('/find', async (req, res) => {
    try {
        res.render('bookingFind');
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

//find bookings in specific date
router.post('/findform', async (req, res) => {
    try {
        const { email, startDate, endDate } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.render('findbooking-list', { userName: '', booking: [] });
        }

        // date format conversion
        const formattedStartDate = new Date(startDate);
        const formattedEndDate = new Date(endDate);

        // Find bookings for the user within the specified date range
        const booking = await bookings.find({
            email: user.email, 
            date: { $gte: formattedStartDate, $lte: formattedEndDate },
        });

        res.render('findbooking-list', { userName: user.email, booking });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});



module.exports = router