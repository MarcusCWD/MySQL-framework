const express = require("express");
const router = express.Router();
const crypto = require('crypto');



const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}


// import in the User model
const { User, Role } = require('../models');

const { createRegistrationForm, createLoginForm, bootstrapField } = require('../forms');

async function allRoles() {
    return await Role.fetchAll().map((role) => {
      return [role.get("id"), role.get("name")];
    });
}

router.get('/register', async (req,res)=>{
    let xRole =  await allRoles()
    // display the registration form
    const registerForm = createRegistrationForm(xRole);
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', async (req, res) => {
    let xRole =  await allRoles()
    const registerForm = createRegistrationForm(xRole);
    registerForm.handle(req, {
        success: async (form) => {
            const user = new User({
                'name': form.data.name,
                'password': getHashedPassword(form.data.password),
                'email': form.data.email,
                'mobile': form.data.mobile,
                'userrole': form.data.userrole,
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login',{
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login

            // ...find the user by email and password
            let user = await User.where({
                'email': form.data.email
            }).fetch({
               require:false}
            );

            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                res.redirect('/users/login');
            } else {
                // check if the password matches
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    // add to the session that login succeed

                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        name: user.get('name'),
                        email: user.get('email'),
                        mobile: user.get('mobile'),
                        userrole: user.get('userrole')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('name'));
                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                    res.redirect('/users/login')
                }
            }
        }, 'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile',{
            'user': user
        })
    }

})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "You have been logged out");
    res.redirect('/users/login');
})



module.exports = router;
