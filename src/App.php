<?php

namespace Paratransit;

session_start();

require_once __DIR__ . '/../vendor/autoload.php';

$config = include __DIR__ . '/Settings.php';
date_default_timezone_set('America/New_York');

$app = new \Slim\App($config);

$container = $app->getContainer();

$container['auth'] = function($c) {
    return new Auth($c);
};

$container['curl'] = function($c) {
    $userAgent = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.2309.372 Safari/537.36';    
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_USERAGENT, $userAgent);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    return $curl;
};

$container['scraper'] = function($c) {
    return new MartaScraper($c);
};

//add middleware
$app->add(new Middleware\AuthMiddleware($app->getContainer()));
$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

$app->post('/login', function ($request, $response, $args) {
    $data = $this['scraper']->getData();
    $response = $response->withJson($data);
    return $response;
});

$app->get('/logout', function($request, $response, $args) {
    $this['auth']->logout();
    $response = $response->withStatus(204);
    return $response;
});

$app->post('/test', function ($request, $response, $args) {
    $res = '{"clientName":"JOANNA M CUSTOMER","cancelled checker":true,"Past trip found":false,"bookings":[{"displayDate":"Saturday","date":"10-29-2016","iteratorDate":0,"eta":"07:22","displayEta":"7:22 AM","iteratorreadynugget":0,"readyTime":"06:55","displayReadyTime":"6:55 AM","iteratorreadyTime":0,"displayEndWindow":"7:25 AM","endWindow":"07:25","Status":"Scheduled","pickupAddress":"(CLIENT HOME ADDRESS)","iteratorLocation":0,"dropOffAddress":"JOB LOCATION","currentDay":"09-15-2017","currentTimeInMinutes":1290,"etaInMinutes":442,"math":true},{"displayDate":"Sunday","date":"10-30-2016","iteratorDate":1,"eta":"06:55","displayEta":"6:55 AM","iteratorreadynugget":1,"readyTime":"06:55","displayReadyTime":"6:55 AM","iteratorreadyTime":1,"displayEndWindow":"7:25 AM","endWindow":"07:25","Status":"Scheduled","pickupAddress":"(CLIENT HOME)","iteratorLocation":1,"dropOffAddress":"JOB LOCATION","currentDay":"09-15-2017","currentTimeInMinutes":1290,"etaInMinutes":415,"math":true},{"displayDate":"Wednesday","date":"11-02-2016","iteratorDate":2,"eta":"06:55","displayEta":"6:55 AM","iteratorreadynugget":2,"readyTime":"06:55","displayReadyTime":"6:55 AM","iteratorreadyTime":2,"displayEndWindow":"7:25 AM","endWindow":"07:25","Status":"Scheduled","pickupAddress":"(CLIENT HOME) ","iteratorLocation":2,"dropOffAddress":"JOB LOCATION","currentDay":"09-15-2017","currentTimeInMinutes":1290,"etaInMinutes":415,"math":true}],"Pick Up location data":"-82340912","Pickup Long":"-82340912","updatedAt":"9:30 PM"}';
    $response = $response->withHeader('Content-Type', 'application/json;charset=utf-8');
    $response->getBody()->write($res);
    return $response;
});

$app->run();