const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const app = require('../server')
const should = chai.should();

chai.use(chaiHttp);
const agent = chai.request.agent(app);





describe('site', function () {
    //test for home page
    it('Should have home page', function (done) {
        agent
            .get('/')
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.should.have.status(200);
                return done();
            })
    })
})