const express       = require('express');
const router        = express.Router();
const checkAuth     = require('../middleware/checkAuth');
const Universidades = require('../controllers/universidades');
const Processos     = require('../controllers/processos');

router.get('/',  checkAuth, (req, res) => {
    // query -> university
    // query -> course
    // query -> subject
    const query = req.query;
    console.log("UNIVERSIDADES GET / ");

    if(query.university && typeof query.course === 'undefined' && typeof query.subject === "undefined") {
        Processos.universityCourses(query.university)
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));

    }
    else if((query.course && query.university) && typeof query.subject == 'undefined') {
        Processos.courseSubjects(query.university, query.course)
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));
    }
    else if(query.course && query.university && query.subject) {
        Processos.equivalenceSubject(query.university, query.course, query.subject)
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));
    }
    else {
        Universidades.list()
            .then(data => res.jsonp(data))
            .catch(err => res.jsonp(err));
    }


});

router.post('/', checkAuth, (req, res) => {
    console.log("UNIVERSIDADES POST / ");

    const university = {
        codInstit: req.body.codInstit,
        nomeInstit: req.body.nomeInstit
    };

    Universidades.addNew(university)
        .then(data => res.status(201).jsonp(data))
        .catch(err => res.status(401).jsonp(err));
});

// router.get('/:university', (req, res) => {
//
//     const query = req.query;
//
//
//     Processos.universityCourses(req.params.name)
//         .then(data => res.status(200).json(data))
//         .catch(err => res.json(err));
// });

// router.get('/:university/course/:course',)

// router.post('/:id', checkAuth, (req, res) => {


// });


module.exports = router;
