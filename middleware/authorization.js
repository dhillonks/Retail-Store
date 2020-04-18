const dashBoardLoader = (req, res) => {
    if(req.session.userInfo.type=='Admin'){
        res.redirect("/inv");
    }
    else{
        res.render("User/dashboard");
    }
}

module.exports = dashBoardLoader;