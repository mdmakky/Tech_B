import { userModel } from "../modles/userModel.js";
import bcrypt from "bcryptjs";

const authController = {
    showRegister(req, res) {
        if (req.session.user) return res.redirect('/');
        res.render('auth/register', {
            title: "Create an Account.."
        });
    },

    async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;
            if (!username || !email || !password || !confirmPassword) {
                console.log("Missing fields in request body");
                req.session.error = "All fields are required!";
                return res.redirect('/auth/register');
            }

            if (password !== confirmPassword) {
                console.log("Passwords do not match");
                req.session.error = "Password does not match.";
                return res.redirect('/auth/register');
            }

            if (password.length < 6) {
                console.log("Password too short");
                req.session.error = "Password must be at least 6 characters.";
                return res.redirect('/auth/register');
            }

            const emailExists = await userModel.emailExists(email);

            if (emailExists) {
                console.log("This email is alredy in use");
                req.session.error = "This email is already in use";
                return res.redirect('/auth/register');
            }

            const userExists = await userModel.usernameExists(username);

            if (userExists) {
                console.log("This username is alredy in use");
                req.session.error = "This username is already taken.";
                return res.redirect('/auth/register');
            }

            const hashPassword = await bcrypt.hash(password, 12);
            const user = await userModel.createNewUser({ username, email, password: hashPassword });

            console.log("User created:", user);

            req.session.user = { id: user.id, username: user.username, role: user.role }
            req.session.success = `Welcome ${user.username}! Account created successfully.`
            return res.redirect('/');

        } catch (error) {
            console.log("Error while creating account.\n", error);
            req.session.error = "Something went wrong. Try again later."
            return res.redirect('/auth/register');
        }
    },

 
    showLogin(req, res) {
        if (req.session.user) {
            return res.redirect("/")
        }
        return res.render("/auth/login", { title: "Login" })
    },
  
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const mailExists = await userModel.emailExists(email)
            if (!mailExists) {
                console.log("Email does not exist with a corrosponding account")
                req.session.error = "Invalid email id.."
                return res.redirect('/auth/login')
            }
            const user = await userModel.findByEmail(email)
            const passwordMatch = await bcrypt.compare(password, user.password)
            
            if (!passwordMatch) {
                console.log("Invalid password")
                req.session.error = 'Invalid password.';
                return res.redirect('/auth/login');
            }
 
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            }

            req.session.success = `Welcome back ${user.username}.`
            console.log(`Welcome back ${user.username}.`)
            return res.redirect('/')
        } catch (error) {
            console.log('Login error, \nError:', error);
            req.session.error = 'Error while logging. Please try again later';
            return res.redirect('/auth/login');
        }

    },

    logout(req, res) {
        req.session.destroy((err) => {
        if (err) {
            console.log("Logout error.\n Error: ", err);
            return res.redirect('/');
        }

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        return res.redirect('/auth/login');
    });

    }
}

export { authController }