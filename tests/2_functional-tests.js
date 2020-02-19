/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'test',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
      
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'test');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.isBoolean(res.body.open);
          assert.exists(res.body._id);
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          //fill me in too!
          
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'test',
            created_by: 'Functional Test - Required fields filled in',
          })
          .end(function(err, res){

            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'test');
            assert.equal(res.body.created_by, 'Functional Test - Required fields filled in');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            assert.isBoolean(res.body.open);
            assert.exists(res.body._id);
            assert.exists(res.body.created_on);
            assert.exists(res.body.updated_on);
          
            done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({})
          .end(function(err, res){
          
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Missing required fields');
            done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
         chai.request(server)
          .put('/api/issues/test')
          .send({ _id: '5e4be8e353f3e102ccc8da22'})
          .end(function(err, res){
           
           assert.equal(res.text, 'no updated field sent');
           done();
           
         });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ 
            _id: '5e4bfb3e1c9d4400003712d7',
            issue_title: 'Update One field to update'
          })
          .end(function(err, res){
           
           assert.equal(res.status, 200);
           assert.equal(res.body.updated.issue_title, 'Update One field to update');
           done();
          });
      });
      
      test('Multiple fields to update', function(done) {
        let num = Math.floor(Math.random() * 10); 
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: '5e4bfbf41c9d44000008c570',
            issue_title: 'Multiple' + num,
            issue_text: 'test',
            created_by: 'Functional Test - Multiple fields to update',
            assigned_to: 'Functional Test',
            status_text: 'To Update',
            open: false
          })
          .end(function(err, res){
          
            console.log('        original: ' + 'Multiple' + num, 'updated: ' + res.body.updated.issue_title);
          
            assert.equal(res.status, 200);
            assert.equal(res.body.updated.issue_title, 'Multiple' + num);
            assert.equal(res.body.updated.issue_text, 'test');
            assert.equal(res.body.updated.created_by, 'Functional Test - Multiple fields to update');
            assert.equal(res.body.updated.assigned_to, 'Functional Test');
            assert.equal(res.body.updated.status_text, 'To Update');
            assert.equal(res.body.updated.open, false);
          
            done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ open : true })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(ele => {
            assert.equal(ele.open, true);
          });
          
          done();
        });
        
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ open : false, created_by: 'Functional Test - Multiple filters' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(ele => {
            assert.equal(ele.open, false);
            assert.equal(ele.created_by, 'Functional Test - Multiple filters');
          });
          
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          
          assert.equal(res.status, 200);
          assert.equal(res.text, 'id error');
          
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'test',
          created_by: 'Functional Test - DELETE Valid _id',
        })
        .end(function(err, res){
      
          assert.equal(res.status, 200);
          assert.equal(res.body.created_by, 'Functional Test - DELETE Valid _id');
          assert.exists(res.body._id);
          
          const idToDelete = res.body._id;
          
          // delete the just created data
          chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: idToDelete})
          .end(function(err, res){

            assert.equal(res.status, 200);
            assert.equal(res.body.message, 'successfully deleted id ' + idToDelete);

            done();
          });
        });
      });
      
    });

});
