var request = require("request");
var moment = require("moment");
var Promise = require("bluebird");
var _=require("lodash");
var fs=require("fs");
var iconv=require("iconv-lite");
var cheerio=require("cheerio");
var BufferHelper=require("bufferhelper");
try{
   var unzip=require("zlib").unzip;
} catch(e){
    console.log("unzip module wasn't imported successfully");
    process.exit(0);
}
var headers = {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    //'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36',
    //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    'Referer': 'http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-18&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=1&pageStatus=0&passHolders=0&from=ITFLR&to=ITVCE&arriveDate=2017-03-22',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept':'',
    'Accept-Encoding':'gzip,deflate',
    'Accept-Language':'zh-CN,zh;q=0.8',
    'Cache-Control':'',
    'Connection':'keep-alive',
    'cookie':'_abtest_userid=3e252dcf-7643-482c-8ad5-f0845e0f2a74; ASP.NET_SessionSvc=MTAuOC4xODkuNTR8OTA5MHxqaW5xaWFvfGRlZmF1bHR8MTQ3MTUwNDI1OTg0Mg; ASP.NET_SessionId=agopzvov5ohedrs0zdu55hoa; adscityen=Beijing; ticket_ctrip=uoeOwviAJ6VQEgTNwLuTqSV9j/bS+aOP3Riia1P+kyQbgkQZsD2giehAWkOA7qQ+wHWYB7JtoSuCqr73XEjxSBnCtIVH36wi9wUOUju9QiZMwbUKGysMpVHOTPYJo6s61nXOtGMmRv0KDsb3Bekeaj9VwCxnKr7akuUvLD/H12rFF8pOWAsNsRVMtXbs1YKvKG3TbAR7RBd6gOBLQdZIZrfDaJtnnXU8xRZSDr80ITYaGrRXV/KGuuUbgx+O73XbJvhzaGQsW1VIyhRaslPbqDrywWkrZ/qsO4ueXwSuH4isNlhwZN/53Q==; corpid=; corpname=; CtripUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; AHeadUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; SMBID=; LoginStatus=1%7c; tempUserLogin=T; TrainLastSearch=%E5%8C%97%E4%BA%AC%7Cbeijing%7C%E4%B8%8A%E6%B5%B7%7Cshanghai%7C2017-03-18%7C; TraceSession=1451521420; _fpacid=09031043210019641766; GUID=09031043210019641766; Union=SID=155952&AllianceID=4897&OUID=baidu81|index|||; Session=SmartLinkCode=U155952&SmartLinkKeyWord=&SmartLinkQuary=&SmartLinkHost=&SmartLinkLanguage=zh; traceExt=campaign=CHNbaidu81&adid=index; page_time=1489559543235%2C1489559547762%2C1489559548513%2C1489569337844%2C1489570217990%2C1489570256117%2C1489570318281%2C1489572762704%2C1489572775128%2C1489572839938%2C1489628834337%2C1489628834338%2C1489644770923%2C1489644774440%2C1489644824571%2C1489645171086%2C1489645172819%2C1489645392927%2C1489645531433%2C1489645538158%2C1489650372322%2C1489650378841%2C1489650382558%2C1489650471314%2C1489650597308; _RGUID=0883465b-2c62-4622-8e16-4dbf4ebd6416; _ga=GA1.2.565403800.1489545937; __zpspc=9.8.1489650374.1489650599.5%231%7Cbaidu%7Ccpc%7Cbaidu81%7C%25E6%2590%25BA%25E7%25A8%258B%7C%23; _jzqco=%7C%7C%7C%7C1489644772148%7C1.666514546.1489545939901.1489650473674.1489650599882.1489650473674.1489650599882.undefined.0.0.36.36; MKT_Pagesource=PC; appFloatCnt=13; pageChanel=onlineV2; _bfa=1.1489545933704.2loiy.1.1489644769265.1489649709842.8.51; _bfs=1.9; _bfi=p1%3D103112%26p2%3D103112%26v1%3D51%26v2%3D50',
    'Host':'rails.ctrip.com',
    'Origin':'http://rails.ctrip.com',
    'Pragma':'no-cache'
};


//let {originPlace, destination, leaveDate} = params;
var originPlace = { name: "北京" };
var destination = { name: "上海" };
//headers.Referer="http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-18&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=1&pagestatus=0&passHolders=0&from=ITFLR&to=ITVCE&arriveDate=2017-03-22";
//headers.Referer="http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-18&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=1&pageStatus=0&passHolders=0&from=ITFLR&to=ITVCE&arriveDate=2017-03-22";


var leaveDate = moment("20170328").format();
var CREATE_CLIENT_ID_URL ='http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-23&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=0&pageStatus=0&passHolders=0&from=FRPAR&to=FRNCE&arriveDate=';
//var CREATE_CLIENT_ID_URL = 'http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-23&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=0&pageStatus=0&passHolders=0&from=FRPAR&to=FRNCE&arriveDate=';
var jar = request.jar();
var qs = {
    'systemcode': '09',
    'createtype': '3',
    'head[cid]': '',
    'head[ctok]': '',
    'head[cver]': 1.0,
    'head[lang]': '01',
    'head[sid]': '8888',
    'head[syscode]': '09',
    'head[auth]': 'null',
    'head[extension][0][name]': 'protocal',
    'head[extension][0][value]': 'http',
    'contentType': 'json'
};
var startDate="2017-3-18";
var backDate="2017-03-22";

var formData={
    "StartTime":"06:00",
    "BackTime":"06:00",
    "StartDate":"2017-3-18",
    "BackDate":"2017-03-22",
    "StartCityCode":"ITFLR",
    "ArriveCityCode":"ITVCE",
    "PassengerType":{
        "AdultCount":"1",
        "YouthCount":"0",
        "ChildCount":"0",
        "OldCount":"0"
    },
    "PassHolders":"0",
    "LastStartDate":"",
    "StartCityName":"佛罗伦萨",
    "ArrivalCityName":"威尼斯",
    "TrvelType":2,
    "PageLoadGUID":"749B3179428C4F89B7BE309346F19A3E"
};
//获取clientID
//var clientId = await;
//url: CREATE_CLIENT_ID_URL,
function fetchClientId(){
  return new Promise(function(resolve,reject) {
        
        request.get({
            //uri:'http://rails.ctrip.com/international/Ajax/QueryREStopInfo.ashx?StopCode=ITFNO',  //该网址用于获取火车站的具体信息及提示。
            uri: 'http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-23&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=0&pageStatus=0&passHolders=0&from=FRPAR&to=FRNCE&arriveDate=',
            headers: headers,
            gzip:true
        }, function (err, res,body) {
            if (err) return resolve(err);

            //fs.writeFileSync("./file.txt",JSON.stringify(res.body));
            //console.log(body);
            //console.log("hello world");

            let result=iconv.decode(body,"gb2312").toString();
            //console.log("body: ",result);
            //let file=fs.readFileSync("./file.txt","utf-8");
            //console.log(file);
            var $=cheerio.load(result);
            let nodes=$("#PageLoadGUID");
            console.log("nodes' length: ",nodes.length);
            let i=0;

            var value;
            $('#PageLoadGUID').each(function(idx,item){
                console.log("idx: ",idx);
                //console.log("item: ",item);
                let node=$(item).toString();
                value=$(item).attr("value");
                console.log(value);
                console.log();
            });
            //console.log(value);
            resolve(value);
        // if (err)
        //     return reject(err);
        // var bufferHelper=new BufferHelper();
        // res.on("data",function(chunk){
        //     bufferHelper.concat(chunk);
        //     console.log("chunk");

        // });
          
        // res.on("end",function(){
        //    var body = res.body;

        //    var isCompressed=/gzip|deflate/.test(res.headers["content-encoding"]);
        //     if(isCompressed){
        //         console.log("file is compressed");
        //         unzip(bufferHelper.toBuffer(),function(err,buff){
        //             if(!err && buff){
        //                 var result=iconv.decode(buff,"utf-8");
        //                 console.log("this is decoding part");
        //                 console.log(result.body);
        //             }

        //         });

        //     }

        // //console.log(res);
        // //console.log(body.);
        // //console.log(body.ClientID);
    
        // resolve(body || null);

        // });
 

    });

  });

}

var client=fetchClientId();

client.then(function(data){


//console.log("data: ",data);
var clientId=data;
               
var cookieParameter="GUID=09031043210019641766;ASP.NET_SessionSvc=MTAuOC4xODkuNTl8OTA5MHxqaW5xaWFvfGRlZmF1bHR8MTQ3MTQ4NjM0ODUyOA; ASP.NET_SessionId=madnlvfuyiagbyxg20exdxo0; MKT_Pagesource=PC";
console.log(cookieParameter);
var headers2 = {
        //'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36',
        //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
        'Accept':'*/*',
        //'X-Requested-With': 'XMLHttpRequest',
        'Accept-Encoding':'gzip, deflate',//'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*
        'Accept-Language':'zh-CN,zh;q=0.8',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive',//
        //'Content-Length':'640',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',//'application/json',  
        'cookie':cookieParameter,//'GUID=09031043210019641766; ASP.NET_SessionSvc=MTAuOC4xODkuNTl8OTA5MHxqaW5xaWFvfGRlZmF1bHR8MTQ3MTQ4NjM0ODUyOA; ASP.NET_SessionId=madnlvfuyiagbyxg20exdxo0; MKT_Pagesource=PC',
        //'cookie':'_abtest_userid=3e252dcf-7643-482c-8ad5-f0845e0f2a74; ASP.NET_SessionSvc=MTAuOC4xODkuNTR8OTA5MHxqaW5xaWFvfGRlZmF1bHR8MTQ3MTUwNDI1OTg0Mg; ASP.NET_SessionId=agopzvov5ohedrs0zdu55hoa; adscityen=Beijing; ticket_ctrip=uoeOwviAJ6VQEgTNwLuTqSV9j/bS+aOP3Riia1P+kyQbgkQZsD2giehAWkOA7qQ+wHWYB7JtoSuCqr73XEjxSBnCtIVH36wi9wUOUju9QiZMwbUKGysMpVHOTPYJo6s61nXOtGMmRv0KDsb3Bekeaj9VwCxnKr7akuUvLD/H12rFF8pOWAsNsRVMtXbs1YKvKG3TbAR7RBd6gOBLQdZIZrfDaJtnnXU8xRZSDr80ITYaGrRXV/KGuuUbgx+O73XbJvhzaGQsW1VIyhRaslPbqDrywWkrZ/qsO4ueXwSuH4isNlhwZN/53Q==; corpid=; corpname=; CtripUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; AHeadUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; SMBID=; LoginStatus=1%7c; tempUserLogin=T; TrainLastSearch=%E5%8C%97%E4%BA%AC%7Cbeijing%7C%E4%B8%8A%E6%B5%B7%7Cshanghai%7C2017-03-18%7C; TraceSession=1451521420; _fpacid=09031043210019641766; GUID=09031043210019641766; Union=SID=155952&AllianceID=4897&OUID=baidu81|index|||; Session=SmartLinkCode=U155952&SmartLinkKeyWord=&SmartLinkQuary=&SmartLinkHost=&SmartLinkLanguage=zh; traceExt=campaign=CHNbaidu81&adid=index; page_time=1489559543235%2C1489559547762%2C1489559548513%2C1489569337844%2C1489570217990%2C1489570256117%2C1489570318281%2C1489572762704%2C1489572775128%2C1489572839938%2C1489628834337%2C1489628834338%2C1489644770923%2C1489644774440%2C1489644824571%2C1489645171086%2C1489645172819%2C1489645392927%2C1489645531433%2C1489645538158%2C1489650372322%2C1489650378841%2C1489650382558%2C1489650471314%2C1489650597308; _RGUID=0883465b-2c62-4622-8e16-4dbf4ebd6416; _ga=GA1.2.565403800.1489545937; __zpspc=9.8.1489650374.1489650599.5%231%7Cbaidu%7Ccpc%7Cbaidu81%7C%25E6%2590%25BA%25E7%25A8%258B%7C%23; _jzqco=%7C%7C%7C%7C1489644772148%7C1.666514546.1489545939901.1489650473674.1489650599882.1489650473674.1489650599882.undefined.0.0.36.36; MKT_Pagesource=PC; appFloatCnt=13; pageChanel=onlineV2; _bfa=1.1489545933704.2loiy.1.1489644769265.1489649709842.8.51; _bfs=1.9; _bfi=p1%3D103112%26p2%3D103112%26v1%3D51%26v2%3D50',
        'Host':'rails.ctrip.com',
        'If-Modified-Since':'Thu, 01 Jan 1970 00:00:00 GMT',
        'Origin':'http://rails.ctrip.com',
        'Pragma':'no-cache',
        'Referer':'http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-23&starttime=&adult=2&child=0&youth=0&seniors=0&searchType=0&pageStatus=0&passHolders=0&from=FRPAR&to=ITFLR&arriveDate=',
        //'Referer': 'http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-18&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=1&pageStatus=0&passHolders=0&from=ITFLR&to=ITVCE&arriveDate=2017-03-22',
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
                      
};  


console.log(data);


var QueryParam={
    StartTime:"06:00",
    BackTime:"06:00",
    StartDate:"2017-3-23",
    BackDate:"2017-03-26",
    StartCityCode:"FRPAR",
    ArriveCityCode:"ITFLR",
    PassengerType:{
        AdultCount:"2",
        YouthCount:"0",
        ChildCount:"0",
        OldCount:"0"
    },
    PassHolders:"0",
    LastStartDate:"",
    StartCityName:"巴黎",
    ArrivalCityName:"佛罗伦萨",
    TrvalType:"1",
    PageLoadGUID:data
};
var copy={"StartTime":"06:00","BackTime":"06:00","StartDate":"2017-3-23","BackDate":"2017-03-26","StartCityCode":"FRPAR","ArriveCityCode":"ITFLR","PassengerType":{"AdultCount":"2","YouthCount":"0","ChildCount":"0","OldCount":"0"},"PassHolders":"0","LastStartDate":"","StartCityName":"巴黎","ArrivalCityName":"佛罗伦萨","TrvalType":"1","PageLoadGUID":""};

var URL="http://rails.ctrip.com/international/Ajax/QueryOutiePTPProd.ashx";
/* 
 request({
    headers:headers2,
    uri:URL,
    form:QueryParam,
    method:"POST"
 },*/
 var formData={
    context: {
         QueryParam: JSON.stringify(QueryParam)
    }
 };

 var context={QueryParam: JSON.stringify(QueryParam)};
var formJSON=JSON.stringify(formData);
var contextJSON=JSON.stringify(context);
 console.log(formData.context);
request.post(
    URL,
    {
        headers: headers2,
        //async:true,
        //提交的形式也可以是form:context,
        form:context,
        gzip:true
    },function (err, res,body) {
        if (err)
            console.log(err);
            //return reject(err);
        console.log("response received");
        //console.log("headers: ",res);
        //var body1 = res.body;
        console.log(body);

        /*if (typeof body == 'string') {
            body = JSON.parse(body);
        }*/
        //var trainList = body.ResponseBody.TrainInfoList;
        //console.log("trainList: ",trainList);
        //let result = new SearchTrainTicketResult();
        /*let result;
        if (!trainList || !trainList.length) {
            return resolve(result);
        }*/


    });


});


/*

var headers3 = {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36',
    //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    'Referer': 'http://rails.ctrip.com/international/OutiePTPList.aspx?departureDate=2017-3-18&starttime=&adult=1&child=0&youth=0&seniors=0&searchType=1&pageStatus=0&passHolders=0&from=ITFLR&to=ITVCE&arriveDate=2017-03-22',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept':'',
    //'Accept-Encoding':'gzip,deflate',
    'Accept-Language':'zh-CN,zh;q=0.8',
    'Cache-Control':'',
    'Connection':'keep-alive',
    'cookie':'_abtest_userid=3e252dcf-7643-482c-8ad5-f0845e0f2a74; ASP.NET_SessionSvc=MTAuOC4xODkuNTR8OTA5MHxqaW5xaWFvfGRlZmF1bHR8MTQ3MTUwNDI1OTg0Mg; ASP.NET_SessionId=agopzvov5ohedrs0zdu55hoa; adscityen=Beijing; ticket_ctrip=uoeOwviAJ6VQEgTNwLuTqSV9j/bS+aOP3Riia1P+kyQbgkQZsD2giehAWkOA7qQ+wHWYB7JtoSuCqr73XEjxSBnCtIVH36wi9wUOUju9QiZMwbUKGysMpVHOTPYJo6s61nXOtGMmRv0KDsb3Bekeaj9VwCxnKr7akuUvLD/H12rFF8pOWAsNsRVMtXbs1YKvKG3TbAR7RBd6gOBLQdZIZrfDaJtnnXU8xRZSDr80ITYaGrRXV/KGuuUbgx+O73XbJvhzaGQsW1VIyhRaslPbqDrywWkrZ/qsO4ueXwSuH4isNlhwZN/53Q==; corpid=; corpname=; CtripUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; AHeadUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; SMBID=; LoginStatus=1%7c; tempUserLogin=T; TrainLastSearch=%E5%8C%97%E4%BA%AC%7Cbeijing%7C%E4%B8%8A%E6%B5%B7%7Cshanghai%7C2017-03-18%7C; TraceSession=1451521420; _fpacid=09031043210019641766; GUID=09031043210019641766; Union=SID=155952&AllianceID=4897&OUID=baidu81|index|||; Session=SmartLinkCode=U155952&SmartLinkKeyWord=&SmartLinkQuary=&SmartLinkHost=&SmartLinkLanguage=zh; traceExt=campaign=CHNbaidu81&adid=index; page_time=1489559543235%2C1489559547762%2C1489559548513%2C1489569337844%2C1489570217990%2C1489570256117%2C1489570318281%2C1489572762704%2C1489572775128%2C1489572839938%2C1489628834337%2C1489628834338%2C1489644770923%2C1489644774440%2C1489644824571%2C1489645171086%2C1489645172819%2C1489645392927%2C1489645531433%2C1489645538158%2C1489650372322%2C1489650378841%2C1489650382558%2C1489650471314%2C1489650597308; _RGUID=0883465b-2c62-4622-8e16-4dbf4ebd6416; _ga=GA1.2.565403800.1489545937; __zpspc=9.8.1489650374.1489650599.5%231%7Cbaidu%7Ccpc%7Cbaidu81%7C%25E6%2590%25BA%25E7%25A8%258B%7C%23; _jzqco=%7C%7C%7C%7C1489644772148%7C1.666514546.1489545939901.1489650473674.1489650599882.1489650473674.1489650599882.undefined.0.0.36.36; MKT_Pagesource=PC; appFloatCnt=13; pageChanel=onlineV2; _bfa=1.1489545933704.2loiy.1.1489644769265.1489649709842.8.51; _bfs=1.9; _bfi=p1%3D103112%26p2%3D103112%26v1%3D51%26v2%3D50',
    'Host':'rails.ctrip.com',
    'Origin':'http://rails.ctrip.com',
    'Pragma':'no-cache'
};


 var URL = "http://rails.ctrip.com/international/Ajax/QueryOutiePTPProd.ashx";

    var headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    //'User-Agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36',
    //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    'Referer': 'http://rails.ctrip.com/international/PassFamilyIndex.aspx',
    'Content-Type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*,
    'Accept':
    'Accept-Encoding':'gzip, deflate, sdch',//'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*
    'Accept-Language':'zh-CN,zh;q=0.8',
    'Cache-Control':'',
    'Connection':'keep-alive',//
    //'cookie':'_abtest_userid=3e252dcf-7643-482c-8ad5-f0845e0f2a74; ASP.NET_SessionSvc=MTAuOC4xODkuNTR8OTA5MHxqaW5xaWFvfGRlZmF1bHR8MTQ3MTUwNDI1OTg0Mg; ASP.NET_SessionId=agopzvov5ohedrs0zdu55hoa; adscityen=Beijing; ticket_ctrip=uoeOwviAJ6VQEgTNwLuTqSV9j/bS+aOP3Riia1P+kyQbgkQZsD2giehAWkOA7qQ+wHWYB7JtoSuCqr73XEjxSBnCtIVH36wi9wUOUju9QiZMwbUKGysMpVHOTPYJo6s61nXOtGMmRv0KDsb3Bekeaj9VwCxnKr7akuUvLD/H12rFF8pOWAsNsRVMtXbs1YKvKG3TbAR7RBd6gOBLQdZIZrfDaJtnnXU8xRZSDr80ITYaGrRXV/KGuuUbgx+O73XbJvhzaGQsW1VIyhRaslPbqDrywWkrZ/qsO4ueXwSuH4isNlhwZN/53Q==; corpid=; corpname=; CtripUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; AHeadUserInfo=VipGrade=0&UserName=&NoReadMessageCount=0&U=34C219B80E12F73891C8785599CA187F; SMBID=; LoginStatus=1%7c; tempUserLogin=T; TrainLastSearch=%E5%8C%97%E4%BA%AC%7Cbeijing%7C%E4%B8%8A%E6%B5%B7%7Cshanghai%7C2017-03-18%7C; TraceSession=1451521420; _fpacid=09031043210019641766; GUID=09031043210019641766; Union=SID=155952&AllianceID=4897&OUID=baidu81|index|||; Session=SmartLinkCode=U155952&SmartLinkKeyWord=&SmartLinkQuary=&SmartLinkHost=&SmartLinkLanguage=zh; traceExt=campaign=CHNbaidu81&adid=index; page_time=1489559543235%2C1489559547762%2C1489559548513%2C1489569337844%2C1489570217990%2C1489570256117%2C1489570318281%2C1489572762704%2C1489572775128%2C1489572839938%2C1489628834337%2C1489628834338%2C1489644770923%2C1489644774440%2C1489644824571%2C1489645171086%2C1489645172819%2C1489645392927%2C1489645531433%2C1489645538158%2C1489650372322%2C1489650378841%2C1489650382558%2C1489650471314%2C1489650597308; _RGUID=0883465b-2c62-4622-8e16-4dbf4ebd6416; _ga=GA1.2.565403800.1489545937; __zpspc=9.8.1489650374.1489650599.5%231%7Cbaidu%7Ccpc%7Cbaidu81%7C%25E6%2590%25BA%25E7%25A8%258B%7C%23; _jzqco=%7C%7C%7C%7C1489644772148%7C1.666514546.1489545939901.1489650473674.1489650599882.1489650473674.1489650599882.undefined.0.0.36.36; MKT_Pagesource=PC; appFloatCnt=13; pageChanel=onlineV2; _bfa=1.1489545933704.2loiy.1.1489644769265.1489649709842.8.51; _bfs=1.9; _bfi=p1%3D103112%26p2%3D103112%26v1%3D51%26v2%3D50',
    'Host':'rails.ctrip.com',
    'Origin':'http://rails.ctrip.com',
    'Pragma':'no-cache'
};  



        var headers2 = _.cloneDeep(headers);
        headers2.Referer = 'http://m.ctrip.com/webapp/train/v2/index.html?from=http%3A%2F%2Fm.ctrip.com%2Fhtml5%2F';
        var cookieOrigin = 'http://m.ctrip.com';
        headers2['cookieorigin'] = cookieOrigin;
        var cookies = jar.getCookies(cookieOrigin);
        cookies['_fpacid'] = clientId;
        cookies['GUID'] = clientId;
        headers2['cookie'] = cookies;
        var form = {
            "DepartStation": originPlace.name,
            "ArriveStation": destination.name,
            "DepartDate": moment(leaveDate).format('YYYY-MM-DD'),
            "head": {
                "cid": clientId,
                "ctok": "",
                "cver": "1.0",
                "lang": "01",
                "sid": "8888",
                "syscode": "09",
                "auth": null,
                "extension": [
                    { "name": "protocal", "value": "http" }
                ]
            },
            "contentType": "json"
        };

new Promise(function (resolve, reject) {
    request.post({
        uri: URL,
        headers: headers2,
        body: JSON.stringify(form),
        qs: {
            _fxpcqlniredt: clientId
        }
    }, function (err, res) {
        if (err)
            return reject(err);
        var body = res.body;
        if (typeof body == 'string') {
            body = JSON.parse(body);
        }
        var trainList = body.ResponseBody.TrainInfoList;
        console.log("trainList: ",trainList);
        //let result = new SearchTrainTicketResult();
        let result;
        if (!trainList || !trainList.length) {
            return resolve(result);
        }

        //处理火车数据
        /*
        result = trainList.map( (train) => {
            let cabins = train.SeatList.map( (seat) => {
                return {
                    name: ""//getCabinBySeatName(seat.SeatName),
                    price: seat.SeatPrice,
                    remainNum: seat.SeatInventory,
                }
            });
            let duration = train.RunTime;
            let departDateTime = `${moment(leaveDate).format('YYYY-MM-DD')} ${train.DepartTime} +0800`;
            let arrivalDate = moment(departDateTime).add(duration, 'minutes').format('YYYY-MM-DD');
            let arrivalDateTime = `${moment(arrivalDate).format('YYYY-MM-DD')} ${train.ArriveTime} +0800`

            let ticket = new TrainTicket({

                No: train.TrainNumber,   //航班号或者车次
                agents: [
                    {
                        name: "ctrip",
                        cabins: cabins,
                    }
                    ],
                departDateTime: departDateTime,
                arrivalDateTime: arrivalDateTime,    //到达时间
                originPlace: originPlace,  //出发城市
                destination: destination,    //目的地
                duration: duration,
                originStation: train.DepartStation, //出发机场或者车站
                destinationStation: train.ArriveStation,   //目的地机场或者车站
                type: TRAFFIC.TRAIN,
            });
            return ticket;
        }); 
        return resolve(result);
    });
});


*/