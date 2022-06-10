const express = require("express");

// import in the CheckIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares');

 // #1 - Create a new express Router
const router = express.Router(); 

//  #2 Add a new route to the Express router
router.get('/', (req,res)=>{
    res.render('landing/index.hbs')
})

router.get('/restricted', checkIfAuthenticated, (req,res)=>{
    res.render('landing/restrictedpage.hbs')
})

// #3 export out the router
module.exports = router;
