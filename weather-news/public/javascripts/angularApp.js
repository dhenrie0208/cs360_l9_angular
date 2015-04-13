angular.module('weatherNews', ['ui.router'])
.factory('postFactory', ['$http', function($http) {
  var o = {
    posts: [],
    post: {}
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.create = function(post) {
    return $http.post('/posts', post).success(function(data){
      o.posts.push(data);
    });
  };
  o.upvote = function(post) {                           // (16a)
    return $http.put('/posts/' + post._id + '/upvote')  // (16a)
      .success(function(data){                          // (16a)
        post.upvotes += 1;                              // (16a)
      });                                               // (16a)
  };                                                    // (16a)
  o.getPost = function(id) {
    return $http.get('/posts/' + id).success(function(data){
      angular.copy(data, o.post);
    });
  };
  o.addNewComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment);
  };
  o.upvoteComment = function(selPost, comment) {
    return $http.put('/posts/' + selPost._id + '/comments/'+ comment._id + '/upvote')
      .success(function(data){
        comment.upvotes += 1;
      });
  };
  return o;
}])
.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl'
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostCtrl'
      });
    $urlRouterProvider.otherwise('home');
}])
.controller('MainCtrl', [
  '$scope',
  'postFactory',
  function($scope, postFactory){
    postFactory.getAll();
    $scope.posts = postFactory.posts;
/*function($scope){
    $scope.test = 'Hello world!';
    $scope.posts = [
      {title:'Post 1', upvotes:5},
      {title:'Post 2', upvotes:6},
      {title:'Post 3', upvotes:1},
      {title:'Post 4', upvotes:4},
      {title:'Post 5', upvotes:3}
    ];*/
    $scope.addPost = function(){
      if($scope.formContent === '') { return; }
      /*$scope.posts.push({     // commented out (15b, see Digital Dialog - Mark Clement's Mar 26 8:58 PM post)
        title: $scope.formContent, 
        upvotes: 0,
        comments: [
        ]
      });*/
      postFactory.create({      // from (15b, see Digital Dialog - Mark Clement's Mar 26 8:58 PM post)
        title: $scope.formContent,
        upvotes: 0,             // inferred
        comments: []            // inferred
      });
      $scope.formContent = '';  // added back in (15b)
      //$scope.title = '';      // (15b, see Digital Dialog - Mark Clement's Mar 26 8:58 PM post)
    };
    $scope.incrementUpvotes = function(post) {
      postFactory.upvote(post); // (16b)
    };
  }
])
.controller('PostCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  'postFactory',
  function($scope, $state, $stateParams, postFactory){
    var mypost = postFactory.posts[$stateParams.id];    // (17d)
    console.log(mypost);   // (20)
    if(!mypost)
    {
      $state.go('home');
    }
    else
    {
      postFactory.getPost(mypost._id);                    // (17d)
      //$scope.post = postFactory.posts[$stateParams.id]; // (17d)
      $scope.post = postFactory.post;                     // (17d)
      $scope.addComment = function(){
        if($scope.body === '') { return; }
        postFactory.addNewComment(postFactory.post._id, {
          body: $scope.body,
          upvotes: 0
        }).success(function(comment) {
          mypost.comments.push(comment); // Update the version in the array
          postFactory.post.comments.push(comment);// Update the version in the view
        });
        /*$scope.post.comments.push({
          body: $scope.body,
          upvotes: 0
        });*/
        $scope.body = '';
      };
      $scope.incrementUpvotes = function(comment){
        console.log("incrementUp "+postFactory.post._id+" comment "+comment._id);
        postFactory.upvoteComment(postFactory.post, comment);
      };
    }
  }
]);