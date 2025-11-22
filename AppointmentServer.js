var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var bodyparser = require('body-parser');
const sql = require('mssql');
const crypto = require('crypto');
app.use(cookieParser()); 
app.use(session({secret: "super secret message, its a secret!",resave: false, saveUninitialized:true}));
app.use(bodyparser.urlencoded({ extended: false }))
const algorithm = 'aes 256 cbc'
const KEY = Buffer.from('xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=', 'base64');
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64');

function encrypt(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encryptedData = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
  return encryptedData;
}


var config = {
    user: 'myuser1',
    password: '1234',
    server: 'DESKTOP-P0V3287',
    database: 'AppointmentSystem',
    port: 1433,
    dialect: "mssql",
    dialectOptions: {
        instanceName: "SQLEXPRESS"
    },
    options: {
       encrypt: false,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
    }
};

sql.connect(config, err => {
    // ... error checks
    // Query
   if(err){
      console.log(err)
      return;
   }
   console.log("Connected to MSSQL :)")
    
})


var urlencodedParser = bodyparser.urlencoded({ extended: false })

app.get('/', function (req, res) {
   res.sendFile(__dirname + "/" + "login.html" );
})

app.get('/signup', function (req, res) {
   res.sendFile(__dirname + "/" + "signup.html" );
})

app.post('/register', urlencodedParser, function (req, res) {
   let user = req.body.username.toLowerCase();
   new sql.Request().query("select * from Users where(Email= '"+req.body.email+"' or Username= '"+user+"')",
      (err, result) => {
        // ... error checks
        if(err)
           console.log(err)
        else
           if (result.rowsAffected[0]!=0){
            res.sendFile(__dirname + "/" + "signup2.html" );
           }
           else{
            let pass = encrypt(req.body.password);
            new sql.Request().query("INSERT INTO Users (Username, Password, Email) VALUES ('"+
               user+"', '"+pass+"', '"+req.body.email+"')",(err, result) => {
                 // ... error checks
                 if(err)
                    console.log(err)
               });
            res.sendFile(__dirname + "/" + "login.html" );

           } 
   });
})

app.post('/appointment', urlencodedParser,function (req, res) {
   let user = req.body.username.toLowerCase();
   new sql.Request().query("select * from Users where(Username= '"+user+"')",
      (err, result) => {
        // ... error checks
        if(err)
           console.log(err)
        else{
            let pass = encrypt(req.body.password);
            if(pass===result.recordset[0].Password){
                  req.session.username=user;
                  if (req.session.username=='admin') {
                     res.sendFile(__dirname + "/" + "AppointmentAdmin.html");
                  } else {
                     res.sendFile(__dirname + "/" + "AppointmentClient.html");
                  }
            }
            else 
            res.sendFile(__dirname+"/invalidLogin.html")
        }
                
      });
})

app.post('/search', urlencodedParser, function (req, res) {
   if (req.session.username == 'admin') {
      new sql.Request().query("select * from MTable where (date= '"+req.body.d+"')",
               (err, result) => {
           // ... error checks
                  if(err)
                     console.log(err)
                  else
                     res.end(JSON.stringify(result.recordset));
            })
   } else {
            new sql.Request().query("select * from MTable where (date= '"+req.body.d+"' and Username= '"+req.session.username+"')",
               (err, result) => {
                 // ... error checks
                 if(err)
                    console.log(err)
                 else
                     res.end(JSON.stringify(result.recordset));
            });
         }
   
})

app.get('/list', function (req, res) {
   if (req.session.username == 'admin') {
      new sql.Request().query("select * from MTable",
               (err, result) => {
           // ... error checks
                  if(err)
                     console.log(err)
                  else
                     res.end(JSON.stringify(result.recordset));
            })

   } else {
            new sql.Request().query("select * from MTable where (Username= '"+req.session.username+"')",
               (err, result) => {
           // ... error checks
                  if(err)
                     console.log(err)
                  else
                     res.end(JSON.stringify(result.recordset));
            })
         }
   
})

app.post('/addition', urlencodedParser, function(req, res){
   if (req.session.username=='admin') {
      new sql.Request().query("select * from Users where(Username= '"+req.body.Username+"')",
            (err, result) => { 
            // ... error checks
            if(err)
               console.log(err)
            else{
               if(result.rowsAffected[0]==0)
                  res.end(JSON.stringify('0'));
               else{
                  id = result.recordset[0].UserId;
                  new sql.Request().query("select * from MTable where(Username= '"+req.body.Username+"' and date= '"
                  +req.body.date+"' and time= '"+req.body.time+"')",
                  (err, result) => {
                    // ... error checks
                    if(err)
                       console.log(err)
                    else
                     if (result.rowsAffected[0]!=0)
                       res.end(JSON.stringify('')); 
                     else{
                        new sql.Request().query("INSERT INTO MTable (Username, title, date, time, discription, UserId) VALUES ('"+
                           req.body.Username.toLowerCase()+"', '"+req.body.title+"', '"+req.body.date+"', '"+req.body.time+"', '"+
                           req.body.discription+"', '"+id+"')",
                        (err, result) => {
                          // ... error checks
                          if(err)
                             console.log(err)
                          else{
                              new sql.Request().query("select * from MTable",
                              (err, result) => {
                             // ... error checks
                                 if(err)
                                    console.log(err)
                                 else
                                    res.end(JSON.stringify(result.recordset));
                              })
                           }
                        }) 
                     }
                  })
               }
            }
      })    
      
   } else {
      new sql.Request().query("select * from MTable where(Username= '"+req.session.username+"' and date= '"
         +req.body.date+"' and time= '"+req.body.time+"')",
         (err, result) => {
           // ... error checks
           if(err)
              console.log(err)
           else
            if (result.rowsAffected[0]!=0)
              res.end(JSON.stringify('')); 
            else{
               new sql.Request().query("select * from Users where(Username= '"+req.session.username+"')",
               (err, result) => {
                 // ... error checks
                 if(err)
                    console.log(err)
                 else{
                  let id = result.recordset[0].UserId;
                  new sql.Request().query("INSERT INTO MTable (Username, title, date, time, discription, UserId) VALUES ('"+req.session.username+"', '"+
                     req.body.title+"', '"+req.body.date+"', '"+req.body.time+"', '"+req.body.discription+"', "+id+")",
                     (err, result) => {
                       // ... error checks
                       if(err)
                          console.log(err)
                       else{
                        new sql.Request().query("select * from MTable where(Username= '"+req.session.username+"')",
                           (err, result) => {
                          // ... error checks
                              if(err)
                                 console.log(err)
                              else
                                 res.end(JSON.stringify(result.recordset));
                           })
                       }
                     })
                 }
                  
               }) 

            }

      });
   }
});

app.post('/delete', urlencodedParser, function(req, res){
         new sql.Request().query("DELETE from MTable where (Username= '"+req.body.Username+"' and date= '"+req.body.date+"' and time= '"+req.body.time+"')",
         (err, result) => {
           // ... error checks
           if(err)
              console.log(err)
           else
              res.end(JSON.stringify(result.recordset));
         })

});



var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})