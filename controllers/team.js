var async = require('async');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var Team = require('../models/Team');
var Event = require('../models/Event');
var User = require('../models/User');
var Project = require('../models/Project')
var config = require('../config/secrets');
//var secrets = new config();
//var emailController = require('./email');

//Additional for testing move or del later




//Export Functons
exports.postCreate = function(req, res, next) {


    Event.findOne({
        slug: req.params.eslug
    }, function(err, event) {


        if (err) {

            res.send(err);

        } else if (!event) {
            res.json({
                message: 'Event not found'
            });

        } else {

          //console.log(req.user);
            User.findById(req.user._id, function(err, user) {
                if (err) res.send(err);

                var isEvent = false;
                var isTeam = false;
                console.log(user.events);
            
                    if (user.events.id(event._id)) {
                        isEvent = true;
                        if (user.events.id(event._id).team == null || undefined) {
                            isTeam = true;
                            req.eveId = event._id;
                        }
                    }
                  

                    console.log(isEvent);
                    console.log(isTeam);

                    if (isEvent == false) {
                        res.json({
                            message: 'Event not joined'
                        });


                    } else if (isTeam == true && isEvent == true) {
                        next();
                    } else if (isEvent == true && isTeam == false) {
                        res.json({
                            message: 'Team already exsists'
                        });
                    }



                


            });


        }

        //Initial verification
    });
};

exports.createTeam = function(req, res) {



    //add team id in event list....p
    var team = new Team();
    team.name = req.body.name;
    team.description = req.body.description;
    team.eventSlug = req.params.eslug;
    team.admin = req.user._id; 

    team.members.push({
        _id: req.user._id
    }); 


    var project = new Project();
    project.name = req.body.projName;
    project.description = req.body.projDesc;
    project.tags = req.body.projectTags; //make sure tags puts single value in single element....p

    team.problemStatement = project._id;

    User.findById(req.user._id  , function(err, user) {
        if (err) return res.send(err);

        user.events.id(req.eveId).team = team._id;


        user.save(function(err) {
            if (err)
                return res.send(err);
        });

    });


    Event.findOne({
        slug: req.params.eslug
    }, function(err, event) {
        event.teamList.push({
            _id: team._id
        });

        //Update attendies list here also..but not now awaiting confirmation
        event.save(function(err) {
            if (err)
                return res.send(err);
        });


    });




    team.save(function(err) {
        if (err)
            return res.send(err);
        else {
            project.save(function(err) {
                if (err)
                    return res.send(err);


                res.json({
                    message: 'project and team created and user plus event data saved'
                });


            });


        }
    });


};




exports.getallTeams = function(req, res) {

    Team.find({
        eventSlug: req.params.eslug,
        status: 'Un-approved' /*member count search filter???maybe hide in angular*/
    }, function(err, team) {
        if (err)
            res.send(err);


        res.json(team);
    });


};



exports.searchTeamSlug = function(req, res) {


    Team.findOne({
        eventSlug: req.params.eslug,
        slug: req.params.tslug
    }, function(err, team) {
        if (err) {
            res.send(err);
        } else if (!team) {
            res.json({
                message: 'Team not found'
            });
        } else {

            res.json(team);
        }
    });




};




exports.deleteTeam = function(req, res, next) { //Can the team admin delete an admin approved team 

    Event.findOne({
        slug: req.params.eslug
    }, function(err, event) {


        if (err) {
            res.send(err);

        } else if (!event) {
            res.json({
                message: 'Event not found'
            });
        } else {

            Team.findOne({
                eventSlug: req.params.eslug,
                slug: req.params.tslug
            }, function(err, team) {
                if (err) res.send(err);
                else if (!team) {
                    res.json({
                        message: 'Team not found'
                    });
                } else if (team.status == 'Approved') {
                    res.json({
                        message: 'Team already approved cant delete'
                    });
                } else {
                    if (team.admin == req.user._id ) {
                        event.teamList.pull({
                            _id: team._id
                        });
                        event.save(function(err) {
                            if (err)
                                res.send(err);
                        });

                        Project.remove({
                            _id: team.problemStatement
                        }, function(err, team) {
                            if (err)
                                res.send(err);
                        });

                        for (var i = team.members.length - 1; i >= 0; i--) {

                            User.findById(team.members[i]._id, function(err, user) {

                                if (err) res.send(err);

                                user.events.id(event._id).team = null;
                                user.save(function(err) {
                                    if (err)
                                        res.send(err);
                                });

                            });

                        };

                        team.remove();




                        res.json({
                            message: 'Successfully deleted'
                        });
                    } else {
                        res.json({
                            message: 'Not team admin'
                        });
                    }
                }
            });
        }
    });
};


exports.applyTeam = function(req, res) {
    Team.findOne({
        eventSlug: req.params.eslug,
        slug: req.params.tslug
    }, function(err, team) {
        if (err) res.send(err);
        else if (!team) {
            res.json({
                message: 'Team not found'
            });
        } else if (team.status == 'Approved') {
            res.json({
                message: 'Team already approved cant apply'
            });
        } else if (team.members.length >= 5) {
            res.json({
                message: 'Team already full'
            });
        } else {
            User.findById(req.user._id , function(err, user) {
                if (err) res.send(err);
                var isTeam = true;
                var index = 0;

                if (user.events.id(req.eveId).appliedTeams.length >= 5) {
                    res.json({
                        message: 'Cant apply for more teams'
                    });
                } else {

                    if (user.events.id(req.eveId).appliedTeams.id(team._id)) {
                        isTeam = false;

                    }



                }


                if (isTeam == true) {

                    user.events.id(req.eveId).appliedTeams.push({
                        _id: team._id
                    });
                    team.appliedMembers.push({
                        _id: req.body.u
                    }); /*current user here*/

                    user.save(function(err) {
                        if (err)
                            return res.send(err);
                    });

                    team.save(function(err) {
                        if (err)
                            return res.send(err);
                    });

                    res.json({
                        message: 'Successfully applied'
                    });
                } else if (isTeam == false) {
                    res.json({
                        message: 'Already applied for team'
                    });
                }
            });

        }

    });




};


exports.postUpdate = function(req, res, next) {
    Event.findOne({
        slug: req.params.eslug
    }, function(err, event) {

        if (err) res.send(err);

        else if (!event) {
            res.json({
                message: 'Event not found'
            });
        } else {
            Team.findOne({
                eventSlug: req.params.eslug,
                slug: req.params.tslug
            }, function(err, team) {
                if (err) res.send(err);
                else if (!team) {
                    res.json({
                        message: 'Team not found'
                    });
                } else {
                    if (team.members.id(req.user._id)) {
                        if (team.admin.equals(req.user._id)) {
                            req.eventId = event._id;
                            next();
                        } else {
                            res.json({
                                message: 'Not the admin'
                            });
                        }
                    } else {
                        res.json({
                            message: 'Not a member'
                        });
                    }

                }

            });

        }
    });
};

exports.updateTeam = function(req, res) {

    Team.findOne({
        eventSlug:req.params.eslug,
        slug:req.params.tslug}, 
        function(err, team) {

        if (err) res.send(err);


        team.name = req.body.name;
        team.description = req.body.description;
        //Add here whatever fields should be updated


        team.save(function(err) {
            if (err)
                res.send(err);

            res.json({
                message: 'Team updated!'
            });
        });

    });

};

exports.approveMember = function(req, res) {

    Team.findOne({
        eventSlug: req.params.eslug,
        slug: req.params.tslug
    }, function(err, team) {
        if (err) {
            res.send(err);
        }

        User.findOne(req.body.approval, function(err, user) {
            if (err) res.send(err);

            if (user.events.id(req.eventId).team) {
                res.json({
                    message: 'Already in team'
                });
            } else {

                if (req.body.result == true) {

                    team.members.push({
                        _id: user._id
                    });
                    team.appliedMembers.pull({
                        _id: user._id
                    });
                    user.events.id(req.eventId).team = team._id;
                    user.events.id(req.eventId).appliedTeams.pull({
                        _id: team._id
                    });

                    team.save(function(err) {
                        if (err) res.send(err);
                    });

                    user.save(function(err) {
                        if (err) res.send(err);
                    });

                    res.json({
                        message: 'Member Approved and Added'
                    });

                } else if (req.body.result == false) {

                    team.appliedMembers.pull({
                        _id: req.body.approval
                    });
                    user.events.id(req.eventId).appliedTeams.pull({
                        _id: team._id
                    });

                    team.save(function(err) {
                        if (err) res.send(err);
                    });


                    user.save(function(err) {
                        if (err) res.send(err);
                    });

                    res.json({
                        message: 'USer unapproved'
                    });
                }
            }
        });
    });
};


exports.inviteMember = function(req, res) {

    Team.findOne({
        eventSlug: req.params.eslug,
        slug: req.params.tslug
    }, function(err, team) {
        if (err) res.send(err);

        User.findById(req.body.invite, function(err, user) {
            if (err) res.send(err);

            team.inviteMembers.push({
                _id: user._id
            });
            console.log(team.inviteMembers);
            user.events.id(req.eventId).teamInvites.push({
                _id: team._id
            });

            team.save(function(err) {
                if (err) res.send(err);
            });

            user.save(function(err) {
                if (err) res.send(err);
            });

            res.json({
                message: 'User invited....awaiting confirmation'
            });


        });
    });


};

exports.acceptInvite = function(req, res) {
    
        Team.findOne({
            eventSlug:req.params.eslug,
            slug:req.params.tslug}
            , function(err, team){
                if(err) res.send(err);
                else if(!team){
                    res.json({
                        message:'Team not found'
                    });
                }
                else{
                    User.findById(
                        req.user._id,
                        function(err, user){
                            if(err) res.send(err);
                            if(req.body.result == true){
                                team.members.push({
                                    _id: user._id
                                });

                                team.inviteMembers.pull({ 
                                    _id: user._id
                                });

                                user.events.id(req.eveId).team = team._id;
                                user.events.id(req.eveId).teamInvites.pull({
                                    _id:team._id
                                });

                                team.save(function(err) {
                                    if (err) res.send(err);
                                });

                                user.save(function(err) {
                                    if (err) res.send(err);
                                });

                                res.json({
                                    message: 'Team joined'
                                }); 
                            }
                            else if(req.body.result == false){
                                team.inviteMembers.pull({
                                    _id: user._id
                                });
                                user.events.id(req.eveId).teamInvites.pull({
                                    _id: team._id
                                });
                                team.save(function(err) {
                                    if (err) res.send(err);
                                });

                                user.save(function(err) {
                                    if (err) res.send(err);
                                });

                                res.json({
                                    message: 'Invitation Declined'
                                });

                            }
                    });
                }
        });
    
};

exports.getTeams = function(req, res){
    var query = Team.find();
    var key = "";
    console.log(req.headers.keyword);
    if (req.query.keyword instanceof Array) {
        for (var i = 0; i<req.query.keyword.length; i++) {
            key = key + req.query.keyword[i] + " ";
            console.log(key);
        };
    } else {
        key = req.headers.keyword;
        console.log(key);
    }

    if (req.headers.keyword) {
        query = query.find({ $text : { $search : key }}  );
        query = query.find({'eventSlug': req.params.eslug},{'status':"Un-approved"});
        console.log(query);
            // .skip(req.query.s)
            // .limit(req.query.l);
    };
    query.exec(function(err, teams){
        if(err) res.send(err);
        console.log(teams);
        res.json(teams);
    });

};

exports.unjoinTeam = function(req, res, next) {

    Event.findOne({
        slug: req.params.eslug
    }, function(err, event) {
        if (err) res.send(err);

        Team.findOne({
            eventSlug: req.params.eslug,
            slug: req.params.tslug
        }, function(err, team) {
            if (err) res.send(err);

            else if (!team) {
                res.json({
                    message: 'Team not found'
                });
            } else if (team.admin == req.user._id) {
                res.json({
                    message: 'Admin cant unjoin team ....only delete'
                });
            } else {

                User.findById(req.user._id, function(err, user) {
                    if (err) res.send(err);

                    user.events.id(event._id).team = null;
                    team.members.pull({
                        _id: req.user._id
                    });



                });
            }
        });
    });
};