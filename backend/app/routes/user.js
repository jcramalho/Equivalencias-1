const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Users = require('../controllers/users');
const Hash = require('../utils/hasing');

const checkAuth = require('../middleware/checkAuth');
const userAdmin = require('../middleware/userAdmin');

router.get('/:username', checkAuth, (req, res) => {
    console.log(`GET / ${req.params.username}`);

    Users.searchUser(req.params.username)
        .then(data => res.jsonp(data))
        .catch(err => res.jsonp(err));
});

router.post('/login', (req, res, next) => {

    const userAuth = {
        username: req.body.username,
        password: req.body.password
    };

    console.log(userAuth);

    Users.searchUser(userAuth.username)
        .then(user => {

            if(!user){
                res.status(401).jsonp({title: "Error", message: `User ${userAuth.username} does not exists`});
            } else {
                bcrypt.compare(userAuth.password, user.password)
                    .then(result => {
                        if(!result) {
                            res.status(401).jsonp( {title: "error", message: "Invalid password!"} );
                        } else {
                            const token = jwt.sign({
                                    username: user.username
                                },
                                process.env.AUTH_SECRET, { expiresIn: process.env.AUTH_TOKEN_TIMETOLIVE },
                                { algorithm: process.env.AUTH_TOKEN_ALGORITHM }
                            );

                            const cookieOptions = {
                                httpOnly: true
                            };
                            res.cookie('userToken', token, cookieOptions);
                            res.status(201).jsonp( {title: "Success!", message: "User logged on successfully", token: token, user: {
                                username: user.username,
                                fullName: user.fullName,
                                admin: user.admin
                            }});
                        }


                    })
                    .catch(err => res.status(401).jsonp(err));
            }
        })
        .catch(err => res.status(401).jsonp(err));

});

router.post('/register', checkAuth, userAdmin, (req, res) => {
    console.log("USER POST /");

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) console.log(err);

        const newUser = {
            username: req.body.username,
            password: hash,
            email: req.body.email,
            fullName: req.body.fullName
        };

        Users.newUser(newUser)
            .then(data => res.status(201).jsonp(data))
            .catch(err => res.status(400).jsonp(err));
    });

});


// TOOD: middleware to check user
router.put('/password', checkAuth, (req, res) => {
    let info = {
        username: req.decodedUser.username,
        ...req.body
    };

    Users.searchUser(info.username)
        .then(user => {

            // TODO: Verify if passwords match

            // TODO: If so, change to new Password
        }).catch();
    console.log(info);
});


router.delete('/', checkAuth, userAdmin, (req, res) => {

    Users.destroyUser(req.body.username)
        .then(data => res.jsonp(data))
        .catch(err => res.jsonp(err));
});


module.exports = router;
