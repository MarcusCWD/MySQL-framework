const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {checkIfAuthenticatedJWT} = require('../../middlewares')

const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'email': user.get('email'),
        'userrole':user.get('userrole')
    }, secret, {
        'expiresIn': expiresIn
    });
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { User } = require('../../models');

router.post('/login', async (req, res) => {
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        const userObject = {
            'email': user.get('email'),
            'userrole': user.get('userrole')
        }
        let accessToken = generateAccessToken(userObject, process.env.TOKEN_SECRET, '15m');
        let refreshToken = generateAccessToken(userObject, process.env.REFRESH_TOKEN_SECRET, '7d');
        res.send({
            accessToken, refreshToken
        })

    } else {
        res.send({
            'error':'Wrong email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    const user = req.user;
    res.send(user);
})

router.post('/logout', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,async (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            const token = new BlacklistedToken();
            token.set('token', refreshToken);
            token.set('date_created', new Date()); // use current date
            await token.save();
            res.send({
                'message': 'logged out'
            })
        })
    }
})

router.post('/refresh', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    }

    // check if the refresh token has been black listed
    let blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })


    // if the refresh token has already been blacklisted
    if (blacklistedToken) { 
        res.status(401);
        return res.send('The refresh token has already expired')
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '15m');
        res.send({
            accessToken
        });
    })
})

router.post("/register", async (req, res) => {
    try {
        // Add user into table
        const user = new User()
          user.set("name", req.body.firstname)
          user.set("email", req.body.email)
          user.set("mobile", req.body.mobile)
          user.set("password", getHashedPassword(req.body.password))
          user.set("userrole", 'user')
          await user.save()

          // send back ok
          res.send(user)
        }
     catch (e) {
        console.log(e)
        res.send("error")
    }
})




module.exports = router;
