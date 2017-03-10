/**
 * Created by jack on 2017/3/8.
 */

export async function CreateController($scope,$ionicPopup, $location) {
    $scope.tripType={};  //type hasn't been decided
    $scope.noticeAgain=false;
    $scope.notify=function(){
        $scope.noticeAgain=true;
    }
    $scope.submitType=function(){
        if(!$scope.tripType){
            $ionicPopup.alert();

        }
        //调用远程接口进行数据存储

        $location.url("#/trip/create.html");


    }




}