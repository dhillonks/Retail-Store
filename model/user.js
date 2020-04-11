const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

//Shape of user documents entering the database:
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        default: "User"
    }
});

userSchema.pre('save', function(next){
    bcrypt.genSalt(10)
        .then((salt)=>{
            bcrypt.hash(this.password, salt)
                .then((encryptedPassword)=>{
                    this.password = encryptedPassword;
                    next();
                })
                .catch(err => console.log(`Error occurred while hashing ${err}`));
        })
        .catch(err => console.log(`Error occurred while salting ${err}`));
});

module.exports = mongoose.model('User', userSchema); 