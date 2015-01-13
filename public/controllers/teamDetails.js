angular.module('GoaHack')
  .controller('TeamDetailsCtrl', function($scope, $alert, $location, $http, $routeParams, Team, User, Project, $rootScope, $window) {
        console.log($rootScope.currentUser.profile.slug);

  $scope.admin;
  $scope.team;
  $scope.teamSlug;
  Team.get({tslug: $routeParams.tslug, eslug: 'goa-hack'},
    function(team)
      {
        $scope.team = team;
        console.log(team);
        $scope.name = team.name;
        $scope.admin = team.admin;
        $scope.team.ps_status = team.ps_status;
        $scope.team.problemStatement = team.problemStatement;
        $scope.team.problemStatement.id = team.problemStatement._id;
        $scope.teamSlug = team.slug;
        $scope.eventSlug = team.eventSlug;

        $scope.problem.name = team.problemStatement.name;
        $scope.problem.description = team.problemStatement.description;
      });
  
  User.get({ uslug: $rootScope.currentUser.profile.slug },
    function(user)
      {
        $scope.user = user;
        $scope.userId = user._id;
      });

      $scope.tabs = [
        {title:'Applied', page: '../views/teamDetails/appliedMembers.html'},
        {title:'Invited', page: '../views/teamDetails/invitedMembers.html'},
      ];
      $scope.tabs.activeTab = 0;

//  console.log($rootScope.currentUser._id);
//      console.log($scope.teamSlug);


//  $scope.problemSubmit = function() 
//  {
////    console.log($scope.problem.name);
//    console.log($scope.problem.description);
//    console.log($scope.problem.tag);
    $scope.update = function()
    {
      Project.update({
        tslug : $routeParams.tslug,
        eslug : 'goa-hack'
      },
      {
        name : $scope.problem.name, 
        description : $scope.problem.description, 
        tags : $scope.problem.tag,
        id : $scope.team.problemStatement.id
      }, function(err, data){
                    $alert({
                      content: "Success",
                      placement: 'right',
                      type: 'success',
                      duration: 5
                      });
        Team.get({tslug: $routeParams.tslug, eslug: 'goa-hack'}, function(team)
        {
          $scope.team = team;
           $scope.displayName = team.problemStatement.name;
           $scope.displayDesc = team.problemStatement.description;
           $scope.displayTags = team.problemStatement.tags;
        });
        
        });
      $scope.editStatus = false;
    };
                     
    
      

   
    
//    $scope.problemSubmit = function() 
//    {
//       console.log($scope.commentArea); 
//    };
    
//    $scope.lTags = ["warren" , "sobin" , "orville"];
//    $scope.loadTags = function(query) {
//        console.log($scope.lTags);
//        return $http.get('tags.json');
//    };
  
  
        $scope.editStatus = false;

    
  $scope.edit = function(){
    console.log('click');
        $scope.editStatus = !$scope.editStatus;

  }
    
  $scope.showModal = false;
  
  $scope.addMember = function(){
  $scope.showModal = !$scope.showModal;
  }
  
  
 
  $scope.addMemberEmail = function(memberEmail){
//    Team.update({
//      eslug: 'goa-hack',
//      tslug: $routeParams.tslug,
//      invite: $scope.memberEmail
//    });
    
    console.log(memberEmail);
    var urlData = '/api/event/goa-hack/team/'+$routeParams.tslug+'/invite';
    $http({
      url: urlData,
      method: 'PUT',
      data: {
        invite : $scope.memberEmail
      }
    }).success(function(data, status, headers, config) {
    console.log("added");
  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
          console.log("failed");

  });
  }
  
  //$scope.isProblemPresent = false;
//  console.log($routeParams.tslug);
  
//  $scope.name = $routeParams.tslug;
//  console.log($scope.name);
  
//    $scope.comment = [];
    $scope.btn_add = function() {
        if($scope.txtcomment !=''){
//        $scope.comment.push($scope.txtcomment);
          pushChat($scope.txtcomment);
        $scope.txtcomment = "";
          Team.get({tslug: $routeParams.tslug, eslug: 'goa-hack'}, function(team)
        {
          $scope.team = team;
          $scope.team.chat = team.chat;
        });
        }
    }

//    $scope.remItem = function($index) {
//        $scope.comment.splice($index, 1);
//    }
    
  var pushChat = function (abc){
  $http({
      url : '/api/event/goa-hack/team/' + $routeParams.tslug +'/chat',
      method : 'POST',
      data : {
        description : abc
      }
    }).success(function(data, status, headers, config) {
    console.log("added");
    console.log(abc);

  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
          console.log("failed");

  });
  };
});
