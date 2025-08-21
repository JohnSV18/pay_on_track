const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const app = require('../server')
const should = chai.should(); 

chai.use(chaiHttp);
const agent = chai.request.agent(app);
