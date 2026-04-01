import emailExistence from "email-existence";

function checkEmailExists(email) {
    return new Promise((resolve) => {
        emailExistence.check(email, (error, response) => {
            if (error) {
                return resolve({ exists: false, error });
            }
            return resolve({ exists: Boolean(response), error: null });
        });
    });
}

async function verifyEmailAddress(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return {
            isValid: false,
            reason: "Please enter a valid email format."
        };
    }

    const result = await checkEmailExists(email);

    if (result.error || !result.exists) {
        return {
            isValid: false,
            reason: "Email address does not appear to exist."
        };
    }

    return {
        isValid: true,
        reason: null
    };
}

export { verifyEmailAddress };
