const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    currency: "INR",
    name: "Sushant Pandey",
    description: "Test Transaction",
    callback_url: `${import.meta.env.VITE_SERVER_URL}/api/payment`,
    // config: {
    //     display: {
    //         blocks: {
    //             banks: {
    //                 name: 'Pay via UPI',
    //                 instruments: [
    //                     {
    //                         method: 'upi'
    //                     },
    //                 ],
    //             },
    //         },
    //         sequence: ['block.banks'],
    //         preferences: {
    //             show_default_blocks: true,
    //         },
    //     },
    // },

    prefill: {
        name: "Robert Will",
        email: "robertwill@gmail.com",
        contact: "8766576999",
    },
    notes: {
        address: "Razorpay Corporate Office",
    },
    theme: {
        color: "#3399cc",
    },
};

export default options;