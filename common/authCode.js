var authCode = {
	pickAuthor : function(authCodes) {
	    var epcAuthCode = {};
	    authCodes.forEach(function(authcode, i) {
	    	if(authcode === 'admin') {
	    		epcAuthCode['epc:*'] = true;
	    	}
	        if (authcode.startsWith('epc:')) {
	            epcAuthCode[authcode] = true;
	        }
	    });
	    return epcAuthCode;
	},

	hasOperation : function(autoCodes) {
		if(autoCodes) {
			for(var i = 1; i < arguments.length; i++) {
				if(autoCodes.hasOwnProperty(arguments[i])) {
					return true;
				}
			}
		}
		return false; 
	}
};

module.exports = authCode;