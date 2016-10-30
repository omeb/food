// declare a module
var app = angular.module('foodApp', ["firebase",'ngRoute', "ngSanitize", "ngCsv"]);
app.config(['$routeProvider', function($routeProvider){
    $routeProvider
    .when('/',{
        templateUrl: './login.html' 
    })
    .when('/loggedIn',{
        templateUrl: './main.html' 
    })
    .when('/loggedOut',{
        templateUrl: './loggedout.html' 
    })
    .otherwise({redirectTo:'/'});
}]);

// app.config(['$locationProvider', function ($locationProvider){}]);
app.factory('authService', authService);

authService.$inject = ['$location'];

function authService($location) {
    var self = this;
    var factory = {};
    factory.authToFireBase = function(username, password) {
        self.username = username;
        self.password = password;
        firebase.auth().signInWithEmailAndPassword(self.username, self.password)
        .then(function(){
            $location.path('loggedIn');
            return true;
        })
        .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('email authentication failed...');
        self.error = true;
        return false;
        // ...
        });
    };

    factory.disconnectFromFireBase = function() {
        firebase.auth().signOut().then(function() {
        console.log('Signed Out');
        $location.path('/loggedOut');
        }, function(error) {
        console.error('Sign Out Error', error);
});
    };
    return factory;
};

app.controller('mainCtrl', ['$scope', '$firebaseObject', '$timeout', '$location', '$interval', 'authService', function($scope, $firebaseObject, $timeout, $location, $interval, authService) {
    $scope.authService = authService;
    $scope.error = false;
    var now = new Date();
    $scope.today = now.getDate() + '.' + (now.getMonth()+1) + '.' + now.getFullYear() + '_' + now.getHours() + '-' + now.getMinutes();
    
    $scope.deleteAllLabel = 'לחצו למחיקת כלל הנתונים';
    $scope.currentView = 'home';

    $scope.setView = function (view) {
        $scope.currentView = view;
    }
    $timeout(function(){
        $scope.showEverything = true;
    },1000);
    // get data after authentication 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            $scope.username = user.email;
            console.log('user logged in with user: ' + $scope.username + ' and ID: ' + uid);
            if($location.path() === '/');
                $location.path('loggedIn');
            $scope.name = $scope.username.substring(0, $scope.username.indexOf('@'));
        var DataRef = firebase.database().ref('/user' + $scope.name).once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            if(!$scope.data) {
                 $scope.createDB();
                 $scope.data = snapshot.val();
            }
            $scope.$digest();
        });

        } else {
            console.log('user signed out...');
            if($location.path() === 'loggedOut');
            $timeout(function(){
                $location.path('/');
            },3000);
            // User is signed out.
        }
    });
    
    $scope.startTime = function () {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        $scope.todayForDisplay = now.getDate() + '.' + (now.getMonth()+1) + '.' + now.getFullYear() + ' ' + h + ":" + m + ":" + s;
        $timeout($scope.startTime, 1000);
    }
    
    function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    $scope.startTime();


    $scope.increase = function(enterance) {
        $scope.data[enterance].counter++;
        $scope.updateData(enterance, 'Entered');
    }


    $scope.decrease = function(enterance) {
        if($scope.data[enterance].counter > 1) {
            $scope.data[enterance].counter--;
        }
        $scope.updateData(enterance, 'Left');
    }

    $scope.reset = function(enterance) {
        $scope.data[enterance].counter = 0;
        $scope.commit(enterance);
    }

    $scope.resetAll = function() {

        if ($scope.deleteAllLabel == 'לחצו שוב לאישור מחיקה') {
            $scope.createDB();


        var DataRef = firebase.database().ref('/user').once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            $scope.$digest();
        });


            $scope.deleteAllLabel = 'לחצו למחיקת כלל הנתונים';
            $scope.warnDelete = false;
            $scope.dataDeleted = true;
            $timeout(function(){
                $scope.dataDeleted = false;
            },4000);

        }
        else {
            $scope.deleteAllLabel = 'לחצו שוב לאישור מחיקה';
            $scope.warnDelete = true;
            $timeout(function(){
                $scope.deleteAllLabel = 'לחצו למחיקת כלל הנתונים';
                $scope.warnDelete = false;
            },2000);
        }
            
    }

    $scope.updateData = function(enterance, action) {
        var timeStamp = $scope.generateTimestamp(action);
        if ($scope.data[enterance].instances)
            $scope.data[enterance].instances.push(timeStamp);
        else {
            var instances = [timeStamp];
            $scope.data[enterance].instances = instances;
        }
            $scope.commit(enterance);
    }

    $scope.generateTimestamp = function(action) {
        var now = new Date();
        var date = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear();
        var time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        var timeStamp = {
            action: action,
            fullTime: now.toString(),
            date: date,
            time: time
        };
        return timeStamp;
    }

     $scope.createDB = function () {

        $scope.entrance1 = {
            id: 'entrance1',
            name: 'כניסה 1',
            counter: 0,
            instances: []
        };
        $scope.entrance2 = {
            id: 'entrance2',
            name: 'כניסה 2',
            counter: 0,
            instances: []
        };

        $scope.entrance3 = {
            id: 'entrance3',
            name: 'כניסה 3',
            counter: 0,
            instances: []
        };


        firebase.database().ref('/user'+ $scope.name + '/entrance1/').set($scope.entrance1);
        firebase.database().ref('/user'+ $scope.name + '/entrance2/').set($scope.entrance2);
        firebase.database().ref('/user'+ $scope.name + '/entrance3/').set($scope.entrance3);
    }
 
    $scope.commit = function (enterance) {
        firebase.database().ref('/user'+ $scope.name + '/'+ enterance +'/').set($scope.data[enterance]);
        
         var DataRef = firebase.database().ref('/user' + $scope.name).once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            $scope.$digest();
        });
    };
    
    $scope.goToLogin = function () {
        $location.path('/');
    };

    $scope.login = function () {
        $scope.error = false;
        if ($scope.usernameInput && $scope.passwordInput) {
            $scope.authService.authToFireBase($scope.usernameInput, $scope.passwordInput)
        }
        $timeout(function(){
            $scope.error = true;
        },3000);
    };

    $scope.logOut = function () {
        authService.username = '';
        $scope.username = '';
        $scope.authService.disconnectFromFireBase();
    };

    $interval( function () {
        var DataRef = firebase.database().ref('/user' + $scope.name).once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            $scope.$digest();
        });
    },3000) 

}]);