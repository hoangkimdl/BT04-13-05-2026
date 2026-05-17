const path = require('path');

const configViewEngine = (app) => {
    app.set('views', path.join('./src', 'views'));
    app.set('view engine', 'ejs');
    // static assets removed for backend-only mode
}

module.exports = configViewEngine;