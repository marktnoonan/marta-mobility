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
    $data[] = $this['scraper']->getData();
    $response = $response->withJson($data);
    return $response;
});

$app->get('/logout', function($request, $response, $args) {
    $this['auth']->logout();
    $response = $response->withStatus(204);
    return $response;
});

$app->run();