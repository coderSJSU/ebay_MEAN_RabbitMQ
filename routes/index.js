
/*
 * GET home page.
 */

exports.index = function(req, res){
  
	res.render('index', { title: "Ebay", username: req.session.first_nm});
};


exports.profile = function(req, res){
	  
	res.render('profile', { title: "Ebay", username: req.session.first_nm});
};


exports.sell = function(req, res){
	  
	res.render('sell', { title: "Ebay", username: req.session.first_nm});
};

