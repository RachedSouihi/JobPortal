const socketIO = require('socket.io');





const socketToUserIdMap = new Map();


function socketIOServer(server){
    const io = socketIO(server, {
        cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        },
    });


    
  io.on('connection', (socket) => {
    //console.log(socketToUserIdMap)
  
    console.log('A user connected');
  
    socket.on('join', userId => {
      console.log(`User with id ${userId} LogIn now`)
      socket.join(userId)
      socketToUserIdMap.set(socket.id, userId)
      
      
     // console.log("user with ID", userId, " join the socketIO server")
    })

    socket.on('newJobOffer', jobOffer => {      
      io.emit("newJobOffer", jobOffer);
    })
  
  
    socket.on('offerDeleted', offerId => {
     // console.log('offerId: ', offerId)
      io.emit('offerDeleted', offerId)
    })
    socket.on('IApplied', (seekerJobData, hiringMgrId) =>{
      io.to(seekerJobData.userId).emit("IApplied", seekerJobData)
      io.to(hiringMgrId).emit('someoneApply', seekerJobData)
  
    })
  
    socket.on('candidacyEdited', candidacy => {
      //console.log("CA:", candidacy.hiring_mgr_id)
      
      io.to(Number(candidacy.hiring_mgr_id)).emit('candidacyEdited', candidacy)
    })
  
    socket.on('candidacyDeleted', candidacyPK => {
      io.to(candidacyPK.userId).emit("candidacyDeletedSeekerJob", candidacyPK.offerId)
  
      io.to(candidacyPK.hiring_mgr_id).emit("candidacyDeletedHiringManager", candidacyPK)
  
      
    })

    socket.on("candidacyStatus", data => {
      const {seekerjob_id, ...candidacyData} = data
      io.to(seekerjob_id).emit("candidacyStatus", candidacyData)
    })
  
    socket.on("logout", userId => {
      console.log("Someone log out: " + userId)

      io.to(userId).emit("user-logged-out", userId)

      socket.leave(userId)
      socketToUserIdMap.delete(socket.id)
      //console.log(`User ${userId} disconnected`);
  
  
    })
  
   
    socket.on('disconnect', () => {
      const userId = socketToUserIdMap.get(socket.id)
      if(userId !== undefined && userId !== null){
        io.to(userId).emit('UserDisconnected', {})
        
        socketToUserIdMap.delete(socket.id)
        socket.leave(socket.id)
        
        console.log(`User ${userId} disconnected`);
  
  
      }
        console.log('User disconnected');
        
    });
  });

}





module.exports = {socketIOServer}