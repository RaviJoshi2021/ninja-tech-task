const users = require('../controllers/user-Controller');
const tikectController = require('../controllers/tickect-controller');
const { auth, permit } = require('../config/middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })


module.exports = (app) => {
    app.post('/login', users.login);
    app.post('/signUp', users.signUp);
    app.get('/login', (req, res) => { res.render('login'); });
    app.get('/register', (req, res) => { res.render('register'); });

    app.post("/create-ticket", auth, permit('admin', 'client'), upload.single('file'), tikectController.createTicket)
    app.post('/tickets/:id/remarks', auth, permit('employee', 'manager'), tikectController.remarks)
    app.patch('/tickets/:id/status', auth, permit('manager', 'admin'), tikectController.statusChange)
    app.get('/tickets/:id', auth, permit('admin'), tikectController.ticketDetail)
    app.get('/ticket-list', auth, tikectController.list)

}