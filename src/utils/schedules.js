// libraries
const schedule = require('node-schedule');

// models
const Session = require("./../models/sessionModel.js");

const clearSession = async () => {

    return schedule.scheduleJob('*/23 * * *', async function () {

        const uselessSessions = await Session.find({
            $and: [
                {status: {$eq: 1}},
                {expire: {$lt: Math.floor(Date.now() / 1000)}}
            ]
        })
            .exec();

        if (uselessSessions?.length > 0){
            for (let i = 0; i < uselessSessions?.length; i++) {
                await Session.deleteOne({_id: uselessSessions[i]?._id});
            }
        }

    });

}

module.exports = {
    clearSession
}