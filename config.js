var env = process.env.NODE_ENV || 'development',
    config = require('./config/config-'+env);

module.exports = config;