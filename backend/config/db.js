import mongoose from 'mongoose';

function connect(){
    mongoose.connect(process.env.MONGODB_URI).then(()=>{
        console.log("Connected to mongodb");
    }).catch((error)=>{
        console.log("Error connecting to mongodb", error);
    });
}

export default connect;