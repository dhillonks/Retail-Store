const dashBoardLoader = (req, res) => {
    if(req.session.userInfo.type=='Admin'){
        res.redirect("/inv");
    }
    else{
        res.redirect("/user/cart");
    }
}

module.exports = dashBoardLoader;