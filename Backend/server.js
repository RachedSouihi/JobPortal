const express = require("express")
const cors = require('cors')
const mysql = require("mysql2");
const http = require('http')
const multer = require('multer')
//const bodyParser = require('body-parser')



const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });



const socketIO = require('socket.io');



const app = express();
app.use(cors())
app.use(express.json());
/*app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));*/
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});




const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'JobPortal',
  waitForConnections: true,
  queueLimit: 0


});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', userId => {
    socket.join(userId)
    
    
    console.log("user with ID", userId, " join the socketIO server")
  })


  socket.on('offerDeleted', offerId => {
    console.log('offerId: ', offerId)
    io.emit('offerDeleted', offerId)
  })
  socket.on('IApplied', (seekerJobData, hiringMgrId) =>{
    io.to(seekerJobData.userId).emit("IApplied", seekerJobData)
    io.to(hiringMgrId).emit('someoneApply', seekerJobData)

  })

  socket.on('candidacyEdited', candidacy => {
    console.log("CA:", candidacy.hiring_mgr_id)
    
    io.to(Number(candidacy.hiring_mgr_id)).emit('candidacyEdited', candidacy)
  })

  socket.on('candidacyDeleted', candidacyPK => {
    io.to(candidacyPK.userId).emit("candidacyDeletedSeekerJob", candidacyPK.offerId)

    io.to(candidacyPK.hiring_mgr_id).emit("candidacyDeletedHiringManager", candidacyPK)

    
  })

 

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});

app.post('/sign-up', (req, res) => {

  const data = req.body.userData;
  const user = {"email": data.email, "password": data.password}
  let profile = {"firstname": data.firstname, "lastname": data.email, "phone": data.phone, "hiring_manager": data.hiring_manager}
  console.log(data);
  pool.query(`SELECT count(*) as 'accountExist' FROM user WHERE email='${data.email}'`, (err, result) => {
    if (err) {
      console.log({ success: false, message: err.message })
    } else {

      if (result[0].accountExist) {
        res.json({ success: false, message: "Account already exist" })
      } else {
        pool.query(`INSERT INTO user SET ?`, user, (err, result) => {
          if (err) {
            res.json({ success: false, message: err.message })
          
          } else {
            profile = {"userId": result.insertId ,...profile}
            pool.query(`INSERT INTO profile set ?`, profile, (err, profileInserted) => {
              if(err){
                res.json({ success: false, message: err.message })


              }else{
                res.json({ success: true, userId: result.insertId, message: "You are signed up successfully, good luck to find your prefered job" })


              }
            })

          }
        })
      }
    }
  })

})


app.post('/login', (req, res) => {
  const data = req.body;
  pool.query(`SELECT * FROM user u, profile p WHERE u.userId=p.userId AND email='${data.email}'`, (err, result) => {
    if(err){
      res.json({err: err.message})
    }else{
      if(result[0]){
        if(result[0].password == data.password)
          {console.log(result[0])
            res.json({success: true, data: result[0]})}
        else{
          res.json({success: false, message: "wrong password"})
        }
      }else{
        res.json({success: false ,message: "Email doesn't exist"})
      }
    }
  })
})
.get('/getSubmittedOffer', (req, res) => {
  userId = Number(req.query.userId);
  console.log(userId)
  pool.query(`SELECT s.*, jobTitle, companyName, hiring_mgr_id, s.timestamp as timestamp FROM SEEKERJOB_OFFER s, offer o WHERE s.offerId=o.offerId and userId=${userId}`, (err, result) => {
    if(err){
      res.json({"error": err.message})
    }else{
      res.json({"data": result})
    }
  })
})

app.post("/postOffer", (req, res) => {
  const { skills, ...offerData } = req.body;

  pool.query('INSERT INTO offer SET ?', offerData, (err, result) => {
    if (err) {
      console.log(err.message)
      res.json(err)
    } else {
      console.log('Offer inserted successfully')
      const offerId = result.insertId;

      skills.forEach(skill => {
        pool.query("INSERT INTO offer_skill SET ?", { "offerId": offerId, "skill": skill }, (err, result) => {
          if (err) {
            res.json(err);
          } 
        })
      })

      res.json(result)

    }
  })
})

app.post('/apply-for-job', upload.single('cv'), (req, res) => {
  const data = JSON.parse(req.body.data); // Parse the JSON data
  

  const cv = req.file.buffer
  const {skills, ...userData} =  data
  pool.query('INSERT INTO seekerjob_offer SET ?', {...userData, 'cv': cv}, async(err, result) => {
    if(err){
      console.log(err.message)
      res.json({success: false})
    }else{
      for(let skill of skills){
        const skillRaw={
          userId: userData.userId,
          offerId: userData.offerId,
          skill: skill
        }
        const insertSkill = await new Promise((resolve, reject) => {pool.query("INSERT INTO user_skills SET ?", skillRaw, (err, result) => {
          if(err){
            console.log(err.message)
            reject(err)
            res.json({succes: false})
          }else{
            resolve(result)
          }
        })
      })

      }
      
      res.json({success: true})
    }
  })

})
.patch("/editCandidacy", upload.single('cv'), (req, res) => {
  const data = JSON.parse(req.body.data);
  const cv = req.file.buffer;
 
  const query = `UPDATE seekerjob_offer SET firstname='${data.firstname}', lastname='${data.lastname}', email='${data.email}', governorate='${data.governorate}' WHERE userId=${data.userId} AND offerId=${data.offerId}`
  pool.query(query, (err, result) => {
    if(err){
      console.log(err)
      res.json({success: false})
    }else{
      pool.query(`DELETE FROM USER_SKILLS WHERE userId=${data.userId} AND offerId=${data.offerId}`, async(err, res_delete) => {
        if(err){
          console.log(err.message)
        }else{
          for(let skill of data.skills){
            const skillRaw={
              userId: data.userId,
              offerId: data.offerId,
              skill: skill
            }
            await new Promise((resolve, reject) => {pool.query("INSERT INTO user_skills SET ?", skillRaw, (err, result) => {
              if(err){
                console.log(err.message)
                reject(err)
                res.json({succes: false})
              }else{
                resolve(result)
              }
            })
          })
    
          }
        }
      })
      res.json({success: true})

    }
  })

})
.delete('/deleteCandidacy', (req, res) => {
  const {userId, offerId} = req.body;
  pool.query(`DELETE FROM seekerjob_offer WHERE userId=${userId} AND offerId=${offerId}`, (err, result) => {
    if(err){
      console.log(err.message)
      res.json({success: false})
    }else{
      res.json({success: true})
    }
  })

  
  
})
.get('/getPostedJobOffers', (req, res) => {
  const hiringManagerId = req.query.id;
  console.log(hiringManagerId)

  pool.query(`SELECT * FROM OFFER WHERE hiring_mgr_id=${hiringManagerId}`, (err, result) => {
    if(err){
      console.log(err.message)
    }else{
      console.log(result)
      res.json({data: result})
    }
  })
})

.get('/getAllApplicants', (req, res) => {
  const hiringManagerId = req.query.hiringManagerId;
  pool.query(`SELECT s.* FROM seekerjob_offer s, offer o WHERE s.offerId=o.offerId AND o.hiring_mgr_id=${hiringManagerId}`, async(err, resultQuery) => {
    if(err){
      console.log(err.message)
      res.json({succes: false})
    }else{
      for(let applicant of resultQuery){
        const skills = await new Promise((resolve, reject) => {
          pool.query(`SELECT skill from user_skills where userId=${applicant.userId} AND offerId=${applicant.offerId}`, (errSkillsQuery, resultSkillsQuery) => {
            if(errSkillsQuery){
              console.log(errSkillsQuery.message)
              reject(errSkillsQuery)

            }else{
              resolve(resultSkillsQuery)

            }
            
          })
          
        }
        )
        console.log(skills)

      }

    }
    res.json({succes: true, data: resultQuery})


  }
  

)



})


app.get('/getAllOffer', (req, res) => {


  pool.query("SELECT * FROM offer", async(err, allOffer) => {
    if (err) {
      res.json(err)

    } else {

      var offers = []
      
      for(let offer of allOffer){
        const result = await new Promise((resolve, reject) => {
          pool.query(`SELECT skill FROM offer_skill WHERE offerId=${offer.offerId}`, (err, result) => { 
            if(err){
              reject(err)
            }else{
              resolve(result)
            }
          }
          )
        })
        offers.push({...offer, skills: result.map(skill => skill.skill)})

      }

      res.json({offers: offers})







    }
  })


})
.delete('/deleteOffer', (req, res) => {
  res.json({success: true})

})

server.listen(3001, () => {
  console.log('Server running on port 3001..')
})

