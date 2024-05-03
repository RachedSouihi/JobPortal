const express = require("express")
const session = require('express-session')
const cors = require('cors')

const http = require('http')
const mysql = require("mysql2");
const multer = require('multer');
const { socketIOServer } = require("./socketIOServer");

//const bodyParser = require('body-parser')



const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });



const app = express();
app.use(cors())
app.use(session({
  secret: "",
  resave: false,
  saveUninitialized: true
}))
app.use(express.json());
/*app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));*/


const server = http.createServer(app)


socketIOServer(server)


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


app.post('/sign-up', (req, res) => {

  const data = req.body.userData;
  const user = { "email": data.email, "password": data.password }

  let profile = { "firstname": data.firstname, "lastname": data.email, "phone": data.phone, "hiring_manager": data.hiring_manager }
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
            profile = { "userId": result.insertId, ...profile }
            pool.query(`INSERT INTO profile set ?`, profile, (err, profileInserted) => {
              if (err) {
                res.json({ success: false, message: err.message })


              } else {
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
  //console.log(data.email)
  pool.query(`SELECT * FROM user u, profile p WHERE u.userId=p.userId AND email='${data.email}'`, (err, result) => {
    if (err) {
      res.json({ err: err.message })
    } else {
      if (result[0]) {
        if (result[0].password == data.password) {
          //console.log(result[0])




          req.session.sk = "242619";
          res.json({ success: true, data: result[0] })
        }
        else {
          res.json({ success: false, message: "wrong password" })
        }
      } else {
        res.json({ success: false, message: "Email doesn't exist" })
      }
    }
  })
})
  .get('/getSubmittedOffer', (req, res) => {
    userId = Number(req.query.userId);
    console.log(userId)
    pool.query(`SELECT s.*, jobTitle, companyName, hiring_mgr_id, c.candidacyStatus, s.timestamp as timestamp FROM SEEKERJOB_OFFER s inner join offer o ON s.offerId=o.offerId and s.userId=${userId} LEFT JOIN candidacy_status c ON s.offerId=c.offerId AND c.seekerJob_id=${userId}`, async(err, result) => {
      if (err) {
        res.json({ "error": err.message })
      } else {
        const submittedCandidacy = result;

        let i = 0;
        for(let candidacy of submittedCandidacy){
          let skills = await new Promise((resolve, reject) => {
            pool.query(`SELECT skill FROM USER_SKILLS WHERE userId=${userId} AND offerId=${candidacy.offerId}`, (err, resultSkills) => {
              if(err){
                reject(err)
                res.json({success: false, message: err.message})
              }else{
                resolve(resultSkills)
              }
            })
          })
          skills = skills.map(skill => skill.skill)

          submittedCandidacy[i].skills = skills;
          i++;


        }
        res.json({ "data": result })
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

      res.json({ success: true, offerId: offerId })

    }
  })
})

app.post('/apply-for-job', upload.single('cv'), (req, res) => {
  const data = JSON.parse(req.body.data); // Parse the JSON data


  const cv = req.file.buffer
  const { skills, ...userData } = data
  pool.query('INSERT INTO seekerjob_offer SET ?', { ...userData, 'cv': cv }, async (err, result) => {
    if (err) {
      console.log(err.message)
      res.json({ success: false })
    } else {
      for (let skill of skills) {
        const skillRaw = {
          userId: userData.userId,
          offerId: userData.offerId,
          skill: skill
        }
        const insertSkill = await new Promise((resolve, reject) => {
          pool.query("INSERT INTO user_skills SET ?", skillRaw, (err, result) => {
            if (err) {
              console.log(err.message)
              reject(err)
              res.json({ succes: false })
            } else {
              resolve(result)
            }
          })
        })

      }

      res.json({ success: true })
    }
  })

})
  .patch("/editCandidacy", upload.single('cv'), (req, res) => {
    const data = JSON.parse(req.body.data);
    const cv = req.file.buffer;

    const query = `UPDATE seekerjob_offer SET firstname='${data.firstname}', lastname='${data.lastname}', phone='${data.phone}',  email='${data.email}', coverLetter='${data.coverLetter}', governorate='${data.governorate}' WHERE userId=${data.userId} AND offerId=${data.offerId}`
    pool.query(query, (err, result) => {
      if (err) {
        console.log(err)
        res.json({ success: false })
      } else {
        pool.query(`DELETE FROM USER_SKILLS WHERE userId=${data.userId} AND offerId=${data.offerId}`, async (err, res_delete) => {
          if (err) {
            console.log(err.message)
          } else {
            for (let skill of data.skills) {
              const skillRaw = {
                userId: data.userId,
                offerId: data.offerId,
                skill: skill
              }
              await new Promise((resolve, reject) => {
                pool.query("INSERT INTO user_skills SET ?", skillRaw, (err, result) => {
                  if (err) {
                    console.log(err.message)
                    reject(err)
                    res.json({ succes: false })
                  } else {
                    resolve(result)
                  }
                })
              })

            }
          }
        })
        res.json({ success: true })

      }
    })

  })
  .delete('/deleteCandidacy', (req, res) => {
    const { userId, offerId } = req.body;
    pool.query(`DELETE FROM seekerjob_offer WHERE userId=${userId} AND offerId=${offerId}`, (err, result) => {
      if (err) {
        console.log(err.message)
        res.json({ success: false })
      } else {
        res.json({ success: true })
      }
    })



  })
  .get('/getPostedJobOffers', (req, res) => {
    const hiringManagerId = req.query.id;
    console.log(hiringManagerId)

    pool.query(`SELECT * FROM OFFER WHERE hiring_mgr_id=${hiringManagerId}`, (err, result) => {
      if (err) {
        console.log(err.message)
      } else {
        console.log(result)
        res.json({ data: result })
      }
    })
  })

  .get('/getAllApplicants', (req, res) => {
    const hiringManagerId = req.query.hiringManagerId;
    pool.query(`SELECT s.*, c.candidacyStatus FROM seekerjob_offer s INNER JOIN offer o ON s.offerId=o.offerId AND o.hiring_mgr_id=${hiringManagerId} LEFT JOIN CANDIDACY_STATUS c ON s.userId=c.seekerjob_id`, async (err, resultQuery) => {
      if (err) {
        res.json({ succes: false })
      } else {
        
        let applicants = resultQuery;
        for (let applicant of resultQuery) {
          const skills = await new Promise((resolve, reject) => {
            pool.query(`SELECT skill from user_skills where userId=${applicant.userId} AND offerId=${applicant.offerId}`, (errSkillsQuery, resultSkillsQuery) => {
              if (errSkillsQuery) {
                console.log(errSkillsQuery.message)
                reject(errSkillsQuery)

              } else {
                resolve(resultSkillsQuery)

              }

            })

          }
          )
          applicant.skills = skills.map(skill => skill.skill);

        }

      }
      res.json({ succes: true, data: resultQuery })


    }


    )



  })

  .get("/getAllPostedJobOffers", (req, res) => {
    const hiringManagerId = req.query.hiringManagerId;

    pool.query(`SELECT * FROM OFFER WHERE hiring_mgr_id=${hiringManagerId}`, (err, result) => {
      if (err) {
        console.log(err.message)
        res.json({ success: false })
      } else {
        res.json({ jobOffers: result })
      }
    })
  })

  .get("/getJobOffer", (req, res) => {
    const offerId = req.query.offerId
    pool.query(`SELECT * FROM OFFER WHERE offerId=${offerId}`, (err, result) => {
      if (err) {
        console.log(err.message)
        res.json({ error: err })
      } else {
        pool.query(`SELECT skill FROM offer_skill WHERE offerId=${offerId}`, (err, resultQuery) => {
          if (err) {
            console.log(err.message)
            res.json({ error: err })
          } else {
            const skills = resultQuery.map(skill => skill.skill)
            res.json({ "jobOffer": { ...result[0], skills: skills } })


          }

        })
      }
    })
  })


app.get('/getAllOffer', (req, res) => {
  console.log("Session Id is: " + req.session.sk)


  pool.query("SELECT * FROM offer", async (err, allOffer) => {
    if (err) {
      res.json(err)

    } else {

      var offers = []

      for (let offer of allOffer) {
        const result = await new Promise((resolve, reject) => {
          pool.query(`SELECT skill FROM offer_skill WHERE offerId=${offer.offerId}`, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          }
          )
        })
        offers.push({ ...offer, skills: result.map(skill => skill.skill) })

      }

      res.json({ offers: offers })







    }
  })


})

  .put("/editJobOffer", (req, res) => {
    const { offerId, skills, ...data } = req.body;

    let query = "UPDATE OFFER SET "
    const updatedValues = []

    Object.keys(data).forEach((key) => {

      query += ` ${key} = ?,`
      updatedValues.push(data[key])
    })



    query = query.slice(0, -1)

    query += ` WHERE offerId=${offerId}`


    pool.query(query, updatedValues, (err, result) => {
      if (err) {
        console.log(err.message)
        res.json({ succes: false })
      } else {
        pool.query(`DELETE FROM OFFER_SKILL WHERE offerId=${offerId}`, async (err, resultDeletingSkills) => {
          if (err) {
            res.json({ success: false, message: err.message })
          } else {
            for (let skill of skills) {
              const skillRaw = {
                "offerId": offerId,
                "skill": skill,
              }
              await new Promise((resolve, reject) => {
                pool.query("INSERT INTO OFFER_SKILL SET ?", skillRaw, (err, resultInsertingSkill) => {
                  if (err) {
                    reject(err)
                    res.json({ success: false, message: err.message })

                  } else {
                    resolve(resultInsertingSkill)
                  }
                })
              })
            }
            res.json({ success: true })

          }
        })

      }
    })

  })

  .delete('/deleteOffer', (req, res) => {
    const offerId = req.body.offerId

    pool.query(`DELETE FROM OFFER WHERE offerId=${offerId}`, (err, result) => {
      if (err) {
        console.log(err.message)
        res.json({ success: false })
      } else {
        res.json({ success: true })


      }
    })


  })
  .post('/candidacyStatus', (req, res) => {
    const data = req.body;

    pool.query("INSERT INTO CANDIDACY_STATUS SET ?", data, (err, result) => {
      if (err) {
        res.json({ success: false, message: err.message })
      } else {
        res.json({ success: true })
      }
    })
  })

server.listen(3001, () => {
  console.log('Server running on port 3001..')
})

