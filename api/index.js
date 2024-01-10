// Import necessary modules and libraries
import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { connect, Schema, model } from "mongoose";

// Create an Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Connect to the database
(async () => {
    try {
        await connect(process.env.DATABASE_URI);
        console.log("Database connected");
    } catch (error) {
        console.log("Database connection failed");
    }
})();

// Define the schema for payment history
const paymentsHitorySchema = new Schema({
    orderID: { type: String, required: true },
    paymentID: { type: String, required: true },
    signature: { type: String, required: true }
});

// Create a model based on the schema
const PaymentsHistory = model("paymentsHistorty", paymentsHitorySchema);

// Set Razorpay API key and secret
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Configure options for Razorpay
const option = {
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
};

// Create a new instance of Razorpay
const razorpayInstance = new Razorpay(option);

// Route for creating a payment order
app.post("/api/checkout", async (req, res) => {
    try {
        // Extract amount from the request body
        const jsonBody = req.body;
        const amount = Number(jsonBody?.amount);

        // Create a new order using Razorpay API
        const order = await razorpayInstance.orders.create({ amount: amount * 100, currency: "INR" });

        // Respond with success and the created order
        return res.status(200).json({ message: "Success", order });
    } catch (error) {
        // Respond with an error message if there's an issue
        return res.status(500).json({ message: error.message });
    }
});

// Route for retrieving payment history
app.get("/api/paymentHistory", async (req, res) => {
    try {
        // Retrieve payment history from the database
        const data = await PaymentsHistory.find().select({ __v: 0, _id: 0 });

        // Check if there are no payments found
        if (!data) return res.status(400).json({ message: "No payments found" });

        // Respond with the retrieved payment history
        res.json(data);
    } catch (error) {
        // Respond with an error message if there's an issue
        res.status(500).json({ message: "Some Error Occurred" });
    }
});

// Route for handling payment callback
app.post("/api/payment", async (req, res) => {
    try {
        // Extract necessary information from the request body
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Create options object for payment verification
        const options = { "order_id": razorpay_order_id, "payment_id": razorpay_payment_id };

        // Validate the payment using Razorpay utility function
        const isValidPayment = validatePaymentVerification(
            options, razorpay_signature, RAZORPAY_KEY_SECRET
        );

        // If the payment is valid, save it to the database and redirect to success page
        if (isValidPayment) {
            const newPayment = new PaymentsHistory({
                orderID: razorpay_order_id,
                paymentID: razorpay_payment_id,
                signature: razorpay_signature
            });
            await newPayment.save();
            return res.redirect(`${process.env.CLIENT_URL}/success?payment_id=${newPayment.paymentID}`);
        }

        // If the payment is not valid, respond with a failure message
        return res.status(400).json({ message: "Failed" });
    } catch (error) {
        // Respond with an error message if there's an issue
        return res.status(500).json({ message: error.message });
    }
});

// Start the server and listen on port 8000
app.listen(8000, () => console.log("Server listening on port 8000"));
