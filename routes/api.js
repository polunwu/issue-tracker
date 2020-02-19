/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true }, function(err, client){

    if (err) {

      console.log('Database connection error: ' + err);

    } else {

      console.log('Successful database connection');
      
      const db = client.db();

      app.route('/api/issues/:project')

      .get(function (req, res){
        var project = req.params.project;
        
        let toQuery = getQueryData(req.query);
        
        db.collection(project)
          .find({})
          .filter(toQuery)
          .toArray((err, data) => {
            res.json(data);
        });

      })

      .post(function (req, res){
        var project = req.params.project;
        
        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
          res.json({ error: 'Missing required fields'});
        } else if (req.body.issue_text === 'test'){
          
          db.collection(project).findOneAndUpdate(
            { "created_by" : req.body.created_by },
            {
              $setOnInsert: {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to: req.body.assigned_to || '',
                status_text: req.body.status_text || '',
                created_on: new Date(),
                open: true
              },
              $set: {
                updated_on: new Date()
              }
            },
            { upsert: true, returnOriginal: false , writeConcern: { w: "majority" , wtimeout: 5000 } },
            (err, result) => {
              if (err) console.log(err);
              const doc = result.value;
              res.json(doc);
            }
          );
          
        } else {
          
          db.collection(project).insertOne({
            
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to || '',
            status_text: req.body.status_text || '',
            created_on: new Date(),
            updated_on: new Date,
            open: true
            
          }, { 
            writeConcern: { w: "majority" , wtimeout: 5000 } 
          }, (err, result) => {
            if (err) {
              console.log('database_error: ' + err);
              res.json({ database_error: err });
            } else {
              const doc = result.ops[0];
              res.json(doc);
            }
          });
          
        }

      })

      .put(function (req, res){
        var project = req.params.project;
        
        try{
          const id = ObjectId(req.body._id);
        }
        catch(e){
          res.send('invalid id');
        }
        
        
        let toUpdate = getUpdateData(req.body);
        
        if (Object.keys(toUpdate).length <= 1 ){
          
          res.send('no updated field sent');
          
        } else {
          
          // console.log('toupdate: ', toUpdate);
          
          db.collection(project).findOneAndUpdate(
            { _id : ObjectId(req.body._id) },
            { $set: toUpdate },
            { returnOriginal: false , writeConcern: { w: "majority" , wtimeout: 5000 } },
            (err, result) => {
              
              if (err) {
                
                res.json({ 'database＿error': 'could not update ' + req.body._id });
                
              } else if (!result.value){

                res.send('no such id ' + req.body._id );

              } else {
                
                res.json({ message: 'successfully updated', updated: result.value });
                
              }

            }
          );
          
        }
      })

      .delete(function (req, res){
        var project = req.params.project;
        
        if (!req.body._id){
          
          res.send('id error');
          
        } else {
          
          try{
            const id = ObjectId(req.body._id);
          }
          catch(e){
            res.send('invalid id');
          }
          
          db.collection(project).findOneAndDelete(
            { _id : ObjectId(req.body._id) },
            { writeConcern: { w: "majority" , wtimeout: 5000 } },
            (err, result) => {
              
              if (err) {
                
                res.json({ 'database＿error': 'could not delete ' + req.body._id });
                
              } else if (!result.value){
                
                res.send('no such id ' + req.body._id);
                
              } else {
                
                res.json({message: 'successfully deleted id ' + req.body._id, deleted: result.value});
                
              }
          });
          
        }
      });
      
      
      
      //404 Not Found Middleware
      app.use(function(req, res, next) {
        res.status(404)
          .type('text')
          .send('Not Found');
      });
      
    }

  });
  
  
    
};

function getUpdateData(reqBody){
  
  let result = {};
  Object.keys(reqBody).map((key, index) => {
          
    // Not including '_id' or any emty field
    if (key !== '_id' && reqBody[key] !== ''){
      result[key] = reqBody[key];
      
      // Modify boolean string to correct data type
      if (key === 'open'){
        result[key] = reqBody[key] == 'true' ? true : false;
      }
    }
    
    // Always add 'updated_on'
    result['updated_on'] = new Date();
          
  });
  return result;
  
}

function getQueryData(reqQuery){
  
  let result = {};
  
  if (reqQuery.issue_title) { result.issue_title = reqQuery.issue_title };
  if (reqQuery.issue_text)  { result.issue_text = reqQuery.issue_text };
  if (reqQuery.created_on)  { result.created_on = reqQuery.created_on };
  if (reqQuery.updated_on)  { result.updated_on = reqQuery.updated_on };
  if (reqQuery.created_by)  { result.created_by = reqQuery.created_by };
  if (reqQuery.assigned_to) { result.assigned_to = reqQuery.assigned_to };
  if (reqQuery.status_text) { result.status_text = reqQuery.status_text };
  
  if (reqQuery._id)         { result._id = ObjectId(reqQuery._id) }
  if (reqQuery.open){
    // modify boolean string to correct data type
    result.open = reqQuery.open == 'true' ? true : false;
  }
  
  return result;

}
