// declare a module
var app = angular.module('foodApp', ["firebase", "ngSanitize", "ngCsv"]);

// app.config(['$locationProvider', function ($locationProvider){}]);

app.controller('mainCtrl', ['$scope', '$firebaseObject', '$timeout','$interval', function($scope, $firebaseObject, $timeout, $interval) {
    
    var now = new Date();
    $scope.today = now.getDate() + '.' + (now.getMonth()+1) + '.' + now.getFullYear() + '_' + now.getHours() + '-' + now.getMinutes();
    
    $scope.deleteAllLabel = 'לחצו למחיקת כלל הנתונים';
    $scope.currentView = 'home';

    $scope.setView = function (view) {
        $scope.currentView = view;
    }
    firebase.auth().signInWithEmailAndPassword('mishko.meteor@gmail.com', '123456').catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    });

    // get data after authentication 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            console.log('user logged in with ID: ' + uid);
        var DataRef = firebase.database().ref('/').once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            if(!$scope.data) {
                 $scope.createDB();
                 $scope.data = snapshot.val();
            }
            $scope.$digest();
        });

        } else {
            console.log('user signed out...');
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


        var DataRef = firebase.database().ref('/').once('value').then(function(snapshot) {
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


        firebase.database().ref('/entrance1/').set($scope.entrance1);
        firebase.database().ref('/entrance2/').set($scope.entrance2);
        firebase.database().ref('/entrance3/').set($scope.entrance3);
    }
 
    $scope.commit = function (enterance) {
        firebase.database().ref('/'+ enterance +'/').set($scope.data[enterance]);
        
         var DataRef = firebase.database().ref('/').once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            $scope.$digest();
        });
    };

    $interval( function () {
        var DataRef = firebase.database().ref('/').once('value').then(function(snapshot) {
            $scope.data = snapshot.val();
            $scope.$digest();
        });
    },2000) 

}]);