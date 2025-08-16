export function generateOTP() {
    const digits = '0123456789'
    const len = digits.length
    let OTP = ''
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * len)]
    }
    return OTP;

}